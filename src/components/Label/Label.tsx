import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt, faClock } from '@fortawesome/free-solid-svg-icons'
import './Label.css'

const Label = (props: { duration: string, power?: number, powerStart?: number, powerEnd?: number, weight?: number, ftp?: number }) => {

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
      {props.weight && props.power && props.ftp &&
        <div>
          {(props.power / props.weight).toFixed(1)}W/Kg &middot; {(props.power / props.ftp * 100).toFixed(0)}% FTP
        </div>
      }
      {props.powerStart && props.powerEnd && props.ftp &&
        <div>
          {(props.powerStart / props.ftp * 100).toFixed(0)}% FTP - {(props.powerEnd / props.ftp * 100).toFixed(0)}% FTP
        </div>
      }
    </div>
  )
}

export default Label