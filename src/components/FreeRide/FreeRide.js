import React, { useState } from 'react'
import './FreeRide.css'
import { Resizable } from 're-resizable'
import moment from 'moment'
import 'moment-duration-format'
import Label from '../Label/Label'

const FreeRide = ({ id, time, onChange, onClick, selected }) => {

  const timeMultiplier = 5

  const durationLabel = getDuration(time)


  const [width, setWidth] = useState(time / timeMultiplier)
  const [showLabel, setShowLabel] = useState(false)

  // standard height
  const height = 100

  const handleResizeStop = ({ e, direction, ref, d }) => {
    setWidth(width + d.width)
    onChange(id, { time: (width + d.width) * timeMultiplier, type: 'freeRide', id: id })
  }

  const handleResize = ({ e, direction, ref, d }) => {
    onChange(id, { time: (width + d.width) * timeMultiplier, type: 'freeRide', id: id })
  }

  function getDuration(seconds) {
    // 1 pixel equals 5 seconds 
    return moment.duration(seconds, "seconds").format("mm:ss", { trim: false })
  }

  return (
    <div className='segment'
      onMouseEnter={() => setShowLabel(true)}
      onMouseLeave={() => setShowLabel(false)}
      style={selected ? {zIndex:1}: {zIndex:0}}
    >
      {showLabel &&
        <Label duration={durationLabel} />
      }
      <Resizable
        className='freeRide'
        size={{
          width: width,
          height: height,
        }}
        minWidth={3}
        minHeight={height}
        maxHeight={height}
        enable={{ right: true }}
        grid={[1, 1]}
        onResizeStop={(e, direction, ref, d) => handleResizeStop({ e, direction, ref, d })}
        onResize={(e, direction, ref, d) => handleResize({ e, direction, ref, d })}
        onClick={() => onClick(id)}
      >
      </Resizable>
    </div>
  )

}


export default FreeRide