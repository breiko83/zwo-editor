import React, { useState, useEffect } from 'react'
import './SteadyBar.css'
import { Zones } from '../Constants'
import { Resizable } from 're-resizable'
import Label from '../Label/Label'
import helpers from '../helpers'
import { SteadyInterval } from '../Interval'

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
  const multiplier = 250
  const timeMultiplier = 3
  const distanceMultiplier = 10

  const powerLabel = Math.round(interval.power * props.ftp)

  // DISTANCE
  const distance = interval.distance
  
  // USED ONLY ON RUN WORKOUT
  // const distance = interval.length

  // time is set -> calculate distance
  // distance is set -> calculate time

  const style = { backgroundColor: helpers.zoneColor(interval.power) }

  // RUN WORKOUTS ON DISTANCE - BIKE WORKOUTS ON TIME
  const [width, setWidth] = useState(props.durationType === 'time' ? (interval.time / timeMultiplier) : (interval.distance / distanceMultiplier))  

  const [height, setHeight] = useState(interval.power * multiplier)  

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

    const distance = props.durationType === 'time' ? Math.floor(helpers.calculateDistance((width + dWidth) * timeMultiplier * interval.power, props.speed)) : helpers.floor((width + dWidth) * distanceMultiplier, 200)
    const time = props.durationType === 'time' ? helpers.floor((width + dWidth) * timeMultiplier, 5) : Math.floor(helpers.calculateTime(interval.distance, props.speed) * 1 / interval.power)

    props.onChange({ ...interval, time, distance, power: (height + dHeight) / multiplier })
  }

  const handleResize = (dWidth: number, dHeight: number) => {       
    const distance = props.durationType === 'time' ? Math.floor(helpers.calculateDistance((width + dWidth) * timeMultiplier * interval.power, props.speed)) : helpers.floor((width + dWidth) * distanceMultiplier, 200)
    const time = props.durationType === 'time' ? helpers.floor((width + dWidth) * timeMultiplier, 5) : Math.floor(helpers.calculateTime(interval.distance, props.speed) * 1 / interval.power)

    props.onChange({ ...interval, time, distance, power: (height + dHeight) / multiplier })
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
          time={interval.time}
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
          width: props.durationType === 'time' ? (interval.time) / timeMultiplier : (interval.distance) / distanceMultiplier,
          height: interval.power * multiplier,
        }}
        minWidth={3}
        minHeight={multiplier * Zones.Z1.min}
        maxHeight={multiplier * Zones.Z6.max}
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