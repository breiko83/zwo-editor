import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt, faClock } from '@fortawesome/free-solid-svg-icons'
import './Label.css'
import { PaceType } from '../../types/PaceType'
import helpers from '../helpers'
import { FreeInterval, RampInterval, SteadyInterval } from '../../types/Interval'

interface LabelProps {
  sportType: string;
  interval: SteadyInterval | RampInterval | FreeInterval;
  weight: number;
  ftp: number;
  onCadenceChange: (cadence: number) => void;
}

const Label = (props: LabelProps) => {
  return (
    <div className='label'>
      <div>
        <FontAwesomeIcon icon={faClock} fixedWidth /> {helpers.formatDuration(props.interval.duration)}
      </div>
      {props.sportType === "bike" ? <BikeData {...props} /> : <RunData {...props} />}
    </div>
  );
};

function BikeData({ interval, ftp, weight, onCadenceChange }: LabelProps) {
  return (
    <>
      {interval.type === "steady" &&
        <>
          <div>
            <FontAwesomeIcon icon={faBolt} fixedWidth /> {intensityToPower(interval.power, ftp)}W
          </div>
          <div>
            {intensityToWkg(interval.power, ftp, weight)}W/Kg &middot; {intensityToPercentage(interval.power)}% FTP
          </div>
        </>
      }
      {interval.type === "ramp" &&
        <>
          <div>
            <FontAwesomeIcon icon={faBolt} fixedWidth /> {intensityToPower(interval.startPower, ftp)}W - {intensityToPower(interval.endPower, ftp)}W
          </div>
          <div>
            {intensityToPercentage(interval.startPower)}% FTP - {intensityToPercentage(interval.endPower)}% FTP
          </div>
        </>
      }
      <div className="cadence-row">
        <label className="cadenceLabel">Cadence</label>
        <CadenceInput cadence={interval.cadence} onCadenceChange={onCadenceChange} />
      </div>
    </>
  );
}

function RunData({ interval }: LabelProps) {
  return (
    <>
      {interval.type === "steady" &&
        <div>
          {intensityToPercentage(interval.power)}% {paceToShortName(interval.pace)} pace
        </div>
      }
      {interval.type === "ramp" &&
        <div>
          {intensityToPercentage(interval.startPower)}% to {intensityToPercentage(interval.endPower)}% {paceToShortName(interval.pace)} pace
        </div>
      }
    </>
  );
}

function CadenceInput({cadence, onCadenceChange}: {cadence: number, onCadenceChange: (v: number) => void}) {
  return (
    <input
      type="number"
      min="40"
      max="150"
      step="5"
      name="cadence"
      value={cadence || ''}
      onChange={(e) => {onCadenceChange(parseInt(e.target.value))}}
      onClick={(e)=> {e.stopPropagation()}}
      className="textField cadence"
    />
  );
}

function intensityToPower(intensity: number, ftp: number): number {
  return Math.round(intensity * ftp);
}

function intensityToPercentage(intensity: number): number {
  return Math.round(intensity * 100);
}

function intensityToWkg(intensity: number, ftp: number, weight: number): number {
  return Math.round(intensityToPower(intensity, ftp) / weight * 10) / 10;
}

function paceToShortName(pace: PaceType) {
  const paces = ["1M", "5K", "10K", "HM", "M"];
  return paces[pace];
}

export default Label