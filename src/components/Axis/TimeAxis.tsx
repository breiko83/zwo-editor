import React from "react";
import "./XAxis.css";

const hoursBy10Minutes = (hours: number): string[] => 
  ([...new Array(hours)]).flatMap((v, h) => ["00", "10", "20", "30", "40", "50"].map(m => `${h}:${m}`));

const TimeAxis = ({ width }: { width: number }) => (
  <div className='x-axis x-axis-time' style={{ width }}>
    {hoursBy10Minutes(6).map(time => (<span key={time}>{time}</span>))}
  </div>
);

export default TimeAxis;
