import React, { useState } from 'react'
import './FreeRide.css'
import { Resizable } from 're-resizable'
import moment from 'moment'
import 'moment-duration-format'
import Label from '../Label/Label'
import helpers from '../helpers'

const FreeRide = (props: { id: string, time: number, sportType: string, onChange: Function, onClick: Function, selected: boolean }) => {

  const timeMultiplier = 3

  const durationLabel = getDuration(props.time)


  const [width, setWidth] = useState(props.time / timeMultiplier)

  const [showLabel, setShowLabel] = useState(false)

  // standard height
  const height = 100

  const handleResizeStop = (dWidth: number) => {
    setWidth(width + dWidth)
    props.onChange(props.id, { time: helpers.round((width + dWidth) * timeMultiplier, 5), type: 'freeRide', id: props.id })
  }

  const handleResize = (dWidth: number) => {
    props.onChange(props.id, { time: helpers.round((width + dWidth) * timeMultiplier, 5), type: 'freeRide', id: props.id })
  }

  function getDuration(seconds: number) {
    // 1 pixel equals 5 seconds 
    return moment.duration(seconds, "seconds").format("mm:ss", { trim: false })
  }

  return (
    <div className='segment'
      onMouseEnter={() => setShowLabel(true)}
      onMouseLeave={() => setShowLabel(false)}
      style={props.selected ? {zIndex:1}: {}}
      onClick={() => props.onClick(props.id)}
    >
      {showLabel &&
        <Label duration={durationLabel} sportType={props.sportType} />
      }
      <Resizable
        className='freeRide'
        size={{
          width: props.time / timeMultiplier,
          height: height,
        }}
        minWidth={timeMultiplier}
        minHeight={height}
        maxHeight={height}
        enable={{ right: true }}
        grid={[1, 1]}
        onResizeStop={(e, direction, ref, d) => handleResizeStop(d.width)}
        onResize={(e, direction, ref, d) => handleResize(d.width)}        
      >
      </Resizable>
    </div>
  )

}


export default FreeRide