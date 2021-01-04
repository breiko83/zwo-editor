import { PaceType } from "./PaceType";

export interface SteadyInterval {
  id: string,
  duration: number,
  type: 'steady',
  intensity: number,
  cadence: number,
  pace: PaceType,
}

export interface RampInterval {
  id: string,
  duration: number,
  type: 'ramp',
  startIntensity: number,
  endIntensity: number,
  cadence: number,
  pace: PaceType,
}

export interface FreeInterval {
  id: string,
  duration: number,
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
  onDuration: number,
  offDuration: number,
  repeat: number,
  pace: PaceType,
}

export type Interval = SteadyInterval | RampInterval | FreeInterval | RepetitionInterval;
