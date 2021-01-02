import React from "react";
import { PaceType } from "../../types/PaceType";

interface PaceSelectorProps {
  value?: PaceType;
  onChange: (value: PaceType) => void;
}

const PaceSelector = ({ value, onChange }: PaceSelectorProps) => (
  <select name="pace" value={value} onChange={(e) => onChange(parseInt(e.target.value))} className="selectInput">
    <option value="0">1 Mile Pace</option>
    <option value="1">5K Pace</option>
    <option value="2">10K Pace</option>
    <option value="3">Half Marathon Pace</option>
    <option value="4">Marathon Pace</option>
  </select>
);

export default PaceSelector;
