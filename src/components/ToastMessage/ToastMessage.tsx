import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import styles from "./ToastMessage.module.css";

interface Message {
  visible: boolean;
  class?: string;
  text?: string;
}

interface ToastMessageProps {
  message?: Message;
  onDismiss: () => void;
}

const ToastMessage: React.FC<ToastMessageProps> = ({ message, onDismiss }) => {
  if (!message?.visible) {
    return null;
  }

  return (
    <div className={`${styles.message} ${styles[message.class || ""]}`}>
      <div className={styles.text}>
        {message.text}
      </div>
      <button className={styles.close} onClick={onDismiss}>
        <FontAwesomeIcon icon={faTimesCircle} size="lg" fixedWidth />
      </button>
    </div>
  );
};

export default ToastMessage;
