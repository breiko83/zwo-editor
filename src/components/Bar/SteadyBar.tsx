import React, { useState, useEffect } from 'react'
import './SteadyBar.css'
import { zoneColor, Zones } from '../../types/Zones'
import { Resizable } from 're-resizable'
import Label from '../Label/Label'
import { SteadyInterval } from '../../types/Interval'
import { intensityMultiplier } from './multipliers'
import { WorkoutMode } from '../../modes/WorkoutMode'

interface SteadyBarProps {
  interval: SteadyInterval;
  mode: WorkoutMode;
  onChange: (interval: SteadyInterval) => void;
  onClick: (id: string) => void;
  selected: boolean;
  showLabel: boolean;
}

const SteadyBar = ({interval, mode, ...props}: SteadyBarProps) => {
  const style = { backgroundColor: zoneColor(interval.intensity) }

  const [width, setWidth] = useState(mode.lengthToWidth(interval.length))

  const [height, setHeight] = useState(mode.intensityToHeight(interval.intensity))

  const [showLabel, setShowLabel] = useState(false)

  const [selected, setSelected] = useState(props.selected)

  useEffect(()=>{
    setSelected(props.selected) 
  },[props.selected])  

  const handleCadenceChange = (cadence: number) => {
    props.onChange({ ...interval, cadence })
  }

  const handleResizeStop = (dWidth: number, dHeight: number) => {
    setWidth(width + dWidth)
    setHeight(height + dHeight)

    notifyChange(dWidth, dHeight)
  }

  const notifyChange = (dWidth: number, dHeight: number) => {
    props.onChange({
      ...interval,
      length: mode.widthToLength(width + dWidth, mode),
      intensity: mode.heightToIntensity(height + dHeight),
    })
  }

  return (
    <div className='segment'
      onMouseEnter={() => setShowLabel(true)}
      onMouseLeave={() => setShowLabel(false)}
      onClick={() => props.onClick(interval.id)}
      style={props.selected ? { zIndex: 10 } : {}}
    >
      {((selected || showLabel) && (props.showLabel)) &&
        <Label
          interval={interval}
          mode={mode}
          onCadenceChange={(cadence: number)=> handleCadenceChange(cadence)}
        />
      }
      <Resizable
        className='bar'
        size={{
          width: mode.lengthToWidth(interval.length),
          height: mode.intensityToHeight(interval.intensity),
        }}
        minWidth={3}
        minHeight={intensityMultiplier * Zones.Z1.min}
        maxHeight={intensityMultiplier * Zones.Z6.max}
        enable={{ top: true, right: true }}
        grid={[1, 1]}
        onResizeStop={(e, direction, ref, d) => handleResizeStop(d.width, d.height)}
        onResize={(e, direction, ref, d) => notifyChange(d.width, d.height)}
        style={style}
      >
      </Resizable>
    </div>

  );
}

export default SteadyBar