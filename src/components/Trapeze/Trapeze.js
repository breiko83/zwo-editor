import React, { useState } from 'react'
import './Trapeze.css'
import { Colors, Zones, ZonesArray } from '../Constants'
import { Resizable } from 're-resizable'
import moment from 'moment'
import 'moment-duration-format'
import Label from '../Label/Label'

const Trapeze = ({ id, time, startPower, endPower, ftp, onChange, onClick }) => {

  const multiplier = 250
  const timeMultiplier = 5

  const powerLabelStart = Math.round(startPower * ftp)
  const powerLabelEnd = Math.round(endPower * ftp)
  const durationLabel = getDuration(time / timeMultiplier)
  const [showLabel, setShowLabel] = useState(false)

  const [width, setWidth] = useState(Math.round(time / timeMultiplier / 3))

  const [height1, setHeight1] = useState(startPower * multiplier)
  const [height2, setHeight2] = useState(((endPower + startPower) * multiplier) / 2)
  const [height3, setHeight3] = useState(endPower * multiplier)

  const trapezeHeight = height3 > height1 ? height3 : height1
  const trapezeTop = height3 > height1 ? (height3 - height1) : (height1 - height3)

  const vertexB = height3 > height1 ? 0 : (width * 3)
  const vertexA = height3 > height1 ? trapezeTop : 0
  const vertexD = height3 > height1 ? 0 : trapezeTop

  var bars = height3 > height1 ? calculateColors(startPower, endPower) : calculateColors(endPower, startPower)
  const flexDirection = height3 > height1 ? 'row' : 'row-reverse'

  const handleResizeStop1 = ({ e, direction, ref, d }) => {
    //setWidth(width + d.width)
    setHeight1(height1 + d.height)
    setHeight2((height3 + d.height + height1) / 2)
    onChange(id, { time: Math.round(width * timeMultiplier * 3), startPower: (height1 + d.height) / multiplier, endPower: height3 / multiplier, type: 'trapeze', id: id })
    //onChange(id, { time: width + d.width, power: (height + d.height) / multiplier, type: 'trapeze', id: id })
  }
  const handleResizeStop2 = ({ e, direction, ref, d }) => {
    //setWidth(width + d.width)
    setHeight2(height2 + d.height)
    setHeight1(height1 + d.height)
    setHeight3(height3 + d.height)
    onChange(id, { time: Math.round(width * timeMultiplier * 3), startPower: (height1 + d.height) / multiplier, endPower: (height3 + d.height) / multiplier, type: 'trapeze', id: id })
    //onChange(id, { time: width + d.width, power: (height + d.height) / multiplier, type: 'trapeze', id: id })
  }
  const handleResizeStop3 = ({ e, direction, ref, d }) => {
    setWidth(width + (d.width / 3))
    setHeight3(height3 + d.height)
    setHeight2((height3 + d.height + height1) / 2)

    //onChange(id, { time: (width * timeMultiplier * 3) + (d.width * timeMultiplier), startPower: height1 / multiplier, endPower: (height3 + d.height) / multiplier, type: 'trapeze', id: id })
    //onChange(id, { time: width + d.width, power: (height + d.height) / multiplier, type: 'trapeze', id: id })
  }

  const handleResize1 = ({ e, direction, ref, d }) => {
    //onChange(id, { time: width + d.width, startPower: (height1 + d.height) / multiplier, endPower: (height3 + d.height) / multiplier, type: 'trapeze', id: id })
  }
  const handleResize2 = ({ e, direction, ref, d }) => {
    //onChange(id, { time: width + d.width, startPower: (height1 + d.height) / multiplier, endPower:  height3 / multiplier, type: 'trapeze', id: id })
  }
  const handleResize3 = ({ e, direction, ref, d }) => {
    //onChange(id, { time: width + d.width, startPower: (height1 + d.height) / multiplier, endPower: (height3 + d.height) / multiplier, type: 'trapeze', id: id })
    onChange(id, { time: Math.round((width * timeMultiplier * 3) + (d.width * timeMultiplier)), startPower: height1 / multiplier, endPower: (height3 + d.height) / multiplier, type: 'trapeze', id: id })
  }

  function calculateColors(start, end) {

    const bars = []

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

  function getDuration(seconds) {
    // 1 pixel equals 5 seconds 
    return moment.duration(seconds * 5, "seconds").format("mm:ss", { trim: false })
  }

  function zwiftStyle(zone) {

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
    >
      {showLabel &&
        <Label duration={durationLabel} powerStart={powerLabelStart} powerEnd={powerLabelEnd} />
      }
      <div className='trapeze'>
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
          onResizeStop={(e, direction, ref, d) => handleResizeStop1({ e, direction, ref, d })}
          onResize={(e, direction, ref, d) => handleResize1({ e, direction, ref, d })}
          onClick={() => onClick(id)}
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
          onResizeStop={(e, direction, ref, d) => handleResizeStop2({ e, direction, ref, d })}
          onResize={(e, direction, ref, d) => handleResize2({ e, direction, ref, d })}
          onClick={() => onClick(id)}
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
          onResizeStop={(e, direction, ref, d) => handleResizeStop3({ e, direction, ref, d })}
          onResize={(e, direction, ref, d) => handleResize3({ e, direction, ref, d })}
          onClick={() => onClick(id)}
        >
        </Resizable>
      </div>
      <div className='trapeze-colors' style={{ height: trapezeHeight, flexDirection: flexDirection, backgroundColor: zwiftStyle(startPower) }}>
        <div className='color' style={{ backgroundColor: Colors.GRAY, width: `${(bars['Z1'] * 100 / Math.abs(endPower - startPower))}%` }}></div>
        <div className='color' style={{ backgroundColor: Colors.BLUE, width: `${(bars['Z2'] * 100 / Math.abs(endPower - startPower))}%` }}></div>
        <div className='color' style={{ backgroundColor: Colors.GREEN, width: `${(bars['Z3'] * 100 / Math.abs(endPower - startPower))}%` }}></div>
        <div className='color' style={{ backgroundColor: Colors.YELLOW, width: `${(bars['Z4'] * 100 / Math.abs(endPower - startPower))}%` }}></div>
        <div className='color' style={{ backgroundColor: Colors.ORANGE, width: `${(bars['Z5'] * 100 / Math.abs(endPower - startPower))}%` }}></div>
        <div className='color' style={{ backgroundColor: Colors.RED, width: `${(bars['Z6'] * 100 / Math.abs(endPower - startPower))}%` }}></div>
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