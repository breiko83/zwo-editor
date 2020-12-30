import { PaceType } from "./Editor/PaceSelector";

export interface SteadyInterval {
  id: string,
  time: number,
  length: number,
  type: 'steady',
  power: number,
  cadence: number,
  pace: PaceType,
}

export interface RampInterval {
  id: string,
  time: number,
  length: number,
  type: 'ramp',
  startPower: number,
  endPower: number,
  cadence: number,
  pace: PaceType,
}

export interface FreeInterval {
  id: string,
  time: number,
  type: 'free',
  cadence: number,
}

export interface RepetitionInterval {
  id: string,
  time: number,
  length: number,
  type: 'repetition',
  cadence: number,
  restingCadence: number,
  onPower: number,
  offPower: number,
  onDuration: number,
  offDuration: number,
  repeat: number,
  pace: PaceType,
  onLength: number,
  offLength: number
}

export type Interval = SteadyInterval | RampInterval | FreeInterval | RepetitionInterval;
