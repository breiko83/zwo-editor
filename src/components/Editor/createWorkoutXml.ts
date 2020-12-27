import Builder from 'xmlbuilder'
import { Bar, Instruction } from './Editor'

interface Workout {
  author: string;
  name: string;
  description: string;
  sportType: string;
  durationType: string;
  tags: string[];
  bars: Array<Bar>;
  instructions: Array<Instruction>;
}

export default function createWorkoutXml({ author, name, description, sportType, durationType, tags, bars, instructions }: Workout): string {
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

  bars.forEach((bar, index) => {
    var segment: Builder.XMLNode
    var ramp

    if (bar.type === 'bar') {
      segment = Builder.create('SteadyState')
        .att('Duration', durationType === 'time' ? bar.time : bar.length)
        .att('Power', bar.power)
        .att('pace', bar.pace)

      // add cadence if not zero
      if (bar.cadence !== 0)
        segment.att('Cadence', bar.cadence)

    } else if (bar.type === 'trapeze' && bar.startPower && bar.endPower) {

      // index 0 is warmup
      // last index is cooldown
      // everything else is ramp

      ramp = 'Ramp'
      if (index === 0) ramp = 'Warmup'
      if (index === bars.length - 1) ramp = 'Cooldown'

      if (bar.startPower < bar.endPower) {
        // warmup
        segment = Builder.create(ramp)
          .att('Duration', durationType === 'time' ? bar.time : bar.length)
          .att('PowerLow', bar.startPower)
          .att('PowerHigh', bar.endPower)
          .att('pace', bar.pace)
      } else {
        // cooldown
        segment = Builder.create(ramp)
          .att('Duration', durationType === 'time' ? bar.time : bar.length)
          .att('PowerLow', bar.startPower) // these 2 values are inverted
          .att('PowerHigh', bar.endPower) // looks like a bug on zwift editor            
          .att('pace', bar.pace)
      }
    } else if (bar.type === 'interval') {
      // <IntervalsT Repeat="5" OnDuration="60" OffDuration="300" OnPower="0.8844353" OffPower="0.51775455" pace="0"/>
      segment = Builder.create('IntervalsT')
        .att('Repeat', bar.repeat)
        .att('OnDuration', durationType === 'time' ? bar.onDuration : bar.onLength)
        .att('OffDuration', durationType === 'time' ? bar.offDuration : bar.offLength)
        .att('OnPower', bar.onPower)
        .att('OffPower', bar.offPower)
        .att('pace', bar.pace)
        
        // add cadence if not zero
        if (bar.cadence !== 0)
          segment.att('Cadence', bar.cadence)
    } else {
      // free ride
      segment = Builder.create('FreeRide')
        .att('Duration', bar.time)
      //.att('Cadence', 85) // add control for this?
    }

    // add instructions if present
    if (durationType === 'time') {
      instructions.filter((instruction) => (instruction.time >= totalTime && instruction.time < (totalTime + bar.time))).forEach((i) => {
        segment.ele('textevent', { timeoffset: (i.time - totalTime), message: i.text })
      })
    } else {
      instructions.filter((instruction) => (instruction.length >= totalLength && instruction.length < (totalLength + (bar.length || 0)))).forEach((i) => {
        segment.ele('textevent', { distoffset: (i.length - totalLength), message: i.text })
      })
    }

    xml.importDocument(segment)

    totalTime = totalTime + bar.time
    totalLength = totalLength + (bar.length || 0)
  })

  return xml.end({ pretty: true });
}
