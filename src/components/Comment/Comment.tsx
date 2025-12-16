import React, { useState, useRef } from "react";
import Draggable from "react-draggable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment,faCommentDots } from "@fortawesome/free-solid-svg-icons";
import "./Comment.css";
import helpers from "../helpers";
import { Instruction } from "../../types/workout";

const Comment = (props: {
  instruction: Instruction;
  durationType: string;
  width: number;
  onChange: Function;
  onClick: Function;  
  index: number;
}) => {
  const timeMultiplier = 3;
  const lengthMultiplier = 10;
  const nodeRef = useRef(null);

  const [time, setTime] = useState(props.instruction.time / timeMultiplier);
  const [isDragging, setIsDragging] = useState(false);

  // FOR RUN WORKOUTS
  const [length, setLength] = useState(
    props.instruction.length / lengthMultiplier
  );

  function handleTouch(position: number) {

    setIsDragging(false);

    if(isDragging){
      props.onChange(props.instruction.id, {
        id: props.instruction.id,      
        time: position * timeMultiplier,
        length: position * lengthMultiplier,
        text: props.instruction.text,      
      });
    }else{
      props.onClick(props.instruction.id)
    }    
  }

  function handleDragging(position: number) {    
    setIsDragging(true);
    setTime(position);
    setLength(position);
  }

  return (
    <Draggable
      nodeRef={nodeRef}
      axis="x"
      handle=".handle"
      defaultPosition={{ x: props.durationType === "time" ? time : length, y: (props.index % 5) * 20 }}
      bounds={{ left: 0, right: props.width }}
      scale={1}
      onStop={(e, data) => handleTouch(data.x)}
      onDrag={(e, data) => handleDragging(data.x)}      
    >
      <div ref={nodeRef}>
        <FontAwesomeIcon
          style={{ display: "block", opacity: 0.7 }}
          icon={props.instruction.text !== "" ? faCommentDots : faComment}
          size="lg"
          fixedWidth
          className="handle"
        />
        {isDragging && (
          <div className="edit">
            {props.durationType === "time" ? (
              <span style={{ fontSize: "13px" }} data-testid="time">
                {helpers.formatDuration(time * timeMultiplier)}
              </span>
            ) : (
              <span style={{ fontSize: "13px" }} data-testid="time">
                {length * lengthMultiplier} m
              </span>
            )}
          </div>
        )}
        <div className="line"></div>
      </div>
    </Draggable>
  );
};

export default Comment;