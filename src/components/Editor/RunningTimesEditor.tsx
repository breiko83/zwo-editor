import React, { useCallback } from 'react';
import './RunningTimesEditor.css';
import TimePicker from 'rc-time-picker';
import 'rc-time-picker/assets/index.css'
import moment from 'moment'
import { RunningTimes } from '../../types/RunningTimes';
import { PaceType } from '../../types/PaceType';
import { runningDistances } from '../../types/runningDistances';

interface RunningTimesEditorProps {
  times: RunningTimes;
  onChange: (times: RunningTimes) => void;
}

export default function RunningTimesEditor({ times, onChange }: RunningTimesEditorProps) {
  const estimateRunningTimes = useCallback(() => {
    onChange(calculateEstimatedTimes(times))
  }, [times, onChange])

  const handleInputChange = (pace: PaceType, t: number) => {
    const timesCopy = [...times];
    timesCopy[pace] = t;
    onChange(timesCopy);
  };

  return (
    <div className="run-workout">
      <RunTimeInput time={times[PaceType.oneMile]} onChange={t => handleInputChange(PaceType.oneMile,  t)}>
        1 Mile Time
      </RunTimeInput>
      <RunTimeInput time={times[PaceType.fiveKm]} onChange={t => handleInputChange(PaceType.fiveKm,  t)}>
        5 Km Time
      </RunTimeInput>
      <RunTimeInput time={times[PaceType.tenKm]} onChange={t => handleInputChange(PaceType.tenKm,  t)}>
        10 Mile Time
      </RunTimeInput>
      <RunTimeInput time={times[PaceType.halfMarathon]} onChange={t => handleInputChange(PaceType.halfMarathon,  t)}>
        Half Marathon Time
      </RunTimeInput>
      <RunTimeInput time={times[PaceType.marathon]} onChange={t => handleInputChange(PaceType.marathon,  t)}>
        Marathon Time
      </RunTimeInput>
      <div className="form-input">
        <button onClick={estimateRunningTimes} className="btn">Estimate missing times</button>
      </div>
    </div>
  );
}

const RunTimeInput: React.FC<{time: number, onChange: (time: number) => void}> = ({time, onChange, children}) => (
  <div className="form-input">
    <label><abbr title="hh:mm:ss">{children}</abbr></label>
    <TimePicker
      value={time === 0 ? undefined : moment.utc(time * 1000)}
      placeholder="00:00:00"
      defaultOpenValue={moment("00:00:00")}
      className="timePicker"
      onChange={(value) => onChange(value ? moment.duration(value.format('HH:mm:ss')).asSeconds() : 0)}
    />
  </div>
);

const defaultDistance = 1609.34; // one mile in meters
const defaultTime = 11 * 60 + 20; // 00:11:20

export function calculateEstimatedTimes(timesOrig: number[]): number[] {
  const distances = [...runningDistances, defaultDistance];
  const times = [...timesOrig, defaultTime];
  const estimatedTimes: number[] = [];

  timesOrig.forEach((value, i) => {
    if (!value) {
      for (let index = 0; index < times.length; index++) {
        // found a time
        if (times[index]) {
          // Predictions calculated using Riegel's formula: T2 = T1 x (D2/D1) x 1.06
          // T1 = T2 / (1.06 * (D2/D1))
          estimatedTimes[i] = times[index] * (distances[i] / distances[index]) * 1.06
          break;
        }
      }
    } else {
      estimatedTimes[i] = value;
    }
  });

  return estimatedTimes;
}
