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
        <input className="textInput" value={helpers.getStressScore(intervals, ftp)} disabled />
      </div>
    </>
  );
};

export default Stats;
