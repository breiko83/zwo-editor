import React, { useState, useEffect } from 'react'
import './Bar.css'
import { Colors, Zones } from '../Constants'
import { Resizable } from 're-resizable'
import moment from 'moment'
import 'moment-duration-format'
import Label from '../Label/Label'

function round5(x: number)
{
  return Math.ceil(x/5)*5;
}

const Bar = (props: { id: string, time: number, power: number, cadence: number, ftp: number, weight: number, onChange: Function, onClick: Function, selected: boolean }) => {

  const multiplier = 250
  const timeMultiplier = 3

  const powerLabel = Math.round(props.power * props.ftp)
  const durationLabel = getDuration(props.time)
  const style = zwiftStyle(props.power)

  const [width, setWidth] = useState(props.time / timeMultiplier)
  const [height, setHeight] = useState(props.power * multiplier)  

  const [showLabel, setShowLabel] = useState(false)

  const [selected, setSelected] = useState(props.selected)
  useEffect(()=>{
    setSelected(props.selected)
  },[props.selected])

  const handleResizeStop = (dWidth: number, dHeight: number) => {
    setWidth(width + dWidth)
    setHeight(height + dHeight)
    props.onChange(props.id, { time: round5((width + dWidth) * timeMultiplier), power: (height + dHeight) / multiplier, cadence: props.cadence, type: 'bar', id: props.id })
  }

  const handleResize = (dWidth: number, dHeight: number) => {
    props.onChange(props.id, { time: round5((width + dWidth) * timeMultiplier), power: (height + dHeight) / multiplier, cadence: props.cadence, type: 'bar', id: props.id })
  }

  function getDuration(seconds: number) {
    // 1 pixel equals 5 seconds 
    return moment.duration(seconds, "seconds").format("mm:ss", { trim: false })
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
      {(selected || showLabel) &&
        <Label duration={durationLabel} power={powerLabel} weight={props.weight} ftp={props.ftp} />
      }
      <Resizable
        className='bar'
        size={{
          width: props.time / timeMultiplier,
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