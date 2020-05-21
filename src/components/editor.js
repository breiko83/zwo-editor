import React, { useState, useCallback } from 'react'
import './Editor.css'
import { Colors } from './Constants'
import Bar from './Bar'

const Editor = () => {

  function addBar(zone){
    setBars([...bars,{
      id: bars.length+1,      
      time: 200,
      power: zone
    }
    ])
  }

  const [bars, setBars] = useState([])

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
      <button className="btn" onClick={() => addBar(50)} style={{backgroundColor: Colors.GRAY}}>+</button>
      <button className="btn" onClick={() => addBar(150)} style={{backgroundColor: Colors.BLUE}}>+</button>
      <button className="btn" onClick={() => addBar(250)} style={{backgroundColor: Colors.GREEN}}>+</button>
      <button className="btn" onClick={() => addBar(350)} style={{backgroundColor: Colors.YELLOW}}>+</button>
      <button className="btn" onClick={() => addBar(450)} style={{backgroundColor: Colors.ORANGE}}>+</button>
      <button className="btn" onClick={() => addBar(550)} style={{backgroundColor: Colors.RED}}>+</button>
    </div> 
  );
}

export default Editor