import moment from 'moment'
import 'moment-duration-format'

const helpers = {
  getWorkoutLength: function(bars){
    var length = 0
    bars.map((bar) => length += bar.time)

    return moment.duration(length, "seconds").format("mm:ss", { trim: false })    
  },

  getStressScore: function(bars, ftp){

    // TSS = [(sec x NP x IF)/(FTP x 3600)] x 100
    var tss = 0
    
    bars.map((bar) => {
      if (bar.type === 'bar'){
        const np = bar.power * ftp        
        const iff = bar.power
        
        tss += (bar.time * np * iff)
      }
      if (bar.type === 'trapeze'){
        const np = (bar.startPower + bar.endPower) / 2 * ftp        
        const iff = (bar.startPower + bar.endPower) / 2
        
        tss += (bar.time * np * iff)
      }
      return false;
    })
    return ((tss / (ftp * 3600)) * 100).toFixed(0);
  }
}

export default helpers;