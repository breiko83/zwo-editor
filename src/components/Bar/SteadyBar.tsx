import React, { useState, useEffect } from 'react'
import './SteadyBar.css'
import { Zones } from '../Constants'
import { Resizable } from 're-resizable'
import Label from '../Label/Label'
import helpers from '../helpers'
import { SteadyInterval } from '../Interval'
import { distanceMultiplier, durationMultiplier, powerMultiplier } from './multipliers'

interface SteadyBarProps {
  interval: SteadyInterval;
  ftp: number;
  weight: number;
  sportType: string;
  durationType: string;
  speed: number;
  onChange: (interval: SteadyInterval) => void;
  onClick: (id: string) => void;
  selected: boolean;
  showLabel: boolean;
}

const SteadyBar = ({interval, ...props}: SteadyBarProps) => {
  const powerLabel = Math.round(interval.power * props.ftp)

  // DISTANCE
  const distance = interval.distance
  
  // USED ONLY ON RUN WORKOUT
  // const distance = interval.length

  // time is set -> calculate distance
  // distance is set -> calculate time

  const style = { backgroundColor: helpers.zoneColor(interval.power) }

  // RUN WORKOUTS ON DISTANCE - BIKE WORKOUTS ON TIME
  const [width, setWidth] = useState(props.durationType === 'time' ? (interval.duration / durationMultiplier) : (interval.distance / distanceMultiplier))  

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

    const distance = props.durationType === 'time' ? Math.floor(helpers.calculateDistance((width + dWidth) * durationMultiplier * interval.power, props.speed)) : helpers.floor((width + dWidth) * distanceMultiplier, 200)
    const duration = props.durationType === 'time' ? helpers.floor((width + dWidth) * durationMultiplier, 5) : Math.floor(helpers.calculateTime(interval.distance, props.speed) * 1 / interval.power)

    props.onChange({ ...interval, duration, distance, power: (height + dHeight) / powerMultiplier })
  }

  const handleResize = (dWidth: number, dHeight: number) => {       
    const distance = props.durationType === 'time' ? Math.floor(helpers.calculateDistance((width + dWidth) * durationMultiplier * interval.power, props.speed)) : helpers.floor((width + dWidth) * distanceMultiplier, 200)
    const duration = props.durationType === 'time' ? helpers.floor((width + dWidth) * durationMultiplier, 5) : Math.floor(helpers.calculateTime(interval.distance, props.speed) * 1 / interval.power)

    props.onChange({ ...interval, duration, distance, power: (height + dHeight) / powerMultiplier })
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
          distance={distance}
          cadence={interval.cadence}
          onCadenceChange={(cadence: number)=> handleCadenceChange(cadence)}
        />
      }
      <Resizable
        className='bar'
        size={{
          width: props.durationType === 'time' ? (interval.duration) / durationMultiplier : (interval.distance) / distanceMultiplier,
          height: interval.power * powerMultiplier,
        }}
        minWidth={3}
        minHeight={powerMultiplier * Zones.Z1.min}
        maxHeight={powerMultiplier * Zones.Z6.max}
        enable={{ top: true, right: true }}
        grid={[1, 1]}
        onResizeStop={(e, direction, ref, d) => handleResizeStop(d.width, d.height)}
        onResize={(e, direction, ref, d) => handleResize(d.width, d.height)}
        style={style}
      >
      </Resizable>
    </div>

  );
}

export default SteadyBar