import React, { useState } from 'react'
import './Trapeze.css'
import { Colors, Zones } from './Constants'
import { Resizable } from 're-resizable'
import moment from 'moment'
import 'moment-duration-format'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt, faClock } from '@fortawesome/free-solid-svg-icons'

const Trapeze = ({ id, time, startPower, endPower, ftp, onChange, onClick }) => {

  const multiplier = 250

  const powerLabel = Math.round(endPower * ftp)
  const durationLabel = getDuration(time)
  const style = zwiftStyle(startPower)

  const [width, setWidth] = useState(time)

  const [height1, setHeight1] = useState(startPower * multiplier)
  const [height2, setHeight2] = useState((endPower - startPower / 2) * multiplier)
  const [height3, setHeight3] = useState(endPower * multiplier)

  const handleResizeStop1 = ({ e, direction, ref, d }) => {
    //setWidth(width + d.width)
    setHeight1(height1 + d.height)
    setHeight2((height3 + d.height + height1) / 2)
    //onChange(id, { time: width + d.width, power: (height + d.height) / multiplier, type: 'trapeze', id: id })
  }
  const handleResizeStop2 = ({ e, direction, ref, d }) => {
    //setWidth(width + d.width)
    setHeight2(height2 + d.height)
    setHeight1(height1 + d.height)
    setHeight3(height3 + d.height)
    //onChange(id, { time: width + d.width, power: (height + d.height) / multiplier, type: 'trapeze', id: id })
  }
  const handleResizeStop3 = ({ e, direction, ref, d }) => {
    //setWidth(width + d.width)
    setHeight3(height3 + d.height)
    setHeight2((height3 + d.height + height1) / 2)
    //onChange(id, { time: width + d.width, power: (height + d.height) / multiplier, type: 'trapeze', id: id })
  }

  const handleResize1 = ({ e, direction, ref, d }) => {
    onChange(id, { time: width + d.width, startPower: (height1 + d.height) / multiplier, endPower: (height3 + d.height) / multiplier, type: 'trapeze', id: id })
  }
  const handleResize2 = ({ e, direction, ref, d }) => {
    onChange(id, { time: width + d.width, power: (height2 + d.height) / multiplier, type: 'trapeze', id: id })
  }
  const handleResize3 = ({ e, direction, ref, d }) => {
    onChange(id, { time: width + d.width, startPower: (height1 + d.height) / multiplier, endPower: (height3 + d.height) / multiplier, type: 'trapeze', id: id })
  }

  function getDuration(seconds) {
    // 1 pixel equals 5 seconds 
    return moment.duration(seconds * 5, "seconds").format("mm:ss", { trim: false })
  }

  function zwiftStyle(zone) {

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
    <div className='segment'>
      <div className='label'>
        <FontAwesomeIcon icon={faClock} fixedWidth /> {durationLabel}
        <br />
        <FontAwesomeIcon icon={faBolt} fixedWidth /> {powerLabel}W
      </div>
      <div className='trapeze'>
        <Resizable
          className='bar'
          size={{
            width: width,
            height: height1,
          }}
          minWidth={3}
          minHeight={multiplier * Zones.Z1.min}
          maxHeight={multiplier * Zones.Z6.max}
          enable={{ top: true }}
          grid={[1, 1]}
          onResizeStop={(e, direction, ref, d) => handleResizeStop1({ e, direction, ref, d })}
          onResize={(e, direction, ref, d) => handleResize1({ e, direction, ref, d })}
          onClick={() => onClick(id)}
          style={style}
        >
        </Resizable>
        <Resizable
          className='bar'
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
          style={style}
        >
        </Resizable>
        <Resizable
          className='bar'
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
          style={style}
        >
        </Resizable>
      </div>
    </div>

  );
}

export default Trapeze