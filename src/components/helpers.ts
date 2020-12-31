import moment from 'moment'
import 'moment-duration-format'
import { Colors, Zones } from './Constants'
import { DurationType } from './Editor/Editor'
import { Interval } from './Interval'

const helpers = {
  // calculate total time
  getWorkoutLength: function (intervals: Interval[], durationType: DurationType): number {

    var length = 0

    intervals.map((interval) => {
      if (durationType === 'time') {
        length += interval.time
      } else {

        if (interval.type === 'steady') {
          length += interval.time
        }

        if (interval.type === 'ramp') {
          length += interval.time
        }

        if (interval.type === 'repetition' && interval.repeat && interval.onDuration && interval.offDuration) {
          length += interval.repeat * interval.onDuration
          length += interval.repeat * interval.offDuration
        }
      }
      return false;
    })

    return length
  },

  getStressScore: function (intervals: Interval[], ftp: number): string {

    // TSS = [(sec x NP x IF)/(FTP x 3600)] x 100
    var tss = 0

    intervals.map((interval) => {
      if (interval.type === 'steady' && interval.power) {
        const np = interval.power * ftp
        const iff = interval.power

        tss += (interval.time * np * iff)
      }
      if (interval.type === 'ramp' && interval.startPower && interval.endPower) {
        const np = (interval.startPower + interval.endPower) / 2 * ftp
        const iff = (interval.startPower + interval.endPower) / 2

        tss += (interval.time * np * iff)
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

  getWorkoutDistance: function (intervals: Interval[]): string {
    var distance = 0
    intervals.map((interval) => distance += (interval.type === 'free' ? 0 : interval.distance))

    return (distance / 1000).toFixed(1)
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
  calculateDistance: function (time: number, speed: number): number {
    return time * speed
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
