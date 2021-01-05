import React from "react";
import { Interval } from "../../types/Interval";
import { formatDuration, workoutDuration } from "../../utils/duration";

// Displays summary statistics: workout length and TSS

interface StatsProps {
  intervals: Interval[];
  ftp: number;
}

const Stats: React.FC<StatsProps> = ({ intervals, ftp }) => {
  return (
    <>
      <div className="form-input">
        <label>Workout Time</label>
        <input className="textInput" value={formatDuration(workoutDuration(intervals))} disabled />
      </div>
      <div className="form-input">
        <label>TSS</label>
        <input className="textInput" value={getStressScore(intervals, ftp)} disabled />
      </div>
    </>
  );
};

function getStressScore(intervals: Interval[], ftp: number): string {
  // TSS = [(sec x NP x IF)/(FTP x 3600)] x 100
  let tss = 0

  intervals.map((interval) => {
    if (interval.type === 'steady' && interval.intensity) {
      const np = interval.intensity * ftp
      const iff = interval.intensity

      tss += (interval.duration * np * iff)
    }
    if (interval.type === 'ramp' && interval.startIntensity && interval.endIntensity) {
      const np = (interval.startIntensity + interval.endIntensity) / 2 * ftp
      const iff = (interval.startIntensity + interval.endIntensity) / 2

      tss += (interval.duration * np * iff)
    }
    if (interval.type === 'repetition' && interval.onIntensity && interval.offIntensity && interval.repeat && interval.onDuration && interval.offDuration) {
      const npOn = (interval.onIntensity * ftp)
      const iffOn = interval.onIntensity

      tss += (interval.onDuration * interval.repeat * npOn * iffOn)

      const npOff = (interval.offIntensity * ftp)
      const iffOff = interval.offIntensity

      tss += (interval.offDuration * interval.repeat * npOff * iffOff)
    }
    return false;
  })
  return ((tss / (ftp * 3600)) * 100).toFixed(0);
}

export default Stats;
