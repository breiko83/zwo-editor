// Bar/Segment types
export interface BarType {
  id: string;
  time: number;
  length?: number;
  type: string;
  power?: number;
  startPower?: number;
  endPower?: number;
  cadence: number;
  restingCadence?: number;
  onPower?: number;
  offPower?: number;
  onDuration?: number;
  offDuration?: number;
  repeat?: number;
  pace?: number;
  onLength?: number;
  offLength?: number;
  incline?: number;
}

// Instruction/Comment types
export interface Instruction {
  id: string;
  text: string;
  time: number;
  length: number;
}

// Duration and pace types
export type DurationType = "time" | "distance";
export type PaceUnitType = "metric" | "imperial";
export type SportType = "bike" | "run";
