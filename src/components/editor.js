import React, { useState, useCallback } from 'react'
import './Editor.css'
import Bar from './Bar'

const Editor = () => {

  function addBar(zone){
    setBars([...bars,{
      id: bars.length+1,      
      time: 300,
      power: zone
    }
    ])
  }

  const [bars, setBars] = useState([
    {
      id: 1,
      time: 300,
      power: 200
    },
    {
      id: 2,
      time: 300,
      power: 200
    }
  ])

  const renderBar = (bar, index) => {
    return (
      <Bar
        key={bar.id}        
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
      <button className="btn" onClick={() => addBar(50)} style={{backgroundColor: '#807F80'}}>+</button>
      <button className="btn" onClick={() => addBar(150)} style={{backgroundColor: '#0E90D4'}}>+</button>
    </div> 
  );
}

export default Editor