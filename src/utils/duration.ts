import moment from 'moment';
import 'moment-duration-format';
import { Interval } from '../types/Interval';
import { sum } from 'ramda';
import { WorkoutMode } from '../modes/WorkoutMode';
import { Duration } from '../types/Length';

export function intervalDuration(interval: Interval, mode: WorkoutMode): Duration {
  switch (interval.type) {
    case 'free': return mode.duration(interval.length);
    case 'steady': return mode.duration(interval.length);
    case 'ramp': return mode.duration(interval.length);
    case 'repetition': return new Duration(interval.repeat * (mode.duration(interval.onLength).seconds + mode.duration(interval.offLength).seconds));
  }
}

// calculate total time
export function workoutDuration(intervals: Interval[], mode: WorkoutMode): Duration {
  return new Duration(sum(intervals.map(interval => intervalDuration(interval, mode)).map(d => d.seconds)));
}

export function formatDuration(duration: Duration): string {
  // 1 pixel equals 5 seconds 
  return moment.duration(duration.seconds, "seconds").format("mm:ss", { trim: false });
}
