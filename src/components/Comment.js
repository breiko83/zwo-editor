import React, { useState } from 'react'
import Draggable from 'react-draggable'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import './Comment.css'
import moment from 'moment'
import 'moment-duration-format'

const Comment = ({ instruction, onChange, onDelete }) => {

  const [text, setText] = useState(instruction.text)
  const [time, setTime] = useState(instruction.time)

  function handleTouch({ e, data }) {
    onChange(
      instruction.id,
      {
        id: instruction.id,
        text: text,
        time: data.x
      })
  }

  function handleInputChange(e) {

    setText(e.target.value)

    onChange(
      instruction.id,
      {
        id: instruction.id,
        text: e.target.value,
        time: time
      })
  }


  return (
    <Draggable
      axis='x'
      handle=".handle"
      defaultPosition={{ x: time, y: 0 }}
      position={null}
      bounds={{ left: 0, right: 1000 }}
      scale={1}
      onStop={(e, data) => handleTouch({ e, data })}      
      onDrag={(e, data) => setTime(data.x)}
    >
      <div className='comment-block'>
        <FontAwesomeIcon icon={faComment} size="lg" fixedWidth className="handle" />
        <span>{moment.duration(time * 5, "seconds").format("mm:ss", { trim: false })}</span>
        <input name="comment" type="text" value={text} onChange={e => handleInputChange(e)} />    
        <FontAwesomeIcon icon={faTrashAlt} fixedWidth className="delete" style={{color:'gray'}} onClick={() => { if (window.confirm('Are you sure you want to delete this comment?')) onDelete(instruction.id) }} />
        <div className="line"></div>
      </div>
    </Draggable>

  )
}


export default Comment