import RunMode from "../modes/RunMode";
import { Interval } from "../types/Interval";
import { sum } from 'ramda';

export function intervalDistance(interval: Interval, mode: RunMode): number {
  switch (interval.type) {
    case 'free': {
      throw new Error("Run workout may not contain FreeRide");
    }
    case 'steady': {
      return mode.distance(interval.duration, interval.intensity, interval.pace);
    }
    case 'ramp': {
      return mode.distance(interval.duration, (interval.startIntensity + interval.endIntensity) / 2, interval.pace);
    }
    case 'repetition': {
      const onDistance = mode.distance(interval.onDuration, interval.onIntensity, interval.pace);
      const offDistance = mode.distance(interval.offDuration, interval.offIntensity, interval.pace);
      return interval.repeat * (onDistance + offDistance);
    }
  }
}

export function workoutDistance(intervals: Interval[], mode: RunMode): number {
  return sum(intervals.map(interval => intervalDistance(interval, mode)));
}
