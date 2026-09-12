import React, { useState } from "react";
import styles from "./EditComment.module.css";
import { Instruction } from "../../types/workout";

const EditComment = (props: {
  instruction: Instruction;
  onChange: Function;
  onDelete: Function;
  dismiss: Function;
}) => {
  const [text, setText] = useState(props.instruction.text);

  function save() {
    props.onChange(props.instruction.id, {
      id: props.instruction.id,
      text: text,
      length: props.instruction.length,
      time: props.instruction.time,
    });
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.title}>Edit text event</span>
          <span className={styles.close} onClick={() => props.dismiss()}>
            ×
          </span>
        </div>

        <div className={styles.body}>
          <label className={styles.field}>
            <span className={styles.label}>Message</span>
            <textarea
              name="comment"
              value={text}
              placeholder="Enter message"
              className={styles.textArea}
              onChange={(e) => setText(e.target.value)}
              autoFocus
            />
          </label>
        </div>

        <div className={styles.footer}>
          <span
            className={styles.delete}
            onClick={() => props.onDelete(props.instruction.id)}
          >
            Delete
          </span>
          <div className={styles.actions}>
            <button
              className={styles.btnSecondary}
              type="button"
              onClick={() => props.dismiss()}
            >
              Cancel
            </button>
            <button
              className={styles.btnPrimary}
              type="button"
              onClick={() => save()}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditComment;
