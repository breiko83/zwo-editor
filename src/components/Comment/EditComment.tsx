import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import styles from "./EditComment.module.css";

interface Instruction {
  id: string;
  text: string;
  time: number;
  length: number;
}

const EditComment = (props: {
  instruction: Instruction;
  onChange: Function;
  onDelete: Function;
  dismiss: Function;
}) => {
  const [text, setText] = useState(props.instruction.text);
  const [showInput, setShowInput] = useState(false);

  function save() {
    props.onChange(props.instruction.id, {
      id: props.instruction.id,
      text: text,
      lenth: props.instruction.length,
      time: props.instruction.time,
    });
  }
  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <textarea
          name="comment"
          value={text}
          placeholder="Enter message"
          className={styles.textArea}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => setShowInput(!showInput)}
        />
        <div className={styles.cta}>
          <button
            className={styles.btnPrimary}
            type="button"
            onClick={() => save()}
          >
            Save
          </button>
          <button
            className={styles.btnSecondary}            
            type="button"
            onClick={() => props.dismiss()}
          >
            Dismiss
          </button>
          <button            
            className={styles.btnIcon}
            type="button"
            onClick={() => props.onDelete(props.instruction.id)}
          >
            <FontAwesomeIcon
              icon={faTrashAlt}
              className="delete"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditComment;
