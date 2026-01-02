import Builder from 'xmlbuilder';
import Converter from 'xml-js';
import { BarType, Instruction, SportType, DurationType } from '../types/workout';
import { WorkoutData } from '../types';
import Bugsnag from '@bugsnag/js';

interface ParsedWorkout {
  name: string;
  description: string;
  author: string;
  sportType: SportType;
  durationType: DurationType;
  tags: string[];
  bars: BarType[];
  instructions: Instruction[];
}

/**
 * Service for XML parsing and generation
 */
export const xmlService = {
  /**
   * Create XML from workout data
   */
  createWorkoutXml({
    author,
    name,
    description,
    sportType,
    durationType,
    tags,
    bars,
    instructions,
  }: WorkoutData): string {
    let totalTime = 0;
    let totalLength = 0;

    let xml = Builder.begin()
      .ele('workout_file')
      .ele('author', author)
      .up()
      .ele('name', name)
      .up()
      .ele('description', description)
      .up()
      .ele('sportType', sportType)
      .up()
      .ele('durationType', durationType)
      .up()
      .ele('tags');

    tags.forEach((tag: string) => {
      const t: Builder.XMLNode = Builder.create('tag').att('name', tag);
      xml.importDocument(t);
    });

    xml = xml.up().ele('workout');

    bars.forEach((bar, index) => {
      let segment: Builder.XMLNode;
      let ramp;

      if (bar.type === 'bar') {
        segment = Builder.create('SteadyState')
          .att('Duration', durationType === 'time' ? bar.time : bar.length)
          .att('Power', bar.power)
          .att('pace', bar.pace);

        bar.cadence !== 0 && segment.att('Cadence', bar.cadence);
        sportType === 'run' &&
          bar.incline !== undefined &&
          bar.incline !== 0 &&
          segment.att('Incline', (bar.incline / 100).toFixed(2));
      } else if (bar.type === 'trapeze' && bar.startPower && bar.endPower) {
        ramp = 'Ramp';
        if (index === 0) ramp = 'Warmup';
        if (index === bars.length - 1) ramp = 'Cooldown';

        segment = Builder.create(ramp)
          .att('Duration', durationType === 'time' ? bar.time : bar.length)
          .att('PowerLow', bar.startPower)
          .att('PowerHigh', bar.endPower)
          .att('pace', bar.pace);
        bar.cadence !== 0 && segment.att('Cadence', bar.cadence);
      } else if (bar.type === 'interval') {
        segment = Builder.create('IntervalsT')
          .att('Repeat', bar.repeat)
          .att(
            'OnDuration',
            durationType === 'time' ? bar.onDuration : bar.onLength
          )
          .att(
            'OffDuration',
            durationType === 'time' ? bar.offDuration : bar.offLength
          )
          .att('OnPower', bar.onPower)
          .att('OffPower', bar.offPower)
          .att('pace', bar.pace);
        bar.cadence !== 0 && segment.att('Cadence', bar.cadence);
        bar.restingCadence !== 0 &&
          segment.att('CadenceResting', bar.restingCadence);
      } else {
        segment = Builder.create('FreeRide')
          .att('Duration', durationType === 'time' ? bar.time : bar.length)
          .att('FlatRoad', 0);
        bar.cadence !== 0 && segment.att('Cadence', bar.cadence);
        bar.incline !== undefined && segment.att('Incline', (bar.incline / 100).toFixed(2));
      }

      if (durationType === 'time') {
        instructions
          .filter(
            (instruction) =>
              instruction.time >= totalTime &&
              instruction.time < totalTime + bar.time
          )
          .forEach((i) => {
            segment.ele('textevent', {
              timeoffset: i.time - totalTime,
              message: i.text,
            });
          });
      } else {
        instructions
          .filter(
            (instruction) =>
              instruction.length >= totalLength &&
              instruction.length < totalLength + (bar.length || 0)
          )
          .forEach((i) => {
            segment.ele('textevent', {
              distoffset: i.length - totalLength,
              message: i.text,
            });
          });
      }

      xml.importDocument(segment);

      totalTime = totalTime + bar.time;
      totalLength = totalLength + (bar.length || 0);
    });

    return xml.end({ pretty: true });
  },

  /**
   * Parse XML file to workout data
   */
  parseWorkoutXml(file: File, uuidv4: () => string): Promise<ParsedWorkout> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const result = JSON.parse(
            Converter.xml2json(content, { compact: false, spaces: 4 })
          );

          const workoutFileElement = result.elements?.[0];
          if (!workoutFileElement || workoutFileElement.name !== 'workout_file') {
            throw new Error('Invalid workout file format: missing workout_file element');
          }

          // Helper to extract text from elements
          const getElementText = (elements: any[], elementName: string): string => {
            const element = elements?.find((e: any) => e.name === elementName);
            return element?.elements?.[0]?.text || '';
          };

          const name = getElementText(workoutFileElement.elements, 'name');
          const description = getElementText(workoutFileElement.elements, 'description');
          const author = getElementText(workoutFileElement.elements, 'author');
          const sportType = (getElementText(workoutFileElement.elements, 'sportType') || 'bike') as SportType;
          const durationType = (getElementText(workoutFileElement.elements, 'durationType') || 'time') as DurationType;

          const tags: string[] = [];
          const tagsElement = workoutFileElement.elements?.find((e: any) => e.name === 'tags');
          if (tagsElement?.elements) {
            tagsElement.elements.forEach((tagElement: any) => {
              if (tagElement.name === 'tag' && tagElement.attributes?.name) {
                tags.push(tagElement.attributes.name);
              }
            });
          }

          const bars: BarType[] = [];
          const instructions: Instruction[] = [];

          let totalTime = 0;
          let totalLength = 0;

          const workoutElement = workoutFileElement.elements?.find((e: any) => e.name === 'workout');
          if (!workoutElement?.elements) {
            resolve({
              name,
              description,
              author,
              sportType,
              durationType,
              tags,
              bars,
              instructions,
            });
            return;
          }

          // Process elements in the order they appear in the XML
          workoutElement.elements.forEach((element: any) => {
            const attr = element.attributes;

            if (!attr) return;

            const duration = parseFloat(attr.Duration) || 0;
            const pace = parseFloat(attr.pace) || 0;

            // Handle text events
            if (element.elements) {
              const textEvents = element.elements.filter((e: any) => e.name === 'textevent');
              textEvents.forEach((textEvent: any) => {
                const textAttr = textEvent.attributes;
                instructions.push({
                  id: uuidv4(),
                  text: textAttr?.message || '',
                  time:
                    durationType === 'time'
                      ? totalTime + parseFloat(textAttr?.timeoffset || 0)
                      : 0,
                  length:
                    durationType === 'distance'
                      ? totalLength + parseFloat(textAttr?.distoffset || 0)
                      : 0,
                });
              });
            }

            // Create bar based on element type
            if (element.name === 'SteadyState') {
              bars.push({
                id: uuidv4(),
                type: 'bar',
                time: durationType === 'time' ? duration : 0,
                length: durationType === 'distance' ? duration : 0,
                power: parseFloat(attr.Power),
                cadence: parseFloat(attr.Cadence) || 0,
                pace: pace,
                incline: attr.Incline ? parseFloat(attr.Incline) * 100 : 0,
              });
            } else if (
              element.name === 'Warmup' ||
              element.name === 'Cooldown' ||
              element.name === 'Ramp'
            ) {
              bars.push({
                id: uuidv4(),
                type: 'trapeze',
                time: durationType === 'time' ? duration : 0,
                length: durationType === 'distance' ? duration : 0,
                startPower: parseFloat(attr.PowerLow),
                endPower: parseFloat(attr.PowerHigh),
                cadence: parseFloat(attr.Cadence) || 0,
                pace: pace,
              });
            } else if (element.name === 'IntervalsT') {
              bars.push({
                id: uuidv4(),
                type: 'interval',
                time:
                  durationType === 'time'
                    ? (parseFloat(attr.OnDuration) +
                        parseFloat(attr.OffDuration)) *
                      parseInt(attr.Repeat)
                    : 0,
                length:
                  durationType === 'distance'
                    ? (parseFloat(attr.OnDuration) +
                        parseFloat(attr.OffDuration)) *
                      parseInt(attr.Repeat)
                    : 0,
                repeat: parseInt(attr.Repeat),
                onDuration:
                  durationType === 'time'
                    ? parseFloat(attr.OnDuration)
                    : undefined,
                offDuration:
                  durationType === 'time'
                    ? parseFloat(attr.OffDuration)
                    : undefined,
                onLength:
                  durationType === 'distance'
                    ? parseFloat(attr.OnDuration)
                    : undefined,
                offLength:
                  durationType === 'distance'
                    ? parseFloat(attr.OffDuration)
                    : undefined,
                onPower: parseFloat(attr.OnPower),
                offPower: parseFloat(attr.OffPower),
                cadence: parseFloat(attr.Cadence) || 0,
                restingCadence: parseFloat(attr.CadenceResting) || 0,
                pace: pace,
              });
            } else if (element.name === 'FreeRide') {
              bars.push({
                id: uuidv4(),
                type: 'freeRide',
                time: durationType === 'time' ? duration : 0,
                length: durationType === 'distance' ? duration : 0,
                cadence: parseFloat(attr.Cadence) || 0,
              });
            }

            totalTime += duration;
            totalLength += duration;
          });

          resolve({
            name,
            description,
            author,
            sportType,
            durationType,
            tags,
            bars,
            instructions,
          });
        } catch (error) {
          Bugsnag.notify(error as Error, (event) => {
            event.addMetadata('file', { name: file.name });
          });
          reject(error);
        }
      };

      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  },

  /**
   * Download workout as XML file
   */
  downloadWorkout(xml: string, filename: string): void {
    const element = document.createElement('a');
    const file = new Blob([xml], { type: 'text/xml' });
    element.href = URL.createObjectURL(file);
    element.download = `${filename}.zwo`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  },
};
