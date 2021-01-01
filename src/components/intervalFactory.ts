import { v4 as uuidv4 } from 'uuid'
import { PaceType } from './Editor/PaceSelector';
import { FreeInterval, RampInterval, RepetitionInterval, SteadyInterval } from "./Interval";

export default {
  steady(power: number, duration: number = 300, cadence: number = 0, pace: PaceType = PaceType.oneMile): SteadyInterval {
    return {
      duration: duration,
      power: power,
      cadence: cadence,
      type: 'steady',
      id: uuidv4(),
      pace: pace,
    };
  },

  ramp(startPower: number, endPower: number, duration: number = 300, pace: PaceType = PaceType.oneMile, cadence: number = 0): RampInterval {
    return {
      duration: duration,
      startPower: startPower,
      endPower: endPower,
      cadence: cadence,
      pace: pace,
      type: 'ramp',
      id: uuidv4(),
    };
  },

  free(duration = 600, cadence: number = 0): FreeInterval {
    return {
      duration: duration,
      cadence: cadence,
      type: 'free',
      id: uuidv4(),
    };
  },

  repetition(repeat: number = 3, onDuration: number = 30, offDuration: number = 120, onPower: number = 1, offPower: number = 0.5, cadence: number = 0, restingCadence: number = 0, pace: PaceType = PaceType.oneMile): RepetitionInterval {
    return {
      id: uuidv4(),
      type: 'repetition',
      cadence: cadence,
      restingCadence: restingCadence,
      repeat: repeat,
      onDuration: onDuration,
      offDuration: offDuration,
      onPower: onPower,
      offPower: offPower,
      pace: pace,
    };
  },
};
