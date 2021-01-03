import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt, faClock } from '@fortawesome/free-solid-svg-icons'
import './Label.css'
import { PaceType } from '../../types/PaceType'
import helpers from '../helpers'

interface LabelProps {
  sportType: string;
  duration: number;
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
  return (
    <div className='label'>
      <div>
        <FontAwesomeIcon icon={faClock} fixedWidth /> {helpers.formatDuration(props.duration)}
      </div>
      {props.sportType === "bike" ? <BikeData {...props} /> : <RunData {...props} />}
    </div>
  );
};

function BikeData(props: LabelProps) {
  return (
    <>
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
    </>
  );
}

function RunData(props: LabelProps) {
  const paces = ["1M", "5K", "10K", "HM", "M"];

  return (
    <>
      {props.power && props.ftp && props.pace !== undefined &&
        <div>
          {(props.power / props.ftp * 100).toFixed(1).replace(/[.]0$/, "")}% {paces[props.pace || 0]} pace
        </div>
      }
      {props.powerStart && props.powerEnd && props.ftp && props.pace !== undefined &&
        <div>
          {(props.powerStart / props.ftp * 100).toFixed(0)}% to {(props.powerEnd / props.ftp * 100).toFixed(0)}% {paces[props.pace || 0]} pace
        </div>
      }
    </>
  );
}

export default Label