import React, { useCallback } from 'react';
import './RunningTimesEditor.css';
import TimePicker from 'rc-time-picker';
import 'rc-time-picker/assets/index.css'
import moment from 'moment'
import { RunningTimes } from '../../types/RunningTimes';

interface RunningTimesEditorProps {
  times: RunningTimes;
  onChange: (times: RunningTimes) => void;
}

export default function RunningTimesEditor({ times, onChange }: RunningTimesEditorProps) {
  const estimateRunningTimes = useCallback(() => {
    console.log(`to estimate: ${[times.oneMile, times.fiveKm, times.tenKm, times.halfMarathon, times.marathon]}`);
    const estimatedTimes = calculateEstimatedTimes([times.oneMile, times.fiveKm, times.tenKm, times.halfMarathon, times.marathon])
    console.log(`estimated times: ${estimatedTimes}`);

    onChange({
      oneMile: estimatedTimes[0],
      fiveKm: estimatedTimes[1],
      tenKm: estimatedTimes[2],
      halfMarathon: estimatedTimes[3],
      marathon: estimatedTimes[4],
    })
  }, [times, onChange])

  return (
    <div className="run-workout">
      <RunTimeInput time={times.oneMile} onChange={(oneMile) => onChange({ ...times, oneMile })}>
        1 Mile Time
      </RunTimeInput>
      <RunTimeInput time={times.fiveKm} onChange={(fiveKm) => onChange({ ...times, fiveKm })}>
        5 Km Time
      </RunTimeInput>
      <RunTimeInput time={times.tenKm} onChange={(tenKm) => onChange({ ...times, tenKm })}>
        10 Mile Time
      </RunTimeInput>
      <RunTimeInput time={times.halfMarathon} onChange={(halfMarathon) => onChange({ ...times, halfMarathon })}>
        Half Marathon Time
      </RunTimeInput>
      <RunTimeInput time={times.marathon} onChange={(marathon) => onChange({ ...times, marathon })}>
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

export function calculateEstimatedTimes(timesOrig: number[]): number[] {
  const distances = [1.60934, 5, 10, 21.0975, 42.195, 1.60934];
  const times = [...timesOrig, moment.duration("00:11:20").asSeconds()];
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
