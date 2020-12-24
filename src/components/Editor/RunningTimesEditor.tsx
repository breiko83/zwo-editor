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
      <div className="form-input">
        <label><abbr title="hh:mm:ss">1 Mile Time</abbr></label>       
        <TimePicker value={props.oneMileTime === '' ? undefined : moment(props.oneMileTime, "HH:mm:ss")} placeholder="00:00:00" defaultOpenValue={moment("00:00:00")} className="timePicker" onChange={(value) => value ? props.onOneMileTimeChange(value.format("HH:mm:ss")) : props.onOneMileTimeChange('')} />
      </div>
      <div className="form-input">
        <label><abbr title="hh:mm:ss">5 Km Time</abbr></label>
        <TimePicker value={props.fiveKmTime === '' ? undefined : moment(props.fiveKmTime, "HH:mm:ss")} placeholder="00:00:00" defaultOpenValue={moment("00:00:00")} className="timePicker" onChange={(value) => value ? props.onFiveKmTimeChange(value.format("HH:mm:ss")) : props.onFiveKmTimeChange('')} />            
      </div>
      <div className="form-input">
        <label><abbr title="hh:mm:ss">10 Km Time</abbr></label>
        <TimePicker value={props.tenKmTime === '' ? undefined : moment(props.tenKmTime, "HH:mm:ss")} placeholder="00:00:00" defaultOpenValue={moment("00:00:00")} className="timePicker" onChange={(value) => value ? props.onTenKmTimeChange(value.format("HH:mm:ss")) : props.onTenKmTimeChange('')} />            
      </div>
      <div className="form-input">
        <label><abbr title="hh:mm:ss">Half Marathon Time</abbr></label>            
        <TimePicker value={props.halfMarathonTime === '' ? undefined : moment(props.halfMarathonTime, "HH:mm:ss")} placeholder="00:00:00" defaultOpenValue={moment("00:00:00")} className="timePicker" onChange={(value) => value ? props.onHalfMarathonTimeChange(value.format("HH:mm:ss")) : props.onHalfMarathonTimeChange('')} />                        
      </div>
      <div className="form-input">
        <label><abbr title="hh:mm:ss">Marathon Time</abbr></label>            
        <TimePicker value={props.marathonTime === '' ? undefined : moment(props.marathonTime, "HH:mm:ss")} placeholder="00:00:00" defaultOpenValue={moment("00:00:00")} className="timePicker" onChange={(value) => value ? props.onMarathonTimeChange(value.format("HH:mm:ss")) : props.onMarathonTimeChange('')} />                        
      </div>
      <div className="form-input">
        <button onClick={estimateRunningTimes} className="btn">Estimate missing times</button>
      </div>
    </div>
  );
}
