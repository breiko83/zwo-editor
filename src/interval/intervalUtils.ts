import { Zones } from "../types/Zones";
import { Interval } from "../types/Interval";
import { Duration } from "../types/Length";
import { WorkoutMode } from "../modes/WorkoutMode";
import { move, propEq, update } from "ramda";

// Helpers for transforming intervals array

function updateById(id: string, transform: (interval: Interval) => Interval, intervals: Interval[]): Interval[] {
  const index = intervals.findIndex(propEq('id', id));
  if (index === -1) {
    return intervals;
  }

  return update(index, transform(intervals[index]), intervals);
}

export function updateIntervalDuration(id: string, dDuration: Duration, intervals: Interval[], mode: WorkoutMode): Interval[] {
  return updateById(id, (interval) => {
    if (interval.type === 'steady') {
      const seconds = mode.intervalDuration(interval).seconds + dDuration.seconds;
      if (seconds > 0) {
        return { ...interval, length: new Duration(seconds) };
      }
    }
    return interval;
  }, intervals);
}

export function updateIntervalIntensity(id: string, dIntensity: number, intervals: Interval[]): Interval[] {
  return updateById(id, (interval) => {
    if (interval.type === 'steady') {
      const intensity = interval.intensity + dIntensity;
      if (intensity > Zones.Z1.min) {
        return { ...interval, intensity };
      }
    }
    return interval;
  }, intervals);
}

export function moveInterval(id: string, direction: -1 | 1, intervals: Interval[]): Interval[] {
  const oldIndex = intervals.findIndex(propEq('id', id));
  const newIndex = oldIndex + direction;

  if (newIndex < 0 || newIndex >= intervals.length) {
    return intervals;
  }

  return move(oldIndex, newIndex, intervals);
}
