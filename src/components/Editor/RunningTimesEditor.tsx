import React, { useCallback } from 'react';
import './RunningTimesEditor.css';
import TimePicker from 'rc-time-picker';
import 'rc-time-picker/assets/index.css'
import helpers from '../helpers';
import moment from 'moment'

interface RunningTimesEditorProps {
  oneMileTime: string;
  fiveKmTime: string;
  tenKmTime: string;
  halfMarathonTime: string;
  marathonTime: string;
  onOneMileTimeChange: (time: string) => void;
  onFiveKmTimeChange: (time: string) => void;
  onTenKmTimeChange: (time: string) => void;
  onHalfMarathonTimeChange: (time: string) => void;
  onMarathonTimeChange: (time: string) => void;
}

export default function RunningTimesEditor(props: RunningTimesEditorProps) {
  const estimateRunningTimes = useCallback(() => {
    const distances = [1.60934, 5, 10, 21.0975, 42.195, 1.60934]
    const times = [props.oneMileTime, props.fiveKmTime, props.tenKmTime, props.halfMarathonTime, props.marathonTime, '00:11:20']
  
    var estimatedTimes = helpers.calculateEstimatedTimes(distances, times)
  
    if (!props.oneMileTime) {
      props.onOneMileTimeChange(estimatedTimes[0])
    }
    if (!props.fiveKmTime) {
      props.onFiveKmTimeChange(estimatedTimes[1])
    }
    if (!props.tenKmTime) {
      props.onTenKmTimeChange(estimatedTimes[2])
    }
    if (!props.halfMarathonTime) {
      props.onHalfMarathonTimeChange(estimatedTimes[3])
    }
    if (!props.marathonTime) {
      props.onMarathonTimeChange(estimatedTimes[4])
    }
  }, [props])

  return (
    <div className="run-workout">
      <RunTimeInput time={props.oneMileTime} onChange={props.onOneMileTimeChange}>
        1 Mile Time
      </RunTimeInput>
      <RunTimeInput time={props.fiveKmTime} onChange={props.onFiveKmTimeChange}>
        5 Km Time
      </RunTimeInput>
      <RunTimeInput time={props.tenKmTime} onChange={props.onTenKmTimeChange}>
        10 Mile Time
      </RunTimeInput>
      <RunTimeInput time={props.halfMarathonTime} onChange={props.onHalfMarathonTimeChange}>
        Half Marathon Time
      </RunTimeInput>
      <RunTimeInput time={props.marathonTime} onChange={props.onMarathonTimeChange}>
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
