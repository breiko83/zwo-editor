import React from "react";
import './Checkbox.css'

const Checkbox = (props: { label: string, isSelected: boolean, onCheckboxChange: Function }) => (
  <div className="form-check">
    <label>
      <input
        type="checkbox"
        name={props.label}
        checked={props.isSelected}
        onChange={(e) => props.onCheckboxChange()}
        className="form-check-input"
      />
      {props.label}
    </label>
  </div>
);

export default Checkbox;