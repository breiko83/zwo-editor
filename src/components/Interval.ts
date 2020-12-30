import { PaceType } from "./Editor/PaceSelector";

export interface Interval {
  id: string,
  time: number,
  length?: number,
  type: 'bar' | 'trapeze' | 'freeRide' | 'interval',
  power?: number,
  startPower?: number,
  endPower?: number,
  cadence: number,
  restingCadence?: number,
  onPower?: number,
  offPower?: number,
  onDuration?: number,
  offDuration?: number,
  repeat?: number,
  pace?: PaceType,
  onLength?: number,
  offLength?: number
}
