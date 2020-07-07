import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt, faClock } from '@fortawesome/free-solid-svg-icons'
import './Label.css'

const Label = (props: { duration: string, power: number, powerStart?: number, powerEnd?: number, weight: number }) => {

  return (
    <div className='label'>
      {props.duration &&
        <div>
          <FontAwesomeIcon icon={faClock} fixedWidth /> {props.duration}
        </div>
      }
      {props.power &&
        <div>
          <FontAwesomeIcon icon={faBolt} fixedWidth /> {props.power}W
        </div>
      }
      {props.powerStart && props.powerEnd &&
        <div>
          <FontAwesomeIcon icon={faBolt} fixedWidth /> {props.powerStart}W - {props.powerEnd}W
        </div>
      }
      {props.weight && props.power &&
        <div>
          {(props.power / props.weight).toFixed(1)}W/Kg
        </div>
      }
    </div>
  )
}

export default Label