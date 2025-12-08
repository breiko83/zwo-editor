import React from 'react';
import helpers from '../helpers';
import { BarType, SportType, DurationType, PaceUnitType } from '../../types/workout';
import LeftRightToggle from './LeftRightToggle';
import { faClock, faRuler, faBiking, faRunning } from '@fortawesome/free-solid-svg-icons';
import './Editor.css';

interface WorkoutMetadataProps {
  name: string;
  description: string;
  author: string;
  bars: BarType[];
  sportType: SportType;
  durationType: DurationType;
  paceUnitType: PaceUnitType;
  ftp: number;
  setDurationType: (durationType: DurationType) => void;
  setPaceUnitType: (paceUnitType: PaceUnitType) => void;
  setSportType: (sportType: SportType) => void;
}

const WorkoutMetadata: React.FC<WorkoutMetadataProps> = ({
  name,
  description,
  author,
  bars,
  sportType,
  durationType,
  paceUnitType,
  ftp,
  setDurationType,
  setPaceUnitType,
  setSportType,
}) => {
  return (
    <div className="info">
      <div className="title">
        <h1>{name}</h1>
        <div className="description">{description}</div>
        <p>{author ? `by ${author}` : ''}</p>
      </div>
      <div className="workout">
        <div className="form-input">
          <label>Workout Time</label>
          <input
            className="textInput"
            title="Workout Time"
            value={helpers.formatDuration(
              helpers.getWorkoutLength(bars, durationType)
            )}
            disabled
          />
        </div>
        
        {sportType === 'run' && (
          <div className="form-input">
            <label>Workout Distance</label>
            <input
              className="textInput"
              value={helpers.getWorkoutDistance(bars)}
              disabled
            />
          </div>
        )}
        
        {sportType === 'bike' && (
          <div className="form-input">
            <label title="Training Load">Training Load</label>
            <input
              className="textInput"
              value={helpers.getStressScore(bars, ftp)}
              disabled
            />
          </div>
        )}
        
        {sportType === 'run' && (
          <div className="form-input">
            <label>Avg. Workout Pace</label>
            <input
              className="textInput"
              value={helpers.getWorkoutPace(bars, durationType, paceUnitType)}
              disabled
            />
          </div>
        )}
        
        {sportType === 'run' && (
          <LeftRightToggle<'time', 'distance'>
            label="Duration Type"
            leftValue="time"
            rightValue="distance"
            leftIcon={faClock}
            rightIcon={faRuler}
            selected={durationType}
            onChange={setDurationType}
          />
        )}
        
        {sportType === 'run' && (
          <LeftRightToggle<'metric', 'imperial'>
            label="Pace Unit"
            leftValue="metric"
            rightValue="imperial"
            leftLabel="min/km"
            rightLabel="min/mi"
            selected={paceUnitType}
            onChange={setPaceUnitType}
          />
        )}
        
        <LeftRightToggle<'bike', 'run'>
          label="Sport Type"
          leftValue="bike"
          rightValue="run"
          leftIcon={faBiking}
          rightIcon={faRunning}
          selected={sportType}
          onChange={setSportType}
        />
      </div>
    </div>
  );
};

export default WorkoutMetadata;
