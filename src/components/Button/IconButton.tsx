import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";

interface IconButtonProps {
  icon: IconDefinition;
  label: string;
  onClick: () => void;
}

const IconButton: React.FC<IconButtonProps> = ({ icon, label, onClick }) => {
  return (
    <button className="btn" onClick={onClick}>
      <FontAwesomeIcon icon={icon} size="lg" fixedWidth /> {label}
    </button>
  );
};

export default IconButton;
