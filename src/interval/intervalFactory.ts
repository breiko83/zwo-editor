import { v4 as uuidv4 } from 'uuid'
import { PaceType } from '../types/PaceType';
import { FreeInterval, Interval, RampInterval, RepetitionInterval, SteadyInterval } from "../types/Interval";
import { Duration } from '../types/Length';

const defaultDuration = new Duration(300);
const defaultIntensity = 1.0;
const defaultPace = PaceType.oneMile;
const defaultCadence = 0;

export default {
  steady<T>(interval: Partial<SteadyInterval>): SteadyInterval {
    return {
      type: 'steady',
      id: uuidv4(),
      length: defaultDuration,
      intensity: defaultIntensity,
      cadence: defaultCadence,
      pace: defaultPace,
      ...interval,
    };
  },

  ramp(interval: Partial<RampInterval>): RampInterval {
    return {
      type: 'ramp',
      id: uuidv4(),
      length: defaultDuration,
      startIntensity: defaultIntensity / 2,
      endIntensity: defaultIntensity,
      cadence: defaultCadence,
      pace: defaultPace,
      ...interval,
    };
  },

  free(interval: Partial<FreeInterval>): FreeInterval {
    return {
      type: 'free',
      id: uuidv4(),
      length: defaultDuration,
      cadence: defaultCadence,
      ...interval
    };
  },

  repetition(interval: Partial<RepetitionInterval>): RepetitionInterval {
    return {
      type: 'repetition',
      id: uuidv4(),
      cadence: defaultCadence,
      restingCadence: defaultCadence,
      repeat: 3,
      onLength: new Duration(30),
      offLength: new Duration(120),
      onIntensity: defaultIntensity,
      offIntensity: defaultIntensity / 2,
      pace: defaultPace,
      ...interval,
    };
  },

  // Creates a copy of the interval, with a new ID
  clone(interval: Interval): Interval {
    return { ...interval, id: uuidv4() };
  },
};
