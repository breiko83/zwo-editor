import React from 'react';
import { SportType, DurationType, PaceUnitType } from './Editor';
import { faBiking, faRunning, faClock, faRuler } from '@fortawesome/free-solid-svg-icons';
import LeftRightToggle from './LeftRightToggle';
import { RunningTimes } from './RunningTimesEditor';
import RunningTimesEditor from './RunningTimesEditor';

interface WorkoutSettingsProps {
  sportType: SportType;
  setSportType: (sportType: SportType) => void;
  durationType: DurationType;
  setDurationType: (durationType: DurationType) => void;
  paceUnitType: PaceUnitType;
  setPaceUnitType: (paceUnitType: PaceUnitType) => void;
  ftp: number;
  setFtp: (ftp: number) => void;
  weight: number;
  setWeight: (weight: number) => void;
  runningTimes: RunningTimes;
  setRunningTimes: (times: RunningTimes) => void;
}

const WorkoutSettings: React.FC<WorkoutSettingsProps> = ({
  sportType,
  setSportType,
  durationType,
  setDurationType,
  paceUnitType,
  setPaceUnitType,
  ftp,
  setFtp,
  weight,
  setWeight,
  runningTimes,
  setRunningTimes,
}) => {
  return (
    <>
      <LeftRightToggle
        label="Sport"
        leftValue="bike"
        rightValue="run"
        leftIcon={faBiking}
        rightIcon={faRunning}
        selected={sportType}
        onChange={(value) => setSportType(value as SportType)}
      />

      {sportType === 'run' && (
        <>
          <LeftRightToggle
            label="Duration Type"
            leftValue="time"
            rightValue="distance"
            leftIcon={faClock}
            rightIcon={faRuler}
            selected={durationType}
            onChange={(value) => setDurationType(value as DurationType)}
          />

          <LeftRightToggle
            label="Pace"
            leftValue="metric"
            rightValue="imperial"
            leftLabel="min/km"
            rightLabel="min/mi"
            selected={paceUnitType}
            onChange={(value) => setPaceUnitType(value as PaceUnitType)}
          />

          <RunningTimesEditor
            times={runningTimes}
            onChange={setRunningTimes}
          />
        </>
      )}

      {sportType === 'bike' && (
        <>
          <div className="form-input">
            <label htmlFor="ftp">FTP (W)</label>
            <input
              className="textInput"
              type="number"
              name="ftp"
              title="FTP"
              value={ftp}
              onChange={(e) => setFtp(parseInt(e.target.value))}
            />
          </div>

          <div className="form-input">
            <label htmlFor="weight">Body Weight (Kg)</label>
            <input
              className="textInput"
              type="number"
              name="weight"
              title="Weight"
              value={weight}
              onChange={(e) => setWeight(parseInt(e.target.value))}
            />
          </div>
        </>
      )}
    </>
  );
};

export default WorkoutSettings;
