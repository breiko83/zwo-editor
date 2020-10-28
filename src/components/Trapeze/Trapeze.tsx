import React, { useState } from 'react'
import './Trapeze.css'
import { Colors, Zones, ZonesArray } from '../Constants'
import { Resizable } from 're-resizable'
import moment from 'moment'
import 'moment-duration-format'
import Label from '../Label/Label'
import { processors } from 'xml2js'

interface IDictionary {
  [index: string]: number;
}

function round5(x: number)
{
  return Math.ceil(x/5)*5;
}

const Trapeze = (props: { id: string, time: number, startPower: number, endPower: number, ftp: number, pace: number, sportType: string, speed?: number, onChange: Function, onClick: Function, selected: boolean }) => {

  const multiplier = 250
  const timeMultiplier = 3

  const powerLabelStart = Math.round(props.startPower * props.ftp)
  const powerLabelEnd = Math.round(props.endPower * props.ftp)
  const durationLabel = getDuration(props.time / timeMultiplier)
  const [showLabel, setShowLabel] = useState(false)

  const avgPower = Math.abs((props.endPower + props.startPower) / 2)

  const [width, setWidth] = useState(Math.round(props.time / timeMultiplier / 3 ))

  const [height1, setHeight1] = useState(props.startPower * multiplier)
  const [height2, setHeight2] = useState(((props.endPower + props.startPower) * multiplier) / 2)
  const [height3, setHeight3] = useState(props.endPower * multiplier)

  const trapezeHeight = height3 > height1 ? height3 : height1
  const trapezeTop = height3 > height1 ? (height3 - height1) : (height1 - height3)

  const vertexB = height3 > height1 ? 0 : (width * 3)
  const vertexA = height3 > height1 ? trapezeTop : 0
  const vertexD = height3 > height1 ? 0 : trapezeTop

  var bars = height3 > height1 ? calculateColors(props.startPower, props.endPower) : calculateColors(props.endPower, props.startPower)
  const flexDirection = height3 > height1 ? 'row' : 'row-reverse'

  const handleResizeStop1 = (dHeight: number) => {    
    setHeight1(height1 + dHeight)
    setHeight2((height3 + dHeight + height1) / 2)
  }
  const handleResizeStop2 = (dHeight: number) => {
    setHeight2(height2 + dHeight)
    setHeight1(height1 + dHeight)
    setHeight3(height3 + dHeight)    
  }
  const handleResizeStop3 = (dWidth: number, dHeight: number) => {
    setWidth(width + (dWidth / 3))
    setHeight3(height3 + dHeight)
    setHeight2((height3 + dHeight + height1) / 2)
  }

  const handleResize1 = (dHeight: number) => {
    props.onChange(props.id, { time: round5(width * timeMultiplier * 3), startPower: (height1 + dHeight) / multiplier, endPower: height3 / multiplier, type: 'trapeze', pace: props.pace, id: props.id })
  }
  const handleResize2 = (dHeight: number) => {    
    props.onChange(props.id, { time: round5(width * timeMultiplier * 3), startPower: (height1 + dHeight) / multiplier, endPower: (height3 + dHeight) / multiplier, type: 'trapeze', pace: props.pace, id: props.id })
  }
  const handleResize3 = (dWidth: number, dHeight: number) => {    
    const newWidth = width + (dWidth / 3)    
    props.onChange(props.id, { time: round5(newWidth * timeMultiplier * 3), startPower: height1 / multiplier, endPower: (height3 + dHeight) / multiplier, type: 'trapeze', pace: props.pace, id: props.id })
  }

  function calculateColors(start: number, end: number) {

    const bars = {} as IDictionary;

    ZonesArray.forEach((zone, index) => {
      if (start >= zone[0] && start < zone[1]) {
        bars['Z' + (index + 1)] = zone[1] - start
      }
      else if (end >= zone[0] && end < zone[1]) {
        bars['Z' + (index + 1)] = end - zone[0]
      }
      else if (end >= zone[1] && start < zone[0]) {
        bars['Z' + (index + 1)] = zone[1] - zone[0]
      } else {
        bars['Z' + (index + 1)] = 0
      }
    })
    return bars
  }

  function getDuration(seconds: number) {
    // 1 pixel equals 3 seconds 
    return moment.duration(seconds * timeMultiplier, "seconds").format("mm:ss", { trim: false })
  }

  function zwiftStyle(zone: number) {

    if (zone >= 0 && zone < Zones.Z1.max) {
      // Z1 gray
      return Colors.GRAY
    } else if (zone >= Zones.Z2.min && zone < Zones.Z2.max) {
      // Z2 blue
      return Colors.BLUE
    } else if (zone >= Zones.Z3.min && zone < Zones.Z3.max) {
      // Z3 green
      return Colors.GREEN
    } else if (zone >= Zones.Z4.min && zone < Zones.Z4.max) {
      // Z4 yellow
      return Colors.YELLOW
    } else if (zone >= Zones.Z5.min && zone < Zones.Z5.max) {
      // Z5 orange      
      return Colors.ORANGE
    } else {
      // Z6 red          
      return Colors.RED
    }
  }

  return (
    <div className='segment'
      onMouseEnter={() => setShowLabel(true)}
      onMouseLeave={() => setShowLabel(false)}
      style={props.selected ? {zIndex:1}: {}}
      onClick={() => props.onClick(props.id)}
    >
      {showLabel &&
        <Label duration={durationLabel} powerStart={powerLabelStart} powerEnd={powerLabelEnd} ftp={props.ftp} sportType={props.sportType} pace={props.pace} distance={props.time * (props.speed || 0) * avgPower} />
      }
      <div className='trapeze' onClick={() => props.onClick(props.id)}>
        <Resizable
          className='trapeze-component'
          size={{
            width: width,
            height: height1,
          }}
          minWidth={3}
          minHeight={multiplier * Zones.Z1.min}
          maxHeight={multiplier * Zones.Z6.max}
          enable={{ top: true, right: true }}
          grid={[1, 1]}
          onResizeStop={(e, direction, ref, d) => handleResizeStop1(d.height)}
          onResize={(e, direction, ref, d) => handleResize1(d.height)}          
        >
        </Resizable>
        <Resizable
          className='trapeze-component'
          size={{
            width: width,
            height: height2,
          }}
          minWidth={3}
          minHeight={multiplier * Zones.Z1.min}
          maxHeight={multiplier * Zones.Z6.max}
          enable={{ top: true }}
          grid={[1, 1]}
          onResizeStop={(e, direction, ref, d) => handleResizeStop2(d.height)}
          onResize={(e, direction, ref, d) => handleResize2(d.height)}          
        >
        </Resizable>
        <Resizable
          className='trapeze-component'
          size={{
            width: width,
            height: height3,
          }}
          minWidth={3}
          minHeight={multiplier * Zones.Z1.min}
          maxHeight={multiplier * Zones.Z6.max}
          enable={{ top: true, right: true }}
          grid={[1, 1]}
          onResizeStop={(e, direction, ref, d) => handleResizeStop3(d.width, d.height)}
          onResize={(e, direction, ref, d) => handleResize3(d.width, d.height)}
        >
        </Resizable>
      </div>
      <div className='trapeze-colors' style={{ height: trapezeHeight, flexDirection: flexDirection, backgroundColor: zwiftStyle(props.startPower) }}>
        <div className='color' style={{ backgroundColor: Colors.GRAY, width: `${(bars['Z1'] * 100 / Math.abs(props.endPower - props.startPower))}%` }}></div>
        <div className='color' style={{ backgroundColor: Colors.BLUE, width: `${(bars['Z2'] * 100 / Math.abs(props.endPower - props.startPower))}%` }}></div>
        <div className='color' style={{ backgroundColor: Colors.GREEN, width: `${(bars['Z3'] * 100 / Math.abs(props.endPower - props.startPower))}%` }}></div>
        <div className='color' style={{ backgroundColor: Colors.YELLOW, width: `${(bars['Z4'] * 100 / Math.abs(props.endPower - props.startPower))}%` }}></div>
        <div className='color' style={{ backgroundColor: Colors.ORANGE, width: `${(bars['Z5'] * 100 / Math.abs(props.endPower - props.startPower))}%` }}></div>
        <div className='color' style={{ backgroundColor: Colors.RED, width: `${(bars['Z6'] * 100 / Math.abs(props.endPower - props.startPower))}%` }}></div>
      </div>
      <svg height={`${trapezeHeight}`} width={`${width * 3}`} className='trapeze-svg-container'>
        <polygon points={`0,${vertexA} 0,${trapezeHeight} ${width * 3},${trapezeHeight} ${width * 3},${vertexD}`} className='trapeze-svg' />
        <polygon points={`0,0 ${vertexB},${trapezeTop} ${width * 3},0`} className='trapeze-svg-off' />

        Sorry, your browser does not support inline SVG.
      </svg>
    </div>

  );
}

export default Trapeze