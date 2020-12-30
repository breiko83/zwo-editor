import moment from 'moment'
import 'moment-duration-format'

const helpers = {
  // calculate total time
  getWorkoutLength: function (intervals, durationType) {

    var length = 0

    intervals.map((interval) => {
      if (durationType === 'time') {
        length += interval.time
      } else {

        if (interval.type === 'bar') {
          length += interval.time
        }

        if (interval.type === 'trapeze') {
          length += interval.time
        }

        if (interval.type === 'interval') {
          length += interval.repeat * interval.onDuration
          length += interval.repeat * interval.offDuration
        }
      }
      return false;
    })

    return length
  },

  getStressScore: function (intervals, ftp) {

    // TSS = [(sec x NP x IF)/(FTP x 3600)] x 100
    var tss = 0

    intervals.map((interval) => {
      if (interval.type === 'bar') {
        const np = interval.power * ftp
        const iff = interval.power

        tss += (interval.time * np * iff)
      }
      if (interval.type === 'trapeze') {
        const np = (interval.startPower + interval.endPower) / 2 * ftp
        const iff = (interval.startPower + interval.endPower) / 2

        tss += (interval.time * np * iff)
      }
      if (interval.type === 'interval') {
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

  calculateEstimatedTimes: function (distances, times) {
    var estimatedTimes = []

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

  getWorkoutDistance: function (intervals) {
    var distance = 0
    intervals.map((interval) => distance += (interval.length))

    return (distance / 1000).toFixed(1)
  },

  getTimeinSeconds: function (time) {
    //convert time 01:00:00 to seconds 3600
    return moment.duration(time).asSeconds()
  },

  formatDuration: function (seconds) {
    // 1 pixel equals 5 seconds 
    return moment.duration(seconds, "seconds").format("mm:ss", { trim: false })
  },
  calculateTime: function (distance, speed) {
    return distance / speed
  },
  calculateDistance: function (time, speed) {
    return time * speed
  },
  round: function (x, roundTo) {
    return Math.floor(x / roundTo) * roundTo
  }
}

export default helpers;