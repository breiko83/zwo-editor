import React, { useState } from 'react'
import './FreeBar.css'
import { Resizable } from 're-resizable'
import 'moment-duration-format'
import Label from '../Label/Label'
import helpers from '../helpers'
import { FreeInterval } from '../Interval'

interface FreeBarProps {
  interval: FreeInterval;
  sportType: string;
  onChange: (interval: FreeInterval) => void;
  onClick: (id: string) => void;
  selected: boolean;
}

const FreeBar = ({interval, ...props}: FreeBarProps) => {
  const durationMultiplier = 3

  const [width, setWidth] = useState(interval.duration / durationMultiplier)

  const [showLabel, setShowLabel] = useState(false)

  const handleCadenceChange = (cadence: number) => {
    props.onChange({ ...interval, cadence })
  }

  // standard height
  const height = 100

  const handleResizeStop = (dWidth: number) => {
    setWidth(width + dWidth)
    props.onChange({ ...interval, duration: helpers.floor((width + dWidth) * durationMultiplier, 5) })
  }

  const handleResize = (dWidth: number) => {
    props.onChange({ ...interval, duration: helpers.floor((width + dWidth) * durationMultiplier, 5) })
  }

  return (
    <div className='segment'
      onMouseEnter={() => setShowLabel(true)}
      onMouseLeave={() => setShowLabel(false)}
      style={props.selected ? {zIndex:1}: {}}
      onClick={() => props.onClick(interval.id)}
    >
      {(props.selected || showLabel) &&
        <Label
          duration={interval.duration}
          sportType={props.sportType}
          cadence={interval.cadence}
          onCadenceChange={(cadence: number)=> handleCadenceChange(cadence)}
        />
      }
      <Resizable
        className='freeRide'
        size={{
          width: interval.duration / durationMultiplier,
          height: height,
        }}
        minWidth={durationMultiplier}
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

export default FreeBar
