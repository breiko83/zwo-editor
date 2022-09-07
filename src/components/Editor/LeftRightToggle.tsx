import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import Switch from "react-switch";
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

const COLOR = "#00C46A";

const LeftRightToggle = <TLeft,TRight>({ label, leftValue, rightValue, leftIcon, rightIcon, leftLabel, rightLabel, selected, onChange }: LeftRightToggleProps<TLeft,TRight>) => (
  <div className="form-input">
    <label>{label}</label>
    <div className="left-right-toggle">
      {leftIcon && (<FontAwesomeIcon
        className={`icon ${selected === leftValue ? "active" : ""}`}
        icon={leftIcon}
        size="lg"
        fixedWidth
      />)}
      {leftLabel && (
        <div
          className={`icon ${selected === leftValue ? "active" : ""}`}
        >{leftLabel}</div>
      )}
      <Switch
        onChange={() => onChange(selected === leftValue ? rightValue : leftValue)}
        checked={selected === rightValue}
        checkedIcon={false}
        uncheckedIcon={false}
        onColor={COLOR}
        offColor={COLOR}
      />
      {rightIcon && (<FontAwesomeIcon
        className={`icon ${selected === rightValue ? "active" : ""}`}
        icon={rightIcon}
        size="lg"
        fixedWidth
      />)}
      {rightLabel && (
        <div
        className={`icon ${selected === rightValue ? "active" : ""}`}
        >{rightLabel}</div>
      )}
    </div>
  </div>
);

export default LeftRightToggle;
