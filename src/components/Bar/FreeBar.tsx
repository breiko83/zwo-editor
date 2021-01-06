import React, { useState } from 'react'
import './FreeBar.css'
import { Resizable } from 're-resizable'
import 'moment-duration-format'
import Label from '../Label/Label'
import { FreeInterval } from '../../types/Interval'
import { durationMultiplier } from './multipliers'
import { WorkoutMode } from '../../modes/WorkoutMode'

interface FreeBarProps {
  interval: FreeInterval;
  mode: WorkoutMode;
  onChange: (interval: FreeInterval) => void;
  onClick: (id: string) => void;
  selected: boolean;
}

const FreeBar = ({interval, mode, ...props}: FreeBarProps) => {
  const [width, setWidth] = useState(mode.lengthToWidth(interval.duration))

  const [showLabel, setShowLabel] = useState(false)

  const handleCadenceChange = (cadence: number) => {
    props.onChange({ ...interval, cadence })
  }

  // standard height
  const height = 100

  const handleResizeStop = (dWidth: number) => {
    setWidth(width + dWidth)
    notifyChange(dWidth)
  }

  const notifyChange = (dWidth: number) => {
    props.onChange({ ...interval, duration: mode.widthToLength(width + dWidth) })
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
          interval={interval}
          mode={mode}
          onCadenceChange={(cadence: number)=> handleCadenceChange(cadence)}
        />
      }
      <Resizable
        className='freeRide'
        size={{
          width: mode.lengthToWidth(interval.duration),
          height: height,
        }}
        minWidth={durationMultiplier}
        minHeight={height}
        maxHeight={height}
        enable={{ right: true }}
        grid={[1, 1]}
        onResizeStop={(e, direction, ref, d) => handleResizeStop(d.width)}
        onResize={(e, direction, ref, d) => notifyChange(d.width)}        
      >
      </Resizable>
    </div>
  )

}

export default FreeBar
