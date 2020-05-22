import React, { useState } from 'react'
import './Bar.css'
import { Colors } from './Constants'
import { Resizable } from 're-resizable'
import moment from 'moment'
import 'moment-duration-format'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt, faClock } from '@fortawesome/free-solid-svg-icons'

const Bar = ({ id, time, power, onChange, onClick }) => {

  const [width, setWidth] = useState(time)
  const [height, setHeight] = useState(power)
  const [durationLabel, setDurationLabel] = useState(getDuration(time))
  const [powerLabel, setPowerLabel] = useState(power)
  const [style, setStyle] = useState(zwiftStyle(power))

  const handleResizeStop = ({ e, direction, ref, d }) => {
    setWidth(width + d.width)
    setHeight(height + d.height)  
    onChange(id,{id: id, time: width + d.width,power: height + d.height})  
  }

  const handleResize = ({ e, direction, ref, d }) => {
    // 1 pixel equals 5 seconds   
    const duration = getDuration(width + d.width)

    setPowerLabel((`${height + d.height}`))
    setDurationLabel(`${duration}`)
    setStyle(zwiftStyle(height + d.height))
  }

  function getDuration(seconds) {
    // 1 pixel equals 5 seconds 
    return moment.duration(seconds * 5, "seconds").format("mm:ss", { trim: false })
  }

  function zwiftStyle(zone) {

    if (zone >= 0 && zone < 100) {
      // Z1 gray
      return { backgroundColor: Colors.GRAY }
    } else if (zone >= 100 && zone < 200) {
      // Z2 blue
      return { backgroundColor: Colors.BLUE }
    } else if (zone >= 200 && zone < 300) {
      // Z3 green
      return { backgroundColor: Colors.GREEN }
    } else if (zone >= 300 && zone < 400) {
      // Z4 yellow
      return { backgroundColor: Colors.YELLOW }
    } else if (zone >= 400 && zone < 500) {
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
      <FontAwesomeIcon icon={faClock} fixedWidth /> {durationLabel} mm:ss
      <br/>
      <FontAwesomeIcon icon={faBolt} fixedWidth /> {powerLabel} W
      </div>
      <div className='label'>
      
      </div>
      <Resizable
        className='bar'
        size={{
          width: width,
          height: height,
        }}
        minWidth={3}
        minHeight={50}
        maxHeight={600}
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