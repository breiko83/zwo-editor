import React, { useState } from 'react'
import './RampBar.css'
import { Colors, Zones, ZonesArray } from '../Constants'
import { Resizable } from 're-resizable'
import Label from '../Label/Label'
import helpers from '../helpers'
import { RampInterval } from '../Interval'
import { distanceMultiplier, durationMultiplier, powerMultiplier } from './multipliers'

interface IDictionary {
  [index: string]: number;
}

interface RampBarProps {
  interval: RampInterval;
  ftp: number;
  sportType: string;
  durationType: string;
  speed: number;
  onChange: (interval: RampInterval) => void;
  onClick: (id: string) => void;
  selected: boolean;
}

const RampBar = ({interval, ...props}: RampBarProps) => {
  const powerLabelStart = Math.round(interval.startPower * props.ftp)
  const powerLabelEnd = Math.round(interval.endPower * props.ftp)

  const avgPower = Math.abs((interval.endPower + interval.startPower) / 2)

  const [showLabel, setShowLabel] = useState(false)

  const handleCadenceChange = (cadence: number) => {
    props.onChange({ ...interval, cadence: cadence })
  }

  // RUN WORKOUTS ON DISTANCE - BIKE WORKOUTS ON TIME
  const [width, setWidth] = useState(props.durationType === 'time' ? Math.round((interval.duration) / durationMultiplier / 3 ) : ((interval.distance) / distanceMultiplier / 3))

  const [height1, setHeight1] = useState(interval.startPower * powerMultiplier)
  const [height2, setHeight2] = useState(((interval.endPower + interval.startPower) * powerMultiplier) / 2)
  const [height3, setHeight3] = useState(interval.endPower * powerMultiplier)

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
    const duration = props.durationType === 'time' ? helpers.floor(width * durationMultiplier * 3, 5) : Math.floor(helpers.calculateTime(interval.distance, props.speed) * 1 / avgPower)
    const distance = props.durationType === 'time' ? Math.floor(helpers.calculateDistance(width * durationMultiplier, props.speed) * 1 / avgPower) : helpers.floor(width * distanceMultiplier * 3, 200)

    props.onChange({ ...interval, duration, distance, startPower: (height1 + dHeight) / powerMultiplier, endPower: height3 / powerMultiplier })
  }
  const handleResize2 = (dHeight: number) => {    
    const duration = props.durationType === 'time' ? helpers.floor(width * durationMultiplier * 3, 5) : Math.floor(helpers.calculateTime(interval.distance, props.speed) * 1 / avgPower)
    const distance = props.durationType === 'time' ? Math.floor(helpers.calculateDistance(width * durationMultiplier, props.speed) * 1 / avgPower) : helpers.floor(width * distanceMultiplier * 3, 200)

    props.onChange({ ...interval, duration, distance, startPower: (height1 + dHeight) / powerMultiplier, endPower: (height3 + dHeight) / powerMultiplier })
  }
  const handleResize3 = (dWidth: number, dHeight: number) => {    
    const newWidth = width + (dWidth / 3)    

    const distance = props.durationType === 'time' ? Math.floor(helpers.calculateDistance(newWidth * durationMultiplier, props.speed) * 1 / avgPower) : helpers.floor(newWidth * distanceMultiplier * 3, 200)
    const duration = props.durationType === 'time' ? helpers.floor(newWidth * durationMultiplier * 3, 5) : Math.floor(helpers.calculateTime(interval.distance, props.speed) * 1 / avgPower)

    props.onChange({ ...interval, duration, distance, startPower: height1 / powerMultiplier, endPower: (height3 + dHeight) / powerMultiplier })
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
          powerStart={powerLabelStart}
          powerEnd={powerLabelEnd}
          ftp={props.ftp}
          sportType={props.sportType}
          pace={interval.pace}
          distance={interval.distance}
          cadence={interval.cadence}
          onCadenceChange={(cadence: number)=> handleCadenceChange(cadence)}
        />
      }
      <div className='trapeze' onClick={() => props.onClick(interval.id)}>
        <Resizable
          className='trapeze-component'
          size={{
            width: width,
            height: height1,
          }}
          minWidth={3}
          minHeight={powerMultiplier * Zones.Z1.min}
          maxHeight={powerMultiplier * Zones.Z6.max}
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
          minHeight={powerMultiplier * Zones.Z1.min}
          maxHeight={powerMultiplier * Zones.Z6.max}
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
          minHeight={powerMultiplier * Zones.Z1.min}
          maxHeight={powerMultiplier * Zones.Z6.max}
          enable={{ top: true, right: true }}
          grid={[1, 1]}
          onResizeStop={(e, direction, ref, d) => handleResizeStop3(d.width, d.height)}
          onResize={(e, direction, ref, d) => handleResize3(d.width, d.height)}
        >
        </Resizable>
      </div>
      <div className='trapeze-colors' style={{ height: trapezeHeight, flexDirection: flexDirection, backgroundColor: helpers.zoneColor(interval.startPower) }}>
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

export default RampBar
