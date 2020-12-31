import { PaceType } from "./Editor/PaceSelector";

export interface SteadyInterval {
  id: string,
  duration: number,
  distance: number,
  type: 'steady',
  power: number,
  cadence: number,
  pace: PaceType,
}

export interface RampInterval {
  id: string,
  duration: number,
  distance: number,
  type: 'ramp',
  startPower: number,
  endPower: number,
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
  onPower: number,
  offPower: number,
  onDuration: number,
  offDuration: number,
  repeat: number,
  pace: PaceType,
  onDistance: number,
  offDistance: number
}

export type Interval = SteadyInterval | RampInterval | FreeInterval | RepetitionInterval;
