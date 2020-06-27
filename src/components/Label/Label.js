import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt, faClock, faBalanceScale} from '@fortawesome/free-solid-svg-icons'
import './Label.css'

const Label = ({ duration, power, powerStart, powerEnd, weight }) => {

  return (
    <div className='label'>
      {duration &&
        <div>
          <FontAwesomeIcon icon={faClock} fixedWidth /> {duration}
        </div>
      }
      {power &&
        <div>
          <FontAwesomeIcon icon={faBolt} fixedWidth /> {power}W
        </div>
        }
      {powerStart && powerEnd &&
        <div>
          <FontAwesomeIcon icon={faBolt} fixedWidth /> {powerStart}W - {powerEnd}W
        </div>
      }
      {weight && power &&
        <div>         
          <FontAwesomeIcon icon={faBalanceScale} fixedWidth /> {(power/weight).toFixed(1)}W/Kg
        </div>
      }
    </div>
  )
}

export default Label