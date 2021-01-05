import moment from 'moment';
import 'moment-duration-format';
import { Interval } from '../types/Interval';
import { sum } from 'ramda';

export function intervalDuration(interval: Interval): number {
  switch (interval.type) {
    case 'free': return interval.duration;
    case 'steady': return interval.duration;
    case 'ramp': return interval.duration;
    case 'repetition': return interval.repeat * (interval.onDuration + interval.offDuration);
  }
}

// calculate total time
export function workoutDuration(intervals: Interval[]): number {
  return sum(intervals.map(intervalDuration));
}

export function formatDuration(seconds: number): string {
  // 1 pixel equals 5 seconds 
  return moment.duration(seconds, "seconds").format("mm:ss", { trim: false });
}
