import React from "react";

// Displays workut name, description & author

interface NumberFieldProps {
  name: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}

const NumberField: React.FC<NumberFieldProps> = ({ name, label, value, onChange}) => {
  return (
    <div className="form-input">
      <label htmlFor={name}>{label}</label>
      <input
        className="textInput"
        type="number"
        name={name}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
      />
    </div>
  );
};

export default NumberField;
