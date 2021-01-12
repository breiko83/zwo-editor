import moment from 'moment';
import 'moment-duration-format';
import { Interval } from '../types/Interval';
import { sum } from 'ramda';
import { WorkoutMode } from '../modes/WorkoutMode';
import { Duration } from '../types/Length';

// calculate total time
export function workoutDuration(intervals: Interval[], mode: WorkoutMode): Duration {
  return new Duration(sum(intervals.map(interval => mode.intervalDuration(interval)).map(d => d.seconds)));
}

export function formatDuration(duration: Duration): string {
  // 1 pixel equals 5 seconds 
  return moment.duration(duration.seconds, "seconds").format("mm:ss", { trim: false });
}
