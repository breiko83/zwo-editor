import React from 'react';
import { SportType } from '../../types/workout';
import { RunningTimes } from './RunningTimesEditor';
import RunningTimesEditor from './RunningTimesEditor';

interface WorkoutSettingsProps {
  sportType: SportType;
  ftp: number;
  setFtp: (ftp: number) => void;
  weight: number;
  setWeight: (weight: number) => void;
  runningTimes: RunningTimes;
  setRunningTimes: (times: RunningTimes) => void;
}

const WorkoutSettings: React.FC<WorkoutSettingsProps> = ({
  sportType,
  ftp,
  setFtp,
  weight,
  setWeight,
  runningTimes,
  setRunningTimes,
}) => {
  return (
    <>
      {sportType === 'run' && (
        <RunningTimesEditor
          times={runningTimes}
          onChange={setRunningTimes}
        />
      )}

      {sportType === 'bike' && (
        <div className="run-workout">
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
        </div>
      )}
    </>
  );
};

export default WorkoutSettings;
