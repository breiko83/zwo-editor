import React, { useState } from 'react'
import './RampBar.css'
import { zoneColor, ZoneColor, Zones, ZonesArray } from '../../types/Zones'
import { Resizable } from 're-resizable'
import Label from '../Label/Label'
import helpers from '../helpers'
import { RampInterval } from '../../types/Interval'
import { durationMultiplier, intensityMultiplier } from './multipliers'
import { WorkoutMode } from '../../modes/WorkoutMode'

interface IDictionary {
  [index: string]: number;
}

interface RampBarProps {
  interval: RampInterval;
  mode: WorkoutMode;
  onChange: (interval: RampInterval) => void;
  onClick: (id: string) => void;
  selected: boolean;
}

const RampBar = ({interval, ...props}: RampBarProps) => {
  const [showLabel, setShowLabel] = useState(false)

  const handleCadenceChange = (cadence: number) => {
    props.onChange({ ...interval, cadence: cadence })
  }

  // RUN WORKOUTS ON DISTANCE - BIKE WORKOUTS ON TIME
  const [width, setWidth] = useState(Math.round(interval.duration / durationMultiplier / 3 ))

  const [height1, setHeight1] = useState(interval.startIntensity * intensityMultiplier)
  const [height2, setHeight2] = useState(((interval.endIntensity + interval.startIntensity) * intensityMultiplier) / 2)
  const [height3, setHeight3] = useState(interval.endIntensity * intensityMultiplier)

  const trapezeHeight = height3 > height1 ? height3 : height1
  const trapezeTop = height3 > height1 ? (height3 - height1) : (height1 - height3)

  const vertexB = height3 > height1 ? 0 : (width * 3)
  const vertexA = height3 > height1 ? trapezeTop : 0
  const vertexD = height3 > height1 ? 0 : trapezeTop

  var bars = height3 > height1 ? calculateColors(interval.startIntensity, interval.endIntensity) : calculateColors(interval.endIntensity, interval.startIntensity)
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
    props.onChange({
      ...interval,
      duration: helpers.floor(width * durationMultiplier * 3, 5),
      startIntensity: (height1 + dHeight) / intensityMultiplier,
      endIntensity: height3 / intensityMultiplier,
    })
  }
  const handleResize2 = (dHeight: number) => {
    props.onChange({
      ...interval,
      duration: helpers.floor(width * durationMultiplier * 3, 5),
      startIntensity: (height1 + dHeight) / intensityMultiplier,
      endIntensity: (height3 + dHeight) / intensityMultiplier,
    })
  }
  const handleResize3 = (dWidth: number, dHeight: number) => {
    const newWidth = width + (dWidth / 3)

    props.onChange({
      ...interval,
      duration: helpers.floor(newWidth * durationMultiplier * 3, 5),
      startIntensity: height1 / intensityMultiplier,
      endIntensity: (height3 + dHeight) / intensityMultiplier
    })
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
          interval={interval}
          mode={props.mode}
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
          minHeight={intensityMultiplier * Zones.Z1.min}
          maxHeight={intensityMultiplier * Zones.Z6.max}
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
          minHeight={intensityMultiplier * Zones.Z1.min}
          maxHeight={intensityMultiplier * Zones.Z6.max}
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
          minHeight={intensityMultiplier * Zones.Z1.min}
          maxHeight={intensityMultiplier * Zones.Z6.max}
          enable={{ top: true, right: true }}
          grid={[1, 1]}
          onResizeStop={(e, direction, ref, d) => handleResizeStop3(d.width, d.height)}
          onResize={(e, direction, ref, d) => handleResize3(d.width, d.height)}
        >
        </Resizable>
      </div>
      <div className='trapeze-colors' style={{ height: trapezeHeight, flexDirection: flexDirection, backgroundColor: zoneColor(interval.startIntensity) }}>
        <div className='color' style={{ backgroundColor: ZoneColor.GRAY, width: `${(bars['Z1'] * 100 / Math.abs(interval.endIntensity - interval.startIntensity))}%` }}></div>
        <div className='color' style={{ backgroundColor: ZoneColor.BLUE, width: `${(bars['Z2'] * 100 / Math.abs(interval.endIntensity - interval.startIntensity))}%` }}></div>
        <div className='color' style={{ backgroundColor: ZoneColor.GREEN, width: `${(bars['Z3'] * 100 / Math.abs(interval.endIntensity - interval.startIntensity))}%` }}></div>
        <div className='color' style={{ backgroundColor: ZoneColor.YELLOW, width: `${(bars['Z4'] * 100 / Math.abs(interval.endIntensity - interval.startIntensity))}%` }}></div>
        <div className='color' style={{ backgroundColor: ZoneColor.ORANGE, width: `${(bars['Z5'] * 100 / Math.abs(interval.endIntensity - interval.startIntensity))}%` }}></div>
        <div className='color' style={{ backgroundColor: ZoneColor.RED, width: `${(bars['Z6'] * 100 / Math.abs(interval.endIntensity - interval.startIntensity))}%` }}></div>
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
