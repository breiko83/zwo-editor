import React from "react";
import "./SpeedAxis.css";

const SpeedAxis = () => (
  <div className="speed-axis">
    {[...Array(30)].map((x, i) => (
      <div key={i} className="speed-block" style={{ height: 31, bottom:31*i }}>
        <div className="speed-label">{i} Km/h</div>
      </div>
    ))}
  </div>
);

export default SpeedAxis;
