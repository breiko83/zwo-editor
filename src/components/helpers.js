import moment from 'moment'
import 'moment-duration-format'

const helpers = {
  // calculate total time
  getWorkoutLength: function (bars, durationType) {

    var length = 0

    bars.map((bar) => {
      if (durationType === 'time') {
        length += bar.time  
      }else{

        if (bar.type === 'bar') {
          length += bar.time
        }

        if (bar.type === 'trapeze') {
          length += bar.time
        }

        if (bar.type === 'interval') {
          length += bar.repeat * bar.onDuration
          length += bar.repeat * bar.offDuration         
        }
      }
      return false;
    })

    return length
  },

  getStressScore: function (bars, ftp) {

    // TSS = [(sec x NP x IF)/(FTP x 3600)] x 100
    var tss = 0

    bars.map((bar) => {
      if (bar.type === 'bar') {
        const np = bar.power * ftp
        const iff = bar.power

        tss += (bar.time * np * iff)
      }
      if (bar.type === 'trapeze') {
        const np = (bar.startPower + bar.endPower) / 2 * ftp
        const iff = (bar.startPower + bar.endPower) / 2

        tss += (bar.time * np * iff)
      }
      if (bar.type === 'interval') {
        const npOn = (bar.onPower * ftp)
        const iffOn = bar.onPower

        tss += (bar.onDuration * bar.repeat * npOn * iffOn)

        const npOff = (bar.offPower * ftp)
        const iffOff = bar.offPower

        tss += (bar.offDuration * bar.repeat * npOff * iffOff)
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

  getWorkoutDistance: function (bars) {
    var distance = 0
    bars.map((bar) => distance += (bar.length))

    return (distance/1000).toFixed(1)
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