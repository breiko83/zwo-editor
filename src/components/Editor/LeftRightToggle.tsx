import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import Switch from "react-switch";

interface LeftRightToggleProps {
  label: string;
  leftValue: string;
  rightValue: string;
  leftIcon: IconProp;
  rightIcon: IconProp;
  selected: string;
  onChange: (selected: string) => void;
}

const COLOR = "#00C46A";

const LeftRightToggle = ({ label, leftValue, rightValue, leftIcon, rightIcon, selected, onChange }: LeftRightToggleProps) => (
  <div className="form-input">
    <label>{label}</label>
    <div className="switch">
      <FontAwesomeIcon
        className={`icon bike ${selected === leftValue ? "active" : ""}`}
        icon={leftIcon}
        size="lg"
        fixedWidth
      />
      <Switch
        onChange={() => onChange(selected === leftValue ? rightValue : leftValue)}
        checked={selected === rightValue}
        checkedIcon={false}
        uncheckedIcon={false}
        onColor={COLOR}
        offColor={COLOR}
      />
      <FontAwesomeIcon
        className={`icon run ${selected === rightValue ? "active" : ""}`}
        icon={rightIcon}
        size="lg"
        fixedWidth
      />
    </div>
  </div>
);

export default LeftRightToggle;
