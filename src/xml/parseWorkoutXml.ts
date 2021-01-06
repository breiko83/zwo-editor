import Converter from 'xml-js';
import { v4 as uuidv4 } from 'uuid'
import intervalFactory from '../interval/intervalFactory';
import { createEmptyWorkout, Workout } from '../types/Workout';
import { Distance, Duration } from '../types/Length';
import { WorkoutMode } from '../modes/WorkoutMode';

export default function parseWorkoutXml(data: string, mode: WorkoutMode): Workout {
  // TODO:
  // - tags not detected from XML
  const workout: Workout = createEmptyWorkout(mode.sportType, mode.lengthType);

  data = data.replace(/<!--(.*?)-->/gm, "")

  const workout_file = Converter.xml2js(data).elements[0]

  if (workout_file.name === 'workout_file') {
    // file is valid
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

    const workoutIndex = workout_file.elements.findIndex((element: { name: string }) => element.name === 'workout')

    var totalTime = 0

    const readLength = (s: string) =>
      workout.lengthType === "time" ? new Duration(parseFloat(s)) : new Distance(parseFloat(s));

    workout_file.elements[workoutIndex].elements.map((w: { name: string; attributes: { Power: any; PowerLow: string; Duration: string; PowerHigh: string; Cadence: string; CadenceResting: string; Repeat: string; OnDuration: string; OffDuration: string; OnPower: string, OffPower: string; Pace: string }; elements: any }) => {

      let duration = parseFloat(w.attributes.Duration)

      if (w.name === 'SteadyState') {
        workout.intervals.push(intervalFactory.steady({
          intensity: parseFloat(w.attributes.Power || w.attributes.PowerLow),
          length: readLength(w.attributes.Duration),
          cadence: parseFloat(w.attributes.Cadence || '0'),
          pace: parseInt(w.attributes.Pace || '0'),
        }, mode))
      }
      if (w.name === 'Ramp' || w.name === 'Warmup' || w.name === 'Cooldown') {
        workout.intervals.push(intervalFactory.ramp({
          startIntensity: parseFloat(w.attributes.PowerLow),
          endIntensity: parseFloat(w.attributes.PowerHigh),
          length: readLength(w.attributes.Duration),
          pace: parseInt(w.attributes.Pace || '0'),
          cadence: parseInt(w.attributes.Cadence),
        }, mode))
      }
      if (w.name === 'IntervalsT') {
        workout.intervals.push(intervalFactory.repetition({
          repeat: parseFloat(w.attributes.Repeat),
          onLength: readLength(w.attributes.OnDuration),
          offLength: readLength(w.attributes.OffDuration),
          onIntensity: parseFloat(w.attributes.OnPower),
          offIntensity: parseFloat(w.attributes.OffPower),
          cadence: parseInt(w.attributes.Cadence || '0'),
          restingCadence: parseInt(w.attributes.CadenceResting),
          pace: parseInt(w.attributes.Pace || '0'),
        }, mode))
        duration = (parseFloat(w.attributes.OnDuration) + parseFloat(w.attributes.OffDuration)) * parseFloat(w.attributes.Repeat)
      }
      if (w.name === 'free') {
        workout.intervals.push(intervalFactory.free({
          length: readLength(w.attributes.Duration),
          cadence: parseInt(w.attributes.Cadence),
        }, mode))
      }

      // check for instructions
      const textElements = w.elements
      if (textElements && textElements.length > 0) {
        textElements.forEach((t: { name: string; attributes: { message: string | undefined; timeoffset: string } }) => {
          if (t.name.toLowerCase() === 'textevent')
            workout.instructions.push({
              text: t.attributes.message || '',
              // TODO: move parseFloat out of readLength
              offset: readLength("" + (totalTime + parseFloat(t.attributes.timeoffset))),
              id: uuidv4()
            });
        })
      }

      totalTime = totalTime + duration
      // map functions expect return value
      return false
    })
  }

  return workout;
}
