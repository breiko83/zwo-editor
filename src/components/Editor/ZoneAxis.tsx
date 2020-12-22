import React from "react";
import { Zones } from "../Constants";
import "./ZoneAxis.css";

const ZoneAxis = () => (
  <div className='zone-axis'>
    <div style={{ height: 250 * Zones.Z6.max }}>Z6</div>
    <div style={{ height: 250 * Zones.Z5.max }}>Z5</div>
    <div style={{ height: 250 * Zones.Z4.max }}>Z4</div>
    <div style={{ height: 250 * Zones.Z3.max }}>Z3</div>
    <div style={{ height: 250 * Zones.Z2.max }}>Z2</div>
    <div style={{ height: 250 * Zones.Z1.max }}>Z1</div>
  </div>
);

export default ZoneAxis;
