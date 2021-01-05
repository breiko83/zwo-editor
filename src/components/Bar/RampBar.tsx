import React, { useState } from 'react'
import './RampBar.css'
import { zoneColor, ZoneColor, Zones, ZonesArray } from '../../types/Zones'
import { Resizable } from 're-resizable'
import Label from '../Label/Label'
import { RampInterval } from '../../types/Interval'
import { durationMultiplier, intensityMultiplier } from './multipliers'
import { WorkoutMode } from '../../modes/WorkoutMode'
import { floor } from '../../utils/math'

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

  const [width, setWidth] = useState(Math.round(interval.duration / durationMultiplier))

  const [startHeight, setStartHeight] = useState(interval.startIntensity * intensityMultiplier)
  const [endHeight, setEndHeight] = useState(interval.endIntensity * intensityMultiplier)

  const handleStartResizeStop = (dHeight: number) => {    
    setStartHeight(startHeight + dHeight)
  }
  const handleEndResizeStop = (dWidth: number, dHeight: number) => {
    setWidth(width + dWidth)
    setEndHeight(endHeight + dHeight)
  }

  const handleStartResize = (dHeight: number) => {
    props.onChange({
      ...interval,
      startIntensity: (startHeight + dHeight) / intensityMultiplier,
    })
  }
  const handleEndResize = (dWidth: number, dHeight: number) => {
    const newWidth = width + dWidth

    props.onChange({
      ...interval,
      duration: floor(newWidth * durationMultiplier, 5),
      startIntensity: startHeight / intensityMultiplier,
      endIntensity: (endHeight + dHeight) / intensityMultiplier
    })
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
            width: width / 2,
            height: startHeight,
          }}
          minWidth={3}
          minHeight={intensityMultiplier * Zones.Z1.min}
          maxHeight={intensityMultiplier * Zones.Z6.max}
          enable={{ top: true, right: true }}
          grid={[1, 1]}
          onResizeStop={(e, direction, ref, d) => handleStartResizeStop(d.height)}
          onResize={(e, direction, ref, d) => handleStartResize(d.height)}          
        >
        </Resizable>
        <Resizable
          className='trapeze-component'
          size={{
            width: width / 2,
            height: endHeight,
          }}
          minWidth={3}
          minHeight={intensityMultiplier * Zones.Z1.min}
          maxHeight={intensityMultiplier * Zones.Z6.max}
          enable={{ top: true, right: true }}
          grid={[1, 1]}
          onResizeStop={(e, direction, ref, d) => handleEndResizeStop(d.width, d.height)}
          onResize={(e, direction, ref, d) => handleEndResize(d.width, d.height)}
        >
        </Resizable>
      </div>
      <Rainbow interval={interval} startHeight={startHeight} endHeight={endHeight} />
      <SvgPolygons width={width} startHeight={startHeight} endHeight={endHeight} />
    </div>
  );
}

const Rainbow: React.FC<{interval: RampInterval, startHeight: number, endHeight: number}> = ({interval, startHeight, endHeight}) => {
  const trapezeHeight = endHeight > startHeight ? endHeight : startHeight;
  const bars = endHeight > startHeight ? calculateColors(interval.startIntensity, interval.endIntensity) : calculateColors(interval.endIntensity, interval.startIntensity);
  const flexDirection = endHeight > startHeight ? 'row' : 'row-reverse';

  return (
    <div className='trapeze-colors' style={{ height: trapezeHeight, flexDirection: flexDirection, backgroundColor: zoneColor(interval.startIntensity) }}>
      <div className='color' style={{ backgroundColor: ZoneColor.GRAY, width: `${(bars['Z1'] * 100 / Math.abs(interval.endIntensity - interval.startIntensity))}%` }}></div>
      <div className='color' style={{ backgroundColor: ZoneColor.BLUE, width: `${(bars['Z2'] * 100 / Math.abs(interval.endIntensity - interval.startIntensity))}%` }}></div>
      <div className='color' style={{ backgroundColor: ZoneColor.GREEN, width: `${(bars['Z3'] * 100 / Math.abs(interval.endIntensity - interval.startIntensity))}%` }}></div>
      <div className='color' style={{ backgroundColor: ZoneColor.YELLOW, width: `${(bars['Z4'] * 100 / Math.abs(interval.endIntensity - interval.startIntensity))}%` }}></div>
      <div className='color' style={{ backgroundColor: ZoneColor.ORANGE, width: `${(bars['Z5'] * 100 / Math.abs(interval.endIntensity - interval.startIntensity))}%` }}></div>
      <div className='color' style={{ backgroundColor: ZoneColor.RED, width: `${(bars['Z6'] * 100 / Math.abs(interval.endIntensity - interval.startIntensity))}%` }}></div>
    </div>
  );
};

function calculateColors(start: number, end: number): IDictionary {
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

const SvgPolygons: React.FC<{width: number, startHeight: number, endHeight: number}> = ({width, startHeight, endHeight}) => {
  const trapezeHeight = endHeight > startHeight ? endHeight : startHeight;
  const trapezeTop = endHeight > startHeight ? (endHeight - startHeight) : (startHeight - endHeight);

  const vertexB = endHeight > startHeight ? 0 : width;
  const vertexA = endHeight > startHeight ? trapezeTop : 0;
  const vertexD = endHeight > startHeight ? 0 : trapezeTop;

  return (
    <svg height={`${trapezeHeight}`} width={`${width}`} className='trapeze-svg-container'>
      <polygon points={`0,${vertexA} 0,${trapezeHeight} ${width},${trapezeHeight} ${width},${vertexD}`} className='trapeze-svg' />
      <polygon points={`0,0 ${vertexB},${trapezeTop} ${width},0`} className='trapeze-svg-off' />
    </svg>
  );
};

export default RampBar
