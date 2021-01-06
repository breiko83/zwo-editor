import { Zones } from "../types/Zones";
import { Interval } from "../types/Interval";
import { Duration } from "../types/Length";

// Helpers for transforming intervals array

function updateById(id: string, transform: (interval: Interval) => Interval, intervals: Interval[]): Interval[] {
  const index = intervals.findIndex(interval => interval.id === id);
  if (index === -1) {
    return intervals;
  }

  return [
    ...intervals.slice(0, index),
    ...[transform(intervals[index])],
    ...intervals.slice(index + 1),
  ];
}

export function updateIntervalDuration(id: string, dDuration: Duration, intervals: Interval[]): Interval[] {
  return updateById(id, (interval) => {
    if (interval.type === 'steady' && interval.length instanceof Duration) {
      const seconds = interval.length.seconds + dDuration.seconds;
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
  const oldIndex = intervals.findIndex(interval => interval.id === id);
  const newIndex = oldIndex + direction;

  if (newIndex < 0 || newIndex >= intervals.length) {
    return intervals;
  }

  const newArray = [...intervals];
  newArray[newIndex] = intervals[oldIndex];
  newArray[oldIndex] = intervals[newIndex];
  return newArray;
}
