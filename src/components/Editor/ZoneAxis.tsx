import React from "react";
import { Colors, Zones } from "../Constants";
import "./ZoneAxis.css";

const ZONE_COLORS: Record<string, string> = {
  Z1: Colors.GRAY,
  Z2: Colors.BLUE,
  Z3: Colors.GREEN,
  Z4: Colors.YELLOW,
  Z5: Colors.ORANGE,
  Z6: Colors.RED,
};

const ZoneAxis = () => (
  <div className='zone-axis'>
    {Object.entries(Zones).reverse().map(([name, zone]) => (
      <div key={name} style={{ height: 250 * zone.max }}>
        {name}
        <span className="zone-axis-dot" style={{ backgroundColor: ZONE_COLORS[name] }} />
      </div>
    ))}
  </div>
);

export default ZoneAxis;
