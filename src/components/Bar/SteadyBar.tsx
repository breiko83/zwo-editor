import React, { useState, useEffect } from 'react'
import './SteadyBar.css'
import { Zones } from '../Constants'
import { Resizable } from 're-resizable'
import Label from '../Label/Label'
import helpers from '../helpers'
import { SteadyInterval } from '../../types/Interval'
import { durationMultiplier, powerMultiplier } from './multipliers'

interface SteadyBarProps {
  interval: SteadyInterval;
  ftp: number;
  weight: number;
  sportType: string;
  onChange: (interval: SteadyInterval) => void;
  onClick: (id: string) => void;
  selected: boolean;
  showLabel: boolean;
}

const SteadyBar = ({interval, ...props}: SteadyBarProps) => {
  const powerLabel = Math.round(interval.power * props.ftp)

  const style = { backgroundColor: helpers.zoneColor(interval.power) }

  const [width, setWidth] = useState(interval.duration / durationMultiplier)

  const [height, setHeight] = useState(interval.power * powerMultiplier)

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
      duration: helpers.floor((width + dWidth) * durationMultiplier, 5),
      power: (height + dHeight) / powerMultiplier,
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
          sportType={props.sportType}
          duration={interval.duration}
          power={powerLabel}
          weight={props.weight}
          ftp={props.ftp}
          pace={interval.pace}
          cadence={interval.cadence}
          onCadenceChange={(cadence: number)=> handleCadenceChange(cadence)}
        />
      }
      <Resizable
        className='bar'
        size={{
          width: interval.duration / durationMultiplier,
          height: interval.power * powerMultiplier,
        }}
        minWidth={3}
        minHeight={powerMultiplier * Zones.Z1.min}
        maxHeight={powerMultiplier * Zones.Z6.max}
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