import React, { useState, useEffect } from 'react'
import './Bar.css'
import { Colors, Zones } from '../Constants'
import { Resizable } from 're-resizable'
import Label from '../Label/Label'
import helpers from '../helpers'



const Bar = (props: { id: string, time?: number, length?:number, power: number, cadence: number, ftp: number, weight: number, pace: number, sportType: string, durationType: string, speed?: number, onChange: Function, onClick: Function, selected: boolean, showLabel: boolean }) => {

  const multiplier = 250
  const timeMultiplier = 3
  const lengthMultiplier = 10

  const powerLabel = Math.round(props.power * props.ftp)

  // TIME
  const duration = helpers.formatDuration(props.time)

  // DISTANCE
  const distance = props.length
  
  
  // USED ONLY ON RUN WORKOUT
  // const distance = props.length

  // time is set -> calculate distance
  // distance is set -> calculate time


  const style = zwiftStyle(props.power)

  // RUN WORKOUTS ON DISTANCE - BIKE WORKOUTS ON TIME
  const [width, setWidth] = useState(props.durationType === 'time' ? ((props.time || 0) / timeMultiplier) : ((props.length || 0) / lengthMultiplier))  
  
  

  const [height, setHeight] = useState(props.power * multiplier)  

  const [showLabel, setShowLabel] = useState(false)

  const [selected, setSelected] = useState(props.selected)
  
  useEffect(()=>{
    setSelected(props.selected) 
  },[props.selected])


  const handleResizeStop = (dWidth: number, dHeight: number) => {
    setWidth(width + dWidth)
    setHeight(height + dHeight)

    const length = props.durationType === 'time' ? helpers.round(helpers.calculateDistance((width + dWidth) * timeMultiplier * 1 / props.power, props.speed),1) : helpers.round((width + dWidth) * lengthMultiplier, 200)
    const time = props.durationType === 'time' ? helpers.round((width + dWidth) * timeMultiplier, 5) : helpers.round(helpers.calculateTime(props.length, props.speed) * 1 / props.power,1)
    

    props.onChange(props.id, { time: time, length: length, power: (height + dHeight) / multiplier, cadence: props.cadence, type: 'bar', pace: props.pace, id: props.id })
  }

  const handleResize = (dWidth: number, dHeight: number) => {       
      
    const length = props.durationType === 'time' ? helpers.round(helpers.calculateDistance((width + dWidth) * timeMultiplier * 1 / props.power, props.speed),1) : helpers.round((width + dWidth) * lengthMultiplier, 200)
    const time = props.durationType === 'time' ? helpers.round((width + dWidth) * timeMultiplier, 5) : helpers.round(helpers.calculateTime(props.length, props.speed) * 1 / props.power,1)

    props.onChange(props.id, { time: time, length: length, power: (height + dHeight) / multiplier, cadence: props.cadence, type: 'bar', pace: props.pace, id: props.id })
  }

  function zwiftStyle(zone: number) {

    if (zone >= 0 && zone < Zones.Z1.max) {
      // Z1 gray
      return { backgroundColor: Colors.GRAY }
    } else if (zone >= Zones.Z2.min && zone < Zones.Z2.max) {
      // Z2 blue
      return { backgroundColor: Colors.BLUE }
    } else if (zone >= Zones.Z3.min && zone < Zones.Z3.max) {
      // Z3 green
      return { backgroundColor: Colors.GREEN }
    } else if (zone >= Zones.Z4.min && zone < Zones.Z4.max) {
      // Z4 yellow
      return { backgroundColor: Colors.YELLOW }
    } else if (zone >= Zones.Z5.min && zone < Zones.Z5.max) {
      // Z5 orange      
      return { backgroundColor: Colors.ORANGE }
    } else {
      // Z6 red          
      return { backgroundColor: Colors.RED }
    }
  }

  return (
    <div className='segment'
      onMouseEnter={() => setShowLabel(true)}
      onMouseLeave={() => setShowLabel(false)}
      onClick={() => props.onClick(props.id)}
      style={props.selected ? { zIndex: 10 } : {}}
    >
      {((selected || showLabel) && (props.showLabel)) &&
        <Label sportType={props.sportType} duration={duration} power={powerLabel} weight={props.weight} ftp={props.ftp} pace={props.pace} distance={distance} />
      }
      <Resizable
        className='bar'
        size={{
          width: props.durationType === 'time' ? (props.time || 0) / timeMultiplier : (props.length || 0) / lengthMultiplier,
          height: props.power * multiplier,
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

export default Bar