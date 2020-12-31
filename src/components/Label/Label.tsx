import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt, faClock, faRuler } from '@fortawesome/free-solid-svg-icons'
import './Label.css'
import { PaceType } from '../Editor/PaceSelector'
import helpers from '../helpers'

interface LabelProps {
  sportType: string;
  time: number;
  distance?: number;
  power?: number;
  powerStart?: number;
  powerEnd?: number;
  weight?: number;
  ftp?: number;
  pace?: PaceType;
  cadence: number;
  onCadenceChange: (cadence: number) => void;
}

const Label = (props: LabelProps) => {
  const paces = ["1M", "5K", "10K", "HM", "M"]  

  return (
    <div className='label'>
      <div>
        <FontAwesomeIcon icon={faClock} fixedWidth /> {helpers.formatDuration(props.time)}
      </div>
      {props.power && props.sportType === "bike" &&
        <div>
          <FontAwesomeIcon icon={faBolt} fixedWidth /> {props.power}W
        </div>
      }
      {props.powerStart && props.powerEnd && props.sportType === "bike" &&
        <div>
          <FontAwesomeIcon icon={faBolt} fixedWidth /> {props.powerStart}W - {props.powerEnd}W
        </div>
      }
      {props.weight && props.power && props.ftp && props.sportType === "bike" &&
        <div>
          {(props.power / props.weight).toFixed(1)}W/Kg &middot; {(props.power / props.ftp * 100).toFixed(0)}% FTP
        </div>
      }
      {props.powerStart && props.powerEnd && props.ftp && props.sportType === "bike" &&
        <div>
          {(props.powerStart / props.ftp * 100).toFixed(0)}% FTP - {(props.powerEnd / props.ftp * 100).toFixed(0)}% FTP
        </div>
      }
      {props.sportType === "run" && props.distance &&
        <div>
          <FontAwesomeIcon icon={faRuler} fixedWidth /> {props.distance.toFixed(0)} m
        </div>
      }
      {props.power && props.ftp && props.pace !== undefined && props.sportType === "run" &&
        <div>
          {(props.power / props.ftp * 100).toFixed(1).replace(/[.]0$/, "")}% {paces[props.pace || 0]} pace
        </div>
      }
      {props.powerStart && props.powerEnd && props.ftp && props.pace !== undefined && props.sportType === "run" &&
        <div>
          {(props.powerStart / props.ftp * 100).toFixed(0)}% to {(props.powerEnd / props.ftp * 100).toFixed(0)}% {paces[props.pace || 0]} pace
        </div>
      }      
      <div className="cadence-row">
        <label className="cadenceLabel">Cadence</label>
        <input
          type="number"
          min="40"
          max="150"
          step="5"
          name="cadence"
          value={props.cadence || ''}
          onChange={(e) => {props.onCadenceChange(parseInt(e.target.value))}}
          onClick={(e)=> {e.stopPropagation()}}
          className="textField cadence"
        />
      </div>
    </div>
  )
}

export default Label