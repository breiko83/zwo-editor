import React from "react";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export interface NotificationMessage {
  text: string;
  visible?: boolean;
  className: string;
}

export interface NotificationProps extends NotificationMessage {
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ text, visible, className, onClose}) => {
  if (!visible) {
    return null;
  }
  return (
    <div className={`message ${className}`}>
      {text}
      <button className="close" onClick={onClose}>
        <FontAwesomeIcon icon={faTimesCircle} size="lg" fixedWidth />
      </button>
    </div>
  );
};

export default Notification;
