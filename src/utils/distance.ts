import RunMode from "../modes/RunMode";
import { Interval } from "../types/Interval";
import { sum } from 'ramda';
import { Distance } from "../types/Length";

export function workoutDistance(intervals: Interval[], mode: RunMode): Distance {
  return new Distance(sum(intervals.map(interval => mode.intervalDistance(interval)).map(d => d.meters)));
}
