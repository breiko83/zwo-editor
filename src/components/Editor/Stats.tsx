import React from "react";
import BikeMode from "../../modes/BikeMode";
import RunMode from "../../modes/RunMode";
import { WorkoutMode } from "../../modes/WorkoutMode";
import { Interval } from "../../types/Interval";
import { workoutDistance } from "../../utils/distance";
import { formatDuration, workoutDuration } from "../../utils/duration";

// Displays summary statistics: workout length and TSS

interface StatsProps {
  intervals: Interval[];
  ftp: number;
  mode: WorkoutMode;
}

const Stats: React.FC<StatsProps> = ({ intervals, ftp, mode }) => {
  return (
    <>
      <div className="form-input">
        <label>Workout Time</label>
        <input className="textInput" value={formatDuration(workoutDuration(intervals, mode))} disabled />
      </div>
      {mode instanceof RunMode &&
        <div className="form-input">
          <label>Workout Distance</label>
          <input className="textInput" value={workoutDistance(intervals, mode).meters + " m"} disabled />
        </div>
      }
      {mode instanceof BikeMode &&
        <div className="form-input">
          <label>TSS</label>
          <input className="textInput" value={getStressScore(intervals, ftp, mode)} disabled />
        </div>
      }
    </>
  );
};

function getStressScore(intervals: Interval[], ftp: number, mode: WorkoutMode): string {
  // TSS = [(sec x NP x IF)/(FTP x 3600)] x 100
  let tss = 0

  intervals.map((interval) => {
    if (interval.type === 'steady' && interval.intensity) {
      const np = interval.intensity * ftp
      const iff = interval.intensity

      tss += (mode.duration(interval.length).seconds * np * iff)
    }
    if (interval.type === 'ramp' && interval.startIntensity && interval.endIntensity) {
      const np = (interval.startIntensity + interval.endIntensity) / 2 * ftp
      const iff = (interval.startIntensity + interval.endIntensity) / 2

      tss += (mode.duration(interval.length).seconds * np * iff)
    }
    if (interval.type === 'repetition' && interval.onIntensity && interval.offIntensity && interval.repeat && interval.onLength && interval.offLength) {
      const npOn = (interval.onIntensity * ftp)
      const iffOn = interval.onIntensity

      tss += (mode.duration(interval.onLength).seconds * interval.repeat * npOn * iffOn)

      const npOff = (interval.offIntensity * ftp)
      const iffOff = interval.offIntensity

      tss += (mode.duration(interval.offLength).seconds * interval.repeat * npOff * iffOff)
    }
    return false;
  })
  return ((tss / (ftp * 3600)) * 100).toFixed(0);
}

export default Stats;
