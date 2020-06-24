import moment from 'moment'
import 'moment-duration-format'

const helpers = {
  getWorkoutLength: function(bars){
    var length = 0
    bars.map((bar) => length += bar.time)

    return moment.duration(length, "seconds").format("mm:ss", { trim: false })    
  }
}

export default helpers;