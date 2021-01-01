import Converter from 'xml-js';
import { v4 as uuidv4 } from 'uuid'
import intervalFactory from '../components/intervalFactory';
import { Workout } from './Workout';

export default function parseWorkoutXml(data: string): Workout {
  const workout: Workout = {
    author: "",
    name: "",
    description: "",
    sportType: "bike", // TODO: not detected from XML
    tags: [], // TODO: not detected from XML
    intervals: [],
    instructions: [],
  };

  data = data.replace(/<!--(.*?)-->/gm, "")

  const workout_file = Converter.xml2js(data).elements[0]

  if (workout_file.name === 'workout_file') {
    // file is valid
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

    workout_file.elements[workoutIndex].elements.map((w: { name: string; attributes: { Power: any; PowerLow: string; Duration: string; PowerHigh: string; Cadence: string; CadenceResting: string; Repeat: string; OnDuration: string; OffDuration: string; OnPower: string, OffPower: string; Pace: string }; elements: any }) => {

      let duration = parseFloat(w.attributes.Duration)

      if (w.name === 'SteadyState') {
        workout.intervals.push(intervalFactory.steady({
          power: parseFloat(w.attributes.Power || w.attributes.PowerLow),
          duration: parseFloat(w.attributes.Duration),
          cadence: parseFloat(w.attributes.Cadence || '0'),
          pace: parseInt(w.attributes.Pace || '0'),
        }))
      }
      if (w.name === 'Ramp' || w.name === 'Warmup' || w.name === 'Cooldown') {
        workout.intervals.push(intervalFactory.ramp({
          startPower: parseFloat(w.attributes.PowerLow),
          endPower: parseFloat(w.attributes.PowerHigh),
          duration: parseFloat(w.attributes.Duration),
          pace: parseInt(w.attributes.Pace || '0'),
          cadence: parseInt(w.attributes.Cadence),
        }))
      }
      if (w.name === 'IntervalsT') {
        workout.intervals.push(intervalFactory.repetition({
          repeat: parseFloat(w.attributes.Repeat),
          onDuration: parseFloat(w.attributes.OnDuration),
          offDuration: parseFloat(w.attributes.OffDuration),
          onPower: parseFloat(w.attributes.OnPower),
          offPower: parseFloat(w.attributes.OffPower),
          cadence: parseInt(w.attributes.Cadence || '0'),
          restingCadence: parseInt(w.attributes.CadenceResting),
          pace: parseInt(w.attributes.Pace || '0'),
        }))
        duration = (parseFloat(w.attributes.OnDuration) + parseFloat(w.attributes.OffDuration)) * parseFloat(w.attributes.Repeat)
      }
      if (w.name === 'free') {
        workout.intervals.push(intervalFactory.free({
          duration: parseFloat(w.attributes.Duration),
          cadence: parseInt(w.attributes.Cadence),
        }))
      }

      // check for instructions
      const textElements = w.elements
      if (textElements && textElements.length > 0) {
        textElements.forEach((t: { name: string; attributes: { message: string | undefined; timeoffset: string } }) => {
          if (t.name.toLowerCase() === 'textevent')
            workout.instructions.push({
              text: t.attributes.message || '',
              time: totalTime + parseFloat(t.attributes.timeoffset),
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
