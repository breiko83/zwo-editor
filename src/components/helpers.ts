import moment from 'moment'
import 'moment-duration-format'
import { Interval } from '../types/Interval'

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
    var duration = 0

    intervals.forEach((interval) => {
      duration += this.getIntervalDuration(interval)
    })

    return duration
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
