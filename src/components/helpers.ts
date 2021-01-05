import moment from 'moment'
import 'moment-duration-format'
import { Interval } from '../types/Interval'
import { sum } from 'ramda'

const helpers = {
  getIntervalDuration(interval: Interval): number {
    switch (interval.type) {
      case 'free': return interval.duration;
      case 'steady': return interval.duration;
      case 'ramp': return interval.duration;
      case 'repetition': return interval.repeat * (interval.onDuration + interval.offDuration);
    }
  },

  // calculate total time
  getWorkoutDuration: function (intervals: Interval[]): number {
    return sum(intervals.map(interval => this.getIntervalDuration(interval)));
  },

  formatDuration: function (seconds: number): string {
    // 1 pixel equals 5 seconds 
    return moment.duration(seconds, "seconds").format("mm:ss", { trim: false })
  },

  floor: function (x: number, roundTo: number): number {
    return Math.floor(x / roundTo) * roundTo
  },
}

export default helpers;
