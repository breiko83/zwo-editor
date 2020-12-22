import React from "react";

const DistanceAxis = ({ width }: { width: number }) => (
  <div className='timeline run' style={{ width }}>            
    {[...Array(44)].map((e,i) => <span key={i}>{i}K</span>)}            
  </div>
);

export default DistanceAxis;
