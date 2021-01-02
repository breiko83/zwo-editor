import React from "react";
import helpers from "../helpers";
import { Interval } from "../../types/Interval";

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
        <input className="textInput" value={helpers.formatDuration(helpers.getWorkoutDuration(intervals))} disabled />
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
    if (interval.type === 'steady' && interval.power) {
      const np = interval.power * ftp
      const iff = interval.power

      tss += (interval.duration * np * iff)
    }
    if (interval.type === 'ramp' && interval.startPower && interval.endPower) {
      const np = (interval.startPower + interval.endPower) / 2 * ftp
      const iff = (interval.startPower + interval.endPower) / 2

      tss += (interval.duration * np * iff)
    }
    if (interval.type === 'repetition' && interval.onPower && interval.offPower && interval.repeat && interval.onDuration && interval.offDuration) {
      const npOn = (interval.onPower * ftp)
      const iffOn = interval.onPower

      tss += (interval.onDuration * interval.repeat * npOn * iffOn)

      const npOff = (interval.offPower * ftp)
      const iffOff = interval.offPower

      tss += (interval.offDuration * interval.repeat * npOff * iffOff)
    }
    return false;
  })
  return ((tss / (ftp * 3600)) * 100).toFixed(0);
}

export default Stats;
