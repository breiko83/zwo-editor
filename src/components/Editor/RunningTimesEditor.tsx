import React, { useCallback } from 'react';
import './RunningTimesEditor.css';
import TimePicker from 'rc-time-picker';
import 'rc-time-picker/assets/index.css'
import helpers from '../helpers';
import moment from 'moment'

export interface RunningTimes {
  oneMile: string;
  fiveKm: string;
  tenKm: string;
  halfMarathon: string;
  marathon: string;
}

interface RunningTimesEditorProps {
  times: RunningTimes;
  onChange: (times: RunningTimes) => void;
}

export default function RunningTimesEditor({ times, onChange }: RunningTimesEditorProps) {
  const estimateRunningTimes = useCallback(() => {
    const distances = [1.60934, 5, 10, 21.0975, 42.195, 1.60934]
    const estimatedTimes = helpers.calculateEstimatedTimes(distances, [times.oneMile, times.fiveKm, times.tenKm, times.halfMarathon, times.marathon, '00:11:20'])
  
    onChange({
      oneMile: times.oneMile || estimatedTimes[0],
      fiveKm: times.fiveKm || estimatedTimes[1],
      tenKm: times.tenKm || estimatedTimes[2],
      halfMarathon: times.halfMarathon || estimatedTimes[3],
      marathon: times.marathon || estimatedTimes[4],
    })
  }, [times, onChange])

  return (
    <div className="run-workout">
      <RunTimeInput time={times.oneMile} onChange={(oneMile) => onChange({ ...times, oneMile })}>
        1 Mile Time
      </RunTimeInput>
      <RunTimeInput time={times.fiveKm} onChange={(fiveKm) => onChange({ ...times, fiveKm })}>
        5 km Time
      </RunTimeInput>
      <RunTimeInput time={times.tenKm} onChange={(tenKm) => onChange({ ...times, tenKm })}>
        10 km Time
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

const RunTimeInput: React.FC<{time: string, onChange: (time: string) => void}> = ({time, onChange, children}) => (
  <div className="form-input">
    <label><abbr title="hh:mm:ss">{children}</abbr></label>
    <TimePicker
      value={time === '' ? undefined : moment(time, "HH:mm:ss")}
      placeholder="00:00:00"
      defaultOpenValue={moment("00:00:00")}
      className="timePicker"
      onChange={(value) => onChange(value ? value.format("HH:mm:ss") : '')}
    />
  </div>
);
