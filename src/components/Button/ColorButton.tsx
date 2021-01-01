import React from "react";

interface ColorButtonProps {
  color: string;
  label: string;
  onClick: () => void;
}

const ColorButton: React.FC<ColorButtonProps> = ({ color, label, onClick }) => {
  return (
    <button className="btn btn-square" onClick={onClick} style={{ backgroundColor: color }}>
      {label}
    </button>
  );
};

export default ColorButton;
