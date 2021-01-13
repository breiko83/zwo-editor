import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt, faClock, faRuler } from '@fortawesome/free-solid-svg-icons'
import './Label.css'
import { FreeInterval, RampInterval, SteadyInterval } from '../../types/Interval'
import { WorkoutMode } from '../../modes/WorkoutMode'
import BikeMode from '../../modes/BikeMode'
import RunMode from '../../modes/RunMode'
import * as format from '../../utils/format'

interface LabelProps {
  interval: SteadyInterval | RampInterval | FreeInterval;
  mode: WorkoutMode;
  onCadenceChange: (cadence: number) => void;
}

const Label = ({ mode, ...props }: LabelProps) => {
  return (
    <div className='label'>
      <div>
        <FontAwesomeIcon icon={faClock} fixedWidth /> {format.duration(mode.intervalDuration(props.interval))}
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
            <FontAwesomeIcon icon={faBolt} fixedWidth /> {format.power(mode.power(interval.intensity))}
          </div>
          <div>
            {format.wkg(mode.wkg(interval.intensity))} &middot; {format.percentage(interval.intensity)} FTP
          </div>
        </>
      }
      {interval.type === "ramp" &&
        <>
          <div>
            <FontAwesomeIcon icon={faBolt} fixedWidth /> {format.power(mode.power(interval.startIntensity))} - {format.power(mode.power(interval.endIntensity))}
          </div>
          <div>
            {format.percentage(interval.startIntensity)} - {format.percentage(interval.endIntensity)} FTP
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
        <FontAwesomeIcon icon={faRuler} fixedWidth /> {format.distance(mode.intervalDistance(interval))}
      </div>
      {interval.type === "steady" &&
        <div>
          {format.percentage(interval.intensity)} {format.shortPaceName(interval.pace)}
        </div>
      }
      {interval.type === "ramp" &&
        <div>
          {format.percentage(interval.startIntensity)} to {format.percentage(interval.endIntensity)} {format.shortPaceName(interval.pace)}
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