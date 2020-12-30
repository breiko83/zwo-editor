import Builder from 'xmlbuilder'
import { Instruction, SportType, DurationType } from '../components/Editor/Editor'
import { Interval } from '../components/Interval'

interface Workout {
  author: string;
  name: string;
  description: string;
  sportType: SportType;
  durationType: DurationType;
  tags: string[];
  intervals: Array<Interval>;
  instructions: Array<Instruction>;
}

export default function createWorkoutXml({ author, name, description, sportType, durationType, tags, intervals, instructions }: Workout): string {
  var totalTime = 0
  var totalLength = 0

  let xml = Builder.begin()
    .ele('workout_file')
    .ele('author', author).up()
    .ele('name', name).up()
    .ele('description', description).up()
    .ele('sportType', sportType).up()
    .ele('durationType', durationType).up()
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
        .att('Duration', durationType === 'time' ? interval.time : interval.length)
        .att('Power', interval.power)
        .att('pace', interval.pace)

      // add cadence if not zero
      interval.cadence !== 0 && segment.att('Cadence', interval.cadence)

    } else if (interval.type === 'ramp' && interval.startPower && interval.endPower) {

      // index 0 is warmup
      // last index is cooldown
      // everything else is ramp

      ramp = 'Ramp'
      if (index === 0) ramp = 'Warmup'
      if (index === intervals.length - 1) ramp = 'Cooldown'

      if (interval.startPower < interval.endPower) {
        // warmup
        segment = Builder.create(ramp)
          .att('Duration', durationType === 'time' ? interval.time : interval.length)
          .att('PowerLow', interval.startPower)
          .att('PowerHigh', interval.endPower)
          .att('pace', interval.pace)
        // add cadence if not zero
        interval.cadence !== 0 && segment.att('Cadence', interval.cadence)
          
      } else {
        // cooldown
        segment = Builder.create(ramp)
          .att('Duration', durationType === 'time' ? interval.time : interval.length)
          .att('PowerLow', interval.startPower) // these 2 values are inverted
          .att('PowerHigh', interval.endPower) // looks like a bug on zwift editor            
          .att('pace', interval.pace)
        // add cadence if not zero
        interval.cadence !== 0 && segment.att('Cadence', interval.cadence)
      }
    } else if (interval.type === 'repetition') {
      // <IntervalsT Repeat="5" OnDuration="60" OffDuration="300" OnPower="0.8844353" OffPower="0.51775455" pace="0"/>
      segment = Builder.create('IntervalsT')
        .att('Repeat', interval.repeat)
        .att('OnDuration', durationType === 'time' ? interval.onDuration : interval.onLength)
        .att('OffDuration', durationType === 'time' ? interval.offDuration : interval.offLength)
        .att('OnPower', interval.onPower)
        .att('OffPower', interval.offPower)
        .att('pace', interval.pace)        
        // add cadence if not zero
        interval.cadence !== 0 && segment.att('Cadence', interval.cadence)
        // add cadence resting if not zero
        interval.restingCadence !== 0 && segment.att('CadenceResting', interval.restingCadence)        
    } else {
      // free ride
      segment = Builder.create('free')
        .att('Duration', interval.time)
        .att('FlatRoad', 0) // Not sure what this is for
      // add cadence if not zero
      interval.cadence !== 0 && segment.att('Cadence', interval.cadence)
    }

    // add instructions if present
    if (durationType === 'time') {
      instructions.filter((instruction) => (instruction.time >= totalTime && instruction.time < (totalTime + interval.time))).forEach((i) => {
        segment.ele('textevent', { timeoffset: (i.time - totalTime), message: i.text })
      })
    } else {
      instructions.filter((instruction) => (instruction.length >= totalLength && instruction.length < (totalLength + (interval.length || 0)))).forEach((i) => {
        segment.ele('textevent', { distoffset: (i.length - totalLength), message: i.text })
      })
    }

    xml.importDocument(segment)

    totalTime = totalTime + interval.time
    totalLength = totalLength + (interval.length || 0)
  })

  return xml.end({ pretty: true });
}
