import React, { useState } from 'react'
import Draggable from 'react-draggable'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import './InstructionEditor.css'
import helpers from '../helpers'
import { durationMultiplier } from '../Bar/multipliers'
import { Instruction } from '../../types/Instruction'

interface InstructionEditorProps {
  instruction: Instruction;
  width: number;
  onChange: (instruction: Instruction) => void;
  onDelete: (id: string) => void;
  index: number;
}

const InstructionEditor = (props: InstructionEditorProps) => {
  const [text, setText] = useState(props.instruction.text)
  const [xPosition, setXPosition] = useState(props.instruction.time / durationMultiplier)

  const [showInput, setShowInput] = useState(false)

  function handleTouch(position: number) {
    props.onChange(
      {
        id: props.instruction.id,
        text: text,
        time: position * durationMultiplier,
      }
    )
  }

  function handleDragging(position: number) { 
    setShowInput(false)  
    setXPosition(position)
  }

  function handleInputChange(value: string) {
    setText(value)

    props.onChange(
      {
        id: props.instruction.id,
        text: value,
        time: xPosition * durationMultiplier,
      }
    )
  }

  function handleDelete() {
    if (text === "" || window.confirm('Are you sure you want to delete this comment?')) {
      props.onDelete(props.instruction.id)
    }
  }

  return (
    <Draggable
      axis='x'
      handle=".handle"
      defaultPosition={{ x: xPosition, y: (props.index % 5) * 20 }}
      bounds={{ left: 0, right: props.width}}
      scale={1}
      onStop={(e, data) => handleTouch(data.x)}
      onDrag={(e, data) => handleDragging(data.x)}      
    >
      <div style={{}}>
        <FontAwesomeIcon style={{display:'block',opacity:0.7}} icon={faComment} size="lg" fixedWidth className="handle" onMouseDown={() => setShowInput(!showInput)} />        
        {showInput &&
        <div className="edit">
          <FontAwesomeIcon icon={faTrashAlt} fixedWidth className="delete" style={{ color: 'gray' }} onClick={() => handleDelete()} />
          <span style={{fontSize:'13px'}} data-testid='time'>{helpers.formatDuration(xPosition * durationMultiplier)}</span>                  
          <textarea name="comment" value={text} style={{display:'block', padding:'5px', width:'250px',backgroundColor:'white'}} onChange={e => handleInputChange(e.target.value)} />        
        </div>
        }
        <div className="line"></div>
      </div>
    </Draggable>
  )
}

export default InstructionEditor;