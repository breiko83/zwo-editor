import React from 'react';
import helpers from '../helpers';
import { BarType, SportType, DurationType, PaceUnitType } from '../../types/workout';
import LeftRightToggle from './LeftRightToggle';
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
      <div className="stats">
        <div className="title">
          <h1>{name}</h1>
          <div className="description">{description}</div>
          <p>{author ? `by ${author}` : ''}</p>
        </div>

        <div className="stat">
          <label>Workout time</label>
          <span className="stat-value">
            {helpers.formatDuration(helpers.getWorkoutLength(bars))}
          </span>
        </div>

        {sportType === 'run' && (
          <>
            <div className="stat-divider" />
            <div className="stat">
              <label>Distance</label>
              <span className="stat-value">
                {helpers.getWorkoutDistance(bars)}{' '}
                <span className="stat-unit">km</span>
              </span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <label>Avg. pace</label>
              <span className="stat-value">
                {helpers.getWorkoutPace(bars, paceUnitType)}{' '}
                <span className="stat-unit">
                  {paceUnitType === 'metric' ? '/km' : '/mi'}
                </span>
              </span>
            </div>
          </>
        )}

        {sportType === 'bike' && (
          <>
            <div className="stat-divider" />
            <div className="stat">
              <label title="Training Load">Training load</label>
              <span className="stat-value">{helpers.getStressScore(bars, ftp)}</span>
            </div>
          </>
        )}
      </div>

      <div className="workout">
        {sportType === 'run' && (
          <LeftRightToggle<'time', 'distance'>
            label="Duration"
            leftValue="time"
            rightValue="distance"
            leftLabel="Time"
            rightLabel="Distance"
            selected={durationType}
            onChange={setDurationType}
          />
        )}

        {sportType === 'run' && (
          <LeftRightToggle<'metric', 'imperial'>
            label="Pace unit"
            leftValue="metric"
            rightValue="imperial"
            leftLabel="min/km"
            rightLabel="min/mi"
            selected={paceUnitType}
            onChange={setPaceUnitType}
          />
        )}

        <LeftRightToggle<'bike', 'run'>
          label="Sport"
          leftValue="bike"
          rightValue="run"
          leftLabel="Bike"
          rightLabel="Run"
          selected={sportType}
          onChange={setSportType}
        />
      </div>
    </div>
  );
};

export default WorkoutMetadata;
