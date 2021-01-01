import React from "react";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface ActionButtonProps {
  title: string;
  icon: IconDefinition;
  onClick: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ title, icon, onClick }) => {
  return (
    <button onClick={onClick} title={title}><FontAwesomeIcon icon={icon} size="lg" fixedWidth /></button>
  );
};

export default ActionButton;
