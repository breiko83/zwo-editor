import React from "react";

import { SportType, DurationType } from "./Editor";

interface WorkoutTextEditorProps {
  sportType: SportType;
  durationType: DurationType;
  onChange: (value: string) => void;
}

const WorkoutTextEditor = ({
  sportType,
  durationType,
  onChange,
}: WorkoutTextEditorProps) => (
  <div className="text-editor">
    <textarea
      onChange={(e) => onChange(e.target.value)}
      rows={10}
      spellCheck={false}
      className="text-editor-textarea"
      placeholder={`Add one block per line here:\n${sportType === 'bike' ? 'steady 3.0wkg 30s' : 'steady 1200m 5K pace'}`}
    ></textarea>
    <div className="text-editor-instructions">
      <h2>Instructions</h2>
      <p>
        Every row correspond to a workout block. Scroll down to see some
        examples.
      </p>
      <h3>Blocks</h3>
      <p>
        <span>steady</span> <span>warmup</span> <span>cooldown</span>{" "}
        <span>ramp</span> <span>intervals</span>{" "}
        {sportType === "bike" ? <span>freeride</span> : <span>freerun</span>}{" "}
        <span>message</span>
      </p>
      {sportType === "run" && durationType === "distance" ? (
        <>
          <h3>Distance</h3>
          <p>
            <span>200m</span> or <span>0.2km</span>
          </p>
        </>
      ) : (
        <>
          <h3>Time</h3>
          <p>
            <span>30s</span> or <span>0:30m</span>
          </p>
        </>
      )}

      {sportType === "bike" ? (
        <>
          <h3>Power</h3>
          <p>
            <span>250w</span> or <span>3.0wkg</span> or <span>75%</span> (FTP)
          </p>
          <h3>Cadence</h3>
          <p>
            <span>120rpm</span>
          </p>
        </>
      ) : (
        <>
          <h3>Pace</h3>
          <p>
            <span>1M pace</span> <span>5K pace</span> <span>10K pace</span>{" "}
            <span>HM pace</span> <span>M pace</span>
          </p>
        </>
      )}
      {}
      <h2>Examples</h2>
      <h3>Steady block</h3>
      <p>
        <code>steady 3.0wkg 30s</code>
        <code>steady 120w 10m 85rpm</code>
      </p>
      <h3>Warmup / Cooldown / Ramp block</h3>
      <p>
        <code>warmup 2.0wkg-3.5wkg 10m</code>
        <code>cooldown 180w-100w 5m 110rpm</code>
      </p>
      <h3>Intervals</h3>
      <p>
        <code>interval 10x 30s-30s 4.0wkg-1.0wkg 110rpm-85rpm</code>
        <code>interval 3x 1:00m-5:00m 300w-180w</code>
      </p>
      <h3>Free Ride</h3>
      <p>
        <code>freeride 10m 85rpm</code>
      </p>
      <h3>Text Event</h3>
      <p>
        <code>message "Get ready to your first set!" 30s</code>
        <code>message "Last one!" 20:00m</code>
      </p>
    </div>
  </div>
);

export default WorkoutTextEditor;
