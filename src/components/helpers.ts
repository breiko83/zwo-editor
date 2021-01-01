import moment from 'moment'
import 'moment-duration-format'
import { Colors, Zones } from './Constants'
import { Interval } from './Interval'

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

  getStressScore: function (intervals: Interval[], ftp: number): string {

    // TSS = [(sec x NP x IF)/(FTP x 3600)] x 100
    var tss = 0

    intervals.map((interval) => {
      if (interval.type === 'steady' && interval.power) {
        const np = interval.power * ftp
        const iff = interval.power

        tss += (interval.duration * np * iff)
      }
      if (interval.type === 'ramp' && interval.startPower && interval.endPower) {
        const np = (interval.startPower + interval.endPower) / 2 * ftp
        const iff = (interval.startPower + interval.endPower) / 2

        tss += (interval.duration * np * iff)
      }
      if (interval.type === 'repetition' && interval.onPower && interval.offPower && interval.repeat && interval.onDuration && interval.offDuration) {
        const npOn = (interval.onPower * ftp)
        const iffOn = interval.onPower

        tss += (interval.onDuration * interval.repeat * npOn * iffOn)

        const npOff = (interval.offPower * ftp)
        const iffOff = interval.offPower

        tss += (interval.offDuration * interval.repeat * npOff * iffOff)
      }
      return false;
    })
    return ((tss / (ftp * 3600)) * 100).toFixed(0);
  },

  calculateEstimatedTimes: function (distances: number[], times: string[]): string[] {
    var estimatedTimes: string[] = []

    times.forEach((value, i) => {

      if (!value) {

        for (let index = 0; index < times.length; index++) {

          // found a time
          if (times[index]) {

            // Predictions calculated using Riegel's formula: T2 = T1 x (D2/D1) x 1.06
            // T1 = T2 / (1.06 * (D2/D1))
            const t = moment.duration(times[index]).asSeconds()


            let et = t * (distances[i] / distances[index]) * 1.06


            estimatedTimes[i] = moment.utc(et * 1000).format('HH:mm:ss')

            break;

          }
        }
      }
    })
    return estimatedTimes;
  },

  getTimeinSeconds: function (time: string): number {
    //convert time 01:00:00 to seconds 3600
    return moment.duration(time).asSeconds()
  },

  formatDuration: function (seconds: number): string {
    // 1 pixel equals 5 seconds 
    return moment.duration(seconds, "seconds").format("mm:ss", { trim: false })
  },
  calculateTime: function (distance: number, speed: number): number {
    return distance / speed
  },
  calculateDistance: function (duration: number, speed: number): number {
    return duration * speed
  },
  floor: function (x: number, roundTo: number): number {
    return Math.floor(x / roundTo) * roundTo
  },

  zoneColor(power: number): string {
    if (power < Zones.Z1.max) {
      return Colors.GRAY
    } else if (power < Zones.Z2.max) {
      return Colors.BLUE
    } else if (power < Zones.Z3.max) {
      return Colors.GREEN
    } else if (power < Zones.Z4.max) {
      return Colors.YELLOW
    } else if (power < Zones.Z5.max) {
      return Colors.ORANGE
    } else {
      return Colors.RED
    }
  },
}

export default helpers;
