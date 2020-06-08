import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt, faClock, faCommentDots } from '@fortawesome/free-solid-svg-icons'

const Label = ({ duration, power, powerStart, powerEnd }) => {

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
    </div>
  )
}

export default Label