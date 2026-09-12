import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import "./LeftRightToggle.css";

interface LeftRightToggleProps<TLeft,TRight> {
  label: string;
  leftValue: TLeft;
  rightValue: TRight;
  leftLabel?: string;
  rightLabel?: string;
  leftIcon?: IconProp;
  rightIcon?: IconProp;
  selected: TLeft | TRight;
  onChange: (selected: TLeft | TRight) => void;
}

const LeftRightToggle = <TLeft,TRight>({ label, leftValue, rightValue, leftIcon, rightIcon, leftLabel, rightLabel, selected, onChange }: LeftRightToggleProps<TLeft,TRight>) => (
  <div className="form-input">
    <label>{label}</label>
    <div className="left-right-toggle">
      <span
        className={`segment ${selected === leftValue ? "active" : ""}`}
        onClick={() => onChange(leftValue)}
      >
        {leftIcon && <FontAwesomeIcon icon={leftIcon} fixedWidth />}
        {leftLabel}
      </span>
      <span
        className={`segment ${selected === rightValue ? "active" : ""}`}
        onClick={() => onChange(rightValue)}
      >
        {rightIcon && <FontAwesomeIcon icon={rightIcon} fixedWidth />}
        {rightLabel}
      </span>
    </div>
  </div>
);

export default LeftRightToggle;
