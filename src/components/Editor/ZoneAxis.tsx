import React from "react";
import { Zones } from "../Constants";
import "./ZoneAxis.css";

const ZoneAxis = () => (
  <div className='zone-axis'>
    {Object.entries(Zones).reverse().map(([name, zone]) =>
      (<div style={{ height: 250 * zone.max }}>{name}</div>))}
  </div>
);

export default ZoneAxis;
