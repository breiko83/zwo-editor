import moment from 'moment';
import 'moment-duration-format';
import { Interval } from '../types/Interval';
import { sum } from 'ramda';
import { WorkoutMode } from '../modes/WorkoutMode';
import { Duration } from '../types/Length';
import { PaceType } from '../types/PaceType';

export function intervalDuration(interval: Interval, mode: WorkoutMode): Duration {
  switch (interval.type) {
    case 'free': return mode.duration(interval.length, 0, PaceType.oneMile);
    case 'steady': return mode.duration(interval.length, interval.intensity, interval.pace);
    case 'ramp': return mode.duration(interval.length, (interval.startIntensity + interval.endIntensity) / 2, interval.pace);
    case 'repetition': {
      const onDuration = mode.duration(interval.onLength, interval.onIntensity, interval.pace);
      const offDuration = mode.duration(interval.offLength, interval.offIntensity, interval.pace);
      return new Duration(interval.repeat * (onDuration.seconds + offDuration.seconds));
    }
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
