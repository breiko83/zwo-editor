import Converter from 'xml-js';
import { v4 as uuidv4 } from 'uuid'
import intervalFactory from '../interval/intervalFactory';
import { createEmptyWorkout, Workout } from '../types/Workout';
import { Distance, Duration } from '../types/Length';
import { WorkoutMode } from '../modes/WorkoutMode';

export default function parseWorkoutXml(data: string, mode: WorkoutMode): Workout {
  const workout: Workout = createEmptyWorkout(mode.sportType, mode.lengthType);

  data = data.replace(/<!--(.*?)-->/gm, "")

  const workout_file = Converter.xml2js(data).elements[0]

  if (workout_file.name !== 'workout_file') {
    throw new Error("Invalid ZWO file");
  }

  const sportTypeIndex = workout_file.elements.findIndex((element: { name: string }) => element.name === 'sportType')
  if (sportTypeIndex !== -1 && workout_file.elements[sportTypeIndex].elements) {
    workout.sportType = workout_file.elements[sportTypeIndex].elements[0].text
  }

  const lengthTypeIndex = workout_file.elements.findIndex((element: { name: string }) => element.name === 'durationType')
  if (lengthTypeIndex !== -1 && workout_file.elements[lengthTypeIndex].elements) {
    workout.lengthType = workout_file.elements[lengthTypeIndex].elements[0].text
  }

  const authorIndex = workout_file.elements.findIndex((element: { name: string }) => element.name === 'author')
  if (authorIndex !== -1 && workout_file.elements[authorIndex].elements) {
    workout.author = workout_file.elements[authorIndex].elements[0].text
  }

  const nameIndex = workout_file.elements.findIndex((element: { name: string }) => element.name === 'name')
  if (nameIndex !== -1 && workout_file.elements[nameIndex].elements) {
    workout.name = workout_file.elements[nameIndex].elements[0].text
  }

  const descriptionIndex = workout_file.elements.findIndex((element: { name: string }) => element.name === 'description')
  if (descriptionIndex !== -1 && workout_file.elements[descriptionIndex].elements) {
    workout.description = workout_file.elements[descriptionIndex].elements[0].text;
  }

  const tagsIndex = workout_file.elements.findIndex((element: { name: string }) => element.name === 'tags')
  if (tagsIndex !== -1 && workout_file.elements[tagsIndex].elements) {
    workout.tags = workout_file.elements[tagsIndex].elements.map(
      (el: { attributes: { name: string } }) => el.attributes.name
    );
  }

  const workoutEl = workout_file.elements.find((element: { name: string }) => element.name === 'workout' && "elements" in element)
  if (!workoutEl) {
    return workout;
  }

  // either meters (distance) or seconds (duration)
  let totalLength = 0

  const readLength = (x: number) =>
    workout.lengthType === "time" ? new Duration(x) : new Distance(x);

  workoutEl.elements.map((w: { name: string; attributes: { Power: any; PowerLow: string; Duration: string; PowerHigh: string; Cadence: string; CadenceResting: string; Repeat: string; OnDuration: string; OffDuration: string; OnPower: string, OffPower: string; pace: string }; elements: any }) => {

    let length = parseFloat(w.attributes.Duration)

    if (w.name === 'SteadyState') {
      workout.intervals.push(intervalFactory.steady({
        intensity: parseFloat(w.attributes.Power || w.attributes.PowerLow),
        length: readLength(parseFloat(w.attributes.Duration)),
        cadence: parseFloat(w.attributes.Cadence || '0'),
        pace: parseInt(w.attributes.pace || '0'),
      }, mode))
    }
    if (w.name === 'Ramp' || w.name === 'Warmup' || w.name === 'Cooldown') {
      workout.intervals.push(intervalFactory.ramp({
        startIntensity: parseFloat(w.attributes.PowerLow),
        endIntensity: parseFloat(w.attributes.PowerHigh),
        length: readLength(parseFloat(w.attributes.Duration)),
        pace: parseInt(w.attributes.pace || '0'),
        cadence: parseInt(w.attributes.Cadence || '0'),
      }, mode))
    }
    if (w.name === 'IntervalsT') {
      workout.intervals.push(intervalFactory.repetition({
        repeat: parseFloat(w.attributes.Repeat),
        onLength: readLength(parseFloat(w.attributes.OnDuration)),
        offLength: readLength(parseFloat(w.attributes.OffDuration)),
        onIntensity: parseFloat(w.attributes.OnPower),
        offIntensity: parseFloat(w.attributes.OffPower),
        onCadence: parseInt(w.attributes.Cadence || '0'),
        offCadence: parseInt(w.attributes.CadenceResting || '0'),
        pace: parseInt(w.attributes.pace || '0'),
      }, mode))
      length = (parseFloat(w.attributes.OnDuration) + parseFloat(w.attributes.OffDuration)) * parseFloat(w.attributes.Repeat)
    }
    if (w.name === 'free') {
      workout.intervals.push(intervalFactory.free({
        length: readLength(parseFloat(w.attributes.Duration)),
        cadence: parseInt(w.attributes.Cadence || '0'),
      }, mode))
    }

    // check for instructions
    const textElements = w.elements
    if (textElements && textElements.length > 0) {
      textElements.forEach((t: { name: string; attributes: { message: string | undefined; timeoffset: string } }) => {
        if (t.name.toLowerCase() === 'textevent')
          workout.instructions.push({
            text: t.attributes.message || '',
            offset: readLength(totalLength + parseFloat(t.attributes.timeoffset)),
            id: uuidv4()
          });
      })
    }

    totalLength = totalLength + length
    // map functions expect return value
    return false
  })

  return workout;
}
