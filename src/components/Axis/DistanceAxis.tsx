import React from "react";
import "./XAxis.css";

const DistanceAxis = ({ width }: { width: number }) => (
  <div className='x-axis x-axis-distance' style={{ width }}>
    {[...new Array(44)].map((e,i) => <span key={i}>{i}K</span>)}
  </div>
);

export default DistanceAxis;
