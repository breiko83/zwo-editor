import Builder from 'xmlbuilder'
import helpers from '../components/helpers'
import { Workout } from '../types/Workout'

export default function createWorkoutXml({ author, name, description, sportType, tags, intervals, instructions }: Workout): string {
  var totalDuration = 0

  let xml = Builder.begin()
    .ele('workout_file')
    .ele('author', author).up()
    .ele('name', name).up()
    .ele('description', description).up()
    .ele('sportType', sportType).up()
    .ele('tags')

  tags.forEach((tag: string) => {
    var t: Builder.XMLNode
    t = Builder.create('tag')
      .att('name', tag)
    xml.importDocument(t)
  })

  xml = xml.up().ele('workout')

  intervals.forEach((interval, index) => {
    var segment: Builder.XMLNode
    var ramp

    if (interval.type === 'steady') {
      segment = Builder.create('SteadyState')
        .att('Duration', interval.duration)
        .att('Power', interval.intensity)
        .att('pace', interval.pace)

      // add cadence if not zero
      interval.cadence !== 0 && segment.att('Cadence', interval.cadence)

    } else if (interval.type === 'ramp' && interval.startIntensity && interval.endIntensity) {

      // index 0 is warmup
      // last index is cooldown
      // everything else is ramp

      ramp = 'Ramp'
      if (index === 0) ramp = 'Warmup'
      if (index === intervals.length - 1) ramp = 'Cooldown'

      if (interval.startIntensity < interval.endIntensity) {
        // warmup
        segment = Builder.create(ramp)
          .att('Duration', interval.duration)
          .att('PowerLow', interval.startIntensity)
          .att('PowerHigh', interval.endIntensity)
          .att('pace', interval.pace)
        // add cadence if not zero
        interval.cadence !== 0 && segment.att('Cadence', interval.cadence)
          
      } else {
        // cooldown
        segment = Builder.create(ramp)
          .att('Duration', interval.duration)
          .att('PowerLow', interval.startIntensity) // these 2 values are inverted
          .att('PowerHigh', interval.endIntensity) // looks like a bug on zwift editor            
          .att('pace', interval.pace)
        // add cadence if not zero
        interval.cadence !== 0 && segment.att('Cadence', interval.cadence)
      }
    } else if (interval.type === 'repetition') {
      // <IntervalsT Repeat="5" OnDuration="60" OffDuration="300" OnPower="0.8844353" OffPower="0.51775455" pace="0"/>
      segment = Builder.create('IntervalsT')
        .att('Repeat', interval.repeat)
        .att('OnDuration', interval.onDuration)
        .att('OffDuration', interval.offDuration)
        .att('OnPower', interval.onIntensity)
        .att('OffPower', interval.offIntensity)
        .att('pace', interval.pace)        
        // add cadence if not zero
        interval.cadence !== 0 && segment.att('Cadence', interval.cadence)
        // add cadence resting if not zero
        interval.restingCadence !== 0 && segment.att('CadenceResting', interval.restingCadence)        
    } else {
      // free ride
      segment = Builder.create('free')
        .att('Duration', interval.duration)
        .att('FlatRoad', 0) // Not sure what this is for
      // add cadence if not zero
      interval.cadence !== 0 && segment.att('Cadence', interval.cadence)
    }

    // add instructions if present
    instructions.filter((instruction) => (instruction.time >= totalDuration && instruction.time < (totalDuration + helpers.getIntervalDuration(interval)))).forEach((i) => {
      segment.ele('textevent', { timeoffset: (i.time - totalDuration), message: i.text })
    })

    xml.importDocument(segment)

    totalDuration += helpers.getIntervalDuration(interval)
  })

  return xml.end({ pretty: true });
}
