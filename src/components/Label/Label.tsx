import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt, faClock, faRuler } from '@fortawesome/free-solid-svg-icons'
import './Label.css'
import { FreeInterval, RampInterval, SteadyInterval } from '../../types/Interval'
import { WorkoutMode } from '../../modes/WorkoutMode'
import BikeMode from '../../modes/BikeMode'
import RunMode from '../../modes/RunMode'
import { formatDuration, intervalDuration } from '../../utils/duration'

interface LabelProps {
  interval: SteadyInterval | RampInterval | FreeInterval;
  mode: WorkoutMode;
  onCadenceChange: (cadence: number) => void;
}

const Label = ({ mode, ...props }: LabelProps) => {
  return (
    <div className='label'>
      <div>
        <FontAwesomeIcon icon={faClock} fixedWidth /> {formatDuration(intervalDuration(props.interval, mode))}
      </div>
      {mode instanceof BikeMode ? <BikeData mode={mode} {...props} /> : <RunData mode={mode} {...props} />}
    </div>
  );
};

function BikeData({ interval, mode, onCadenceChange }: LabelProps & { mode: BikeMode }) {
  return (
    <>
      {interval.type === "steady" &&
        <>
          <div>
            <FontAwesomeIcon icon={faBolt} fixedWidth /> {mode.power(interval.intensity)}W
          </div>
          <div>
            {mode.wkg(interval.intensity)}W/Kg &middot; {mode.percentage(interval.intensity)}% FTP
          </div>
        </>
      }
      {interval.type === "ramp" &&
        <>
          <div>
            <FontAwesomeIcon icon={faBolt} fixedWidth /> {mode.power(interval.startIntensity)}W - {mode.power(interval.endIntensity)}W
          </div>
          <div>
            {mode.percentage(interval.startIntensity)}% FTP - {mode.percentage(interval.endIntensity)}% FTP
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

function RunData({ interval, mode }: LabelProps & { mode: RunMode }) {
  return (
    <>
      <div>
        <FontAwesomeIcon icon={faRuler} fixedWidth /> {mode.intervalDistance(interval).meters} m
      </div>
      {interval.type === "steady" &&
        <div>
          {mode.percentage(interval.intensity)}% {mode.shortPaceName(interval.pace)} pace
        </div>
      }
      {interval.type === "ramp" &&
        <div>
          {mode.percentage(interval.startIntensity)}% to {mode.percentage(interval.endIntensity)}% {mode.shortPaceName(interval.pace)} pace
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

export default Label