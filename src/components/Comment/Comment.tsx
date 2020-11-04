import React, { useState } from 'react'
import Draggable from 'react-draggable'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import './Comment.css'
import helpers from '../helpers'

interface Instruction {
  id: string,
  text: string,
  time: number,
  length: number
}

const Comment = (props: { instruction: Instruction, durationType: string, onChange: Function, onDelete: Function }) => {

  const timeMultiplier = 3
  const lengthMultiplier = 10

  const [text, setText] = useState(props.instruction.text)
  const [time, setTime] = useState(props.instruction.time / timeMultiplier)

  // FOR RUN WORKOUTS
  const [length, setLength] = useState(props.instruction.length / lengthMultiplier)

  const [showInput, setShowInput] = useState(false)

  function handleTouch(position: number) {
    props.onChange(
      props.instruction.id,
      {
        id: props.instruction.id,
        text: text,
        time: position * timeMultiplier,
        length: position * lengthMultiplier
      })
  }

  function handleDragging(position: number) { 
    setShowInput(true)  
    setTime(position)
    setLength(position)
  }

  function handleInputChange(value: string) {

    setText(value)

    props.onChange(
      props.instruction.id,
      {
        id: props.instruction.id,
        text: value,
        time: time * timeMultiplier,
        length: length * lengthMultiplier
      })
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
      defaultPosition={{ x: time, y: 0 }}
      bounds={{ left: 0, right: 1000 }}
      scale={1}
      onStop={(e, data) => handleTouch(data.x)}
      onDrag={(e, data) => handleDragging(data.x)}
    >
      <div className='commentBlock'>
        <FontAwesomeIcon style={{display:'block',opacity:0.7}} icon={faComment} size="lg" fixedWidth className="handle" onMouseDown={() => setShowInput(!showInput)} />        
        {showInput &&
        <div className="edit">
          <FontAwesomeIcon icon={faTrashAlt} fixedWidth className="delete" style={{ color: 'gray' }} onClick={() => handleDelete()} />
          {props.durationType === 'time' ?
            <span style={{fontSize:'13px'}} data-testid='time'>{helpers.formatDuration(time * timeMultiplier)}</span>                  
          :
            <span style={{fontSize:'13px'}} data-testid='time'>{length * lengthMultiplier} m</span>                  
          }
          
          <textarea name="comment" value={text} style={{display:'block', padding:'5px', width:'250px',backgroundColor:'white'}} onChange={e => handleInputChange(e.target.value)} />        
        </div>
        }
        <div className="line"></div>
      </div>
    </Draggable>

  )
}

export default Comment