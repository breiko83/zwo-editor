import React, { useState } from 'react'
import Draggable from 'react-draggable'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment } from '@fortawesome/free-solid-svg-icons'

const Comment = ({ instruction, onChange }) => {

  const [text, setText] = useState(instruction.text)
  const [time, setTime] = useState(instruction.time)

  function handleTouch({ e, data }) {

    setTime(data.x)

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
      defaultPosition={{ x: time, y: 0 }}
      position={null}
      bounds={{ left: 0, right: 1000 }}
      scale={1}
      onStop={(e, data) => handleTouch({ e, data })}
    >
      <div>
        <FontAwesomeIcon icon={faComment} size="lg" fixedWidth />
        <input name="comment" type="text" value={text} onChange={e => handleInputChange(e)} />
      </div>
    </Draggable>
  )
}


export default Comment