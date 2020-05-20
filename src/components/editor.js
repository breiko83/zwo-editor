import React, { useState, useCallback } from 'react'
import './editor.css'
import Bar from './bar'

const Editor = () => {

  function addBar(){
    setBars([...bars,{
      id: bars.length+1,
      text: 'New',
      time: 300
    }
    ])
  }

  const [bars, setBars] = useState([
    {
      id: 1,
      text: 'Write a cool JS library',
      time: 300,
      power: 200
    },
    {
      id: 2,
      text: 'Make it generic enough',
      time: 300,
      power: 200
    }
  ])

  const renderBar = (bar, index) => {
    return (
      <Bar
        key={bar.id}
        text={bar.text}
        time={bar.time}
        power={bar.power}
      />
    )
  }

  return (   
    <div>
      <div className="editor">
        {bars.map((bar, i) => renderBar(bar, i))}
      </div>
      <button onClick={addBar}>+</button>
    </div> 
  );
}

export default Editor