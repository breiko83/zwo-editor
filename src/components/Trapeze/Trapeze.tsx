import React, { useState } from 'react'
import './Trapeze.css'
import { Colors, Zones, ZonesArray } from '../Constants'
import { Resizable } from 're-resizable'
import Label from '../Label/Label'
import helpers from '../helpers'
import { RampInterval } from '../Interval'

interface IDictionary {
  [index: string]: number;
}

interface TrapezeProps {
  interval: RampInterval;
  ftp: number;
  sportType: string;
  durationType: string;
  speed: number;
  onChange: (id: string, interval: RampInterval) => void;
  onClick: (id: string) => void;
  selected: boolean;
}

const Trapeze = ({interval, ...props}: TrapezeProps) => {
  const multiplier = 250
  const timeMultiplier = 3
  const lengthMultiplier = 10

  const powerLabelStart = Math.round(interval.startPower * props.ftp)
  const powerLabelEnd = Math.round(interval.endPower * props.ftp)

  const avgPower = Math.abs((interval.endPower + interval.startPower) / 2)

  const durationLabel = helpers.formatDuration(interval.time)

  const [showLabel, setShowLabel] = useState(false)

  const handleCadenceChange = (cadence: number) => {
    props.onChange(interval.id, { time: interval.time, length: interval.length, startPower: interval.startPower, endPower: interval.endPower, cadence: cadence, type: 'ramp', pace: interval.pace, id: interval.id })
  }

  // RUN WORKOUTS ON DISTANCE - BIKE WORKOUTS ON TIME
  const [width, setWidth] = useState(props.durationType === 'time' ? Math.round((interval.time) / timeMultiplier / 3 ) : ((interval.length) / lengthMultiplier / 3))

  const [height1, setHeight1] = useState(interval.startPower * multiplier)
  const [height2, setHeight2] = useState(((interval.endPower + interval.startPower) * multiplier) / 2)
  const [height3, setHeight3] = useState(interval.endPower * multiplier)

  const trapezeHeight = height3 > height1 ? height3 : height1
  const trapezeTop = height3 > height1 ? (height3 - height1) : (height1 - height3)

  const vertexB = height3 > height1 ? 0 : (width * 3)
  const vertexA = height3 > height1 ? trapezeTop : 0
  const vertexD = height3 > height1 ? 0 : trapezeTop

  var bars = height3 > height1 ? calculateColors(interval.startPower, interval.endPower) : calculateColors(interval.endPower, interval.startPower)
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
    
    const time = props.durationType === 'time' ? helpers.round(width * timeMultiplier * 3, 5) : helpers.round(helpers.calculateTime(interval.length, props.speed) * 1 / avgPower, 1)
    const length = props.durationType === 'time' ? helpers.round(helpers.calculateDistance(width * timeMultiplier, props.speed) * 1 / avgPower ,1) : helpers.round(width * lengthMultiplier * 3, 200)

    props.onChange(interval.id, { time: time, length: length, startPower: (height1 + dHeight) / multiplier, endPower: height3 / multiplier, cadence: interval.cadence, type: 'ramp', pace: interval.pace, id: interval.id })
  }
  const handleResize2 = (dHeight: number) => {    
    
    const time = props.durationType === 'time' ? helpers.round(width * timeMultiplier * 3, 5) : helpers.round(helpers.calculateTime(interval.length, props.speed) * 1 / avgPower, 1)
    const length = props.durationType === 'time' ? helpers.round(helpers.calculateDistance(width * timeMultiplier, props.speed) * 1 / avgPower ,1) : helpers.round(width * lengthMultiplier * 3, 200)

    props.onChange(interval.id, { time: time, length: length, startPower: (height1 + dHeight) / multiplier, endPower: (height3 + dHeight) / multiplier, cadence: interval.cadence, type: 'ramp', pace: interval.pace, id: interval.id })
  }
  const handleResize3 = (dWidth: number, dHeight: number) => {    
    const newWidth = width + (dWidth / 3)    

    const length = props.durationType === 'time' ? helpers.round(helpers.calculateDistance(newWidth * timeMultiplier, props.speed) * 1 / avgPower ,1) : helpers.round(newWidth * lengthMultiplier * 3, 200)
    const time = props.durationType === 'time' ? helpers.round(newWidth * timeMultiplier * 3, 5) : helpers.round(helpers.calculateTime(interval.length, props.speed) * 1 / avgPower, 1)


    props.onChange(interval.id, { time: time, length: length, startPower: height1 / multiplier, endPower: (height3 + dHeight) / multiplier, cadence: interval.cadence, type: 'ramp', pace: interval.pace, id: interval.id })
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
      onClick={() => props.onClick(interval.id)}
    >
      {(props.selected || showLabel) &&
        <Label duration={durationLabel} powerStart={powerLabelStart} powerEnd={powerLabelEnd} ftp={props.ftp} sportType={props.sportType} pace={interval.pace} distance={interval.length} cadence={interval.cadence} setCadence={(cadence: number)=> handleCadenceChange(cadence)} />
      }
      <div className='trapeze' onClick={() => props.onClick(interval.id)}>
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
      <div className='trapeze-colors' style={{ height: trapezeHeight, flexDirection: flexDirection, backgroundColor: zwiftStyle(interval.startPower) }}>
        <div className='color' style={{ backgroundColor: Colors.GRAY, width: `${(bars['Z1'] * 100 / Math.abs(interval.endPower - interval.startPower))}%` }}></div>
        <div className='color' style={{ backgroundColor: Colors.BLUE, width: `${(bars['Z2'] * 100 / Math.abs(interval.endPower - interval.startPower))}%` }}></div>
        <div className='color' style={{ backgroundColor: Colors.GREEN, width: `${(bars['Z3'] * 100 / Math.abs(interval.endPower - interval.startPower))}%` }}></div>
        <div className='color' style={{ backgroundColor: Colors.YELLOW, width: `${(bars['Z4'] * 100 / Math.abs(interval.endPower - interval.startPower))}%` }}></div>
        <div className='color' style={{ backgroundColor: Colors.ORANGE, width: `${(bars['Z5'] * 100 / Math.abs(interval.endPower - interval.startPower))}%` }}></div>
        <div className='color' style={{ backgroundColor: Colors.RED, width: `${(bars['Z6'] * 100 / Math.abs(interval.endPower - interval.startPower))}%` }}></div>
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