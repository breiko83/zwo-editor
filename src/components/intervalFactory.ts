import { v4 as uuidv4 } from 'uuid'
import { PaceType } from './Editor/PaceSelector';
import { FreeInterval, Interval, RampInterval, RepetitionInterval, SteadyInterval } from "./Interval";

const defaultDuration = 300;
const defaultPower = 1.0;
const defaultPace = PaceType.oneMile;
const defaultCadence = 0;

export default {
  steady(interval: Partial<SteadyInterval>): SteadyInterval {
    return {
      type: 'steady',
      id: uuidv4(),
      duration: defaultDuration,
      power: defaultPower,
      cadence: defaultCadence,
      pace: defaultPace,
      ...interval,
    };
  },

  ramp(interval: Partial<RampInterval>): RampInterval {
    return {
      type: 'ramp',
      id: uuidv4(),
      duration: defaultDuration,
      startPower: defaultPower / 2,
      endPower: defaultPower,
      cadence: defaultCadence,
      pace: defaultPace,
      ...interval,
    };
  },

  free(interval: Partial<FreeInterval>): FreeInterval {
    return {
      type: 'free',
      id: uuidv4(),
      duration: defaultDuration,
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
      onDuration: 30,
      offDuration: 120,
      onPower: defaultPower,
      offPower: defaultPower / 2,
      pace: defaultPace,
      ...interval,
    };
  },

  // Creates a copy of the interval, with a new ID
  clone(interval: Interval): Interval {
    return { ...interval, id: uuidv4() };
  },
};
