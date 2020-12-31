import React, { useState } from 'react'
import './FreeRide.css'
import { Resizable } from 're-resizable'
import moment from 'moment'
import 'moment-duration-format'
import Label from '../Label/Label'
import helpers from '../helpers'
import { FreeInterval } from '../Interval'

interface FreeRideProps {
  interval: FreeInterval;
  sportType: string;
  onChange: (interval: FreeInterval) => void;
  onClick: (id: string) => void;
  selected: boolean;
}

const FreeRide = ({interval, ...props}: FreeRideProps) => {
  const timeMultiplier = 3

  const durationLabel = getDuration(interval.time)


  const [width, setWidth] = useState(interval.time / timeMultiplier)

  const [showLabel, setShowLabel] = useState(false)

  const handleCadenceChange = (cadence: number) => {
    props.onChange({ ...interval, cadence })
  }

  // standard height
  const height = 100

  const handleResizeStop = (dWidth: number) => {
    setWidth(width + dWidth)
    props.onChange({ ...interval, time: helpers.round((width + dWidth) * timeMultiplier, 5) })
  }

  const handleResize = (dWidth: number) => {
    props.onChange({ ...interval, time: helpers.round((width + dWidth) * timeMultiplier, 5) })
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
      onClick={() => props.onClick(interval.id)}
    >
      {(props.selected || showLabel) &&
        <Label duration={durationLabel} sportType={props.sportType} cadence={interval.cadence} setCadence={(cadence: number)=> handleCadenceChange(cadence)} />
      }
      <Resizable
        className='freeRide'
        size={{
          width: interval.time / timeMultiplier,
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