import React, { useState } from 'react'
import './Bar.css'
import { Colors, Zones } from './Constants'
import { Resizable } from 're-resizable'
import moment from 'moment'
import 'moment-duration-format'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt, faClock } from '@fortawesome/free-solid-svg-icons'

const Bar = ({ id, time, power, ftp, onChange, onClick }) => {

  const multiplier = 250

  const powerLabel = Math.round(power*ftp)
  const durationLabel = getDuration(time)
  const style = zwiftStyle(power)

  const [width, setWidth] = useState(time)
  const [height, setHeight] = useState(power*multiplier)

  

  const handleResizeStop = ({ e, direction, ref, d }) => {
    setWidth(width + d.width)
    setHeight(height + d.height)  
    onChange(id,{time: width + d.width,power: (height + d.height)/multiplier, id: id})  
  }

  const handleResize = ({ e, direction, ref, d }) => {    
    onChange(id,{time: width + d.width,power: (height + d.height)/multiplier,id: id})  
  }

  function getDuration(seconds) {
    // 1 pixel equals 5 seconds 
    return moment.duration(seconds * 5, "seconds").format("mm:ss", { trim: false })
  }

  function zwiftStyle(zone) { 

    if (zone >=  0 && zone <  Zones.Z1.max) {
      // Z1 gray
      return { backgroundColor: Colors.GRAY }
    } else if (zone >=  Zones.Z2.min && zone < Zones.Z2.max) {
      // Z2 blue
      return { backgroundColor: Colors.BLUE }
    } else if (zone >=  Zones.Z3.min  && zone < Zones.Z3.max) {
      // Z3 green
      return { backgroundColor: Colors.GREEN }
    } else if (zone >=  Zones.Z4.min  && zone < Zones.Z4.max) {
      // Z4 yellow
      return { backgroundColor: Colors.YELLOW }
    } else if (zone >=  Zones.Z5.min && zone < Zones.Z5.max) {
      // Z5 orange      
      return { backgroundColor: Colors.ORANGE }
    } else {
      // Z6 red          
      return { backgroundColor: Colors.RED }
    }
  }

  return (    
    <div className='segment'>
      <div className='label'>
      <FontAwesomeIcon icon={faClock} fixedWidth /> {durationLabel}
      <br/>
      <FontAwesomeIcon icon={faBolt} fixedWidth /> {powerLabel}W
      </div>
      <Resizable
        className='bar'
        size={{
          width: width,
          height: height,
        }}
        minWidth={3}
        minHeight={multiplier*Zones.Z1.min}
        maxHeight={multiplier*Zones.Z6.max}
        enable={{ top: true, right: true }}
        grid={[1, 1]}
        onResizeStop={(e, direction, ref, d) => handleResizeStop({ e, direction, ref, d })}
        onResize={(e, direction, ref, d) => handleResize({ e, direction, ref, d })}
        onClick={() => onClick(id)}
        style={style}        
      >
      </Resizable>      
    </div>

  );
}

export default Bar