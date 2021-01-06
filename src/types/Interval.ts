import { Length } from "./Length";
import { PaceType } from "./PaceType";

export interface SteadyInterval {
  id: string,
  duration: Length,
  type: 'steady',
  intensity: number,
  cadence: number,
  pace: PaceType,
}

export interface RampInterval {
  id: string,
  duration: Length,
  type: 'ramp',
  startIntensity: number,
  endIntensity: number,
  cadence: number,
  pace: PaceType,
}

export interface FreeInterval {
  id: string,
  duration: Length,
  type: 'free',
  cadence: number,
}

export interface RepetitionInterval {
  id: string,
  type: 'repetition',
  cadence: number,
  restingCadence: number,
  onIntensity: number,
  offIntensity: number,
  onDuration: Length,
  offDuration: Length,
  repeat: number,
  pace: PaceType,
}

export type Interval = SteadyInterval | RampInterval | FreeInterval | RepetitionInterval;
