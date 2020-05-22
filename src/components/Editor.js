import React, { useState, useCallback } from 'react'
import './Editor.css'
import { Colors } from './Constants'
import Bar from './Bar'
import { v4 as uuidv4 } from 'uuid'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons'

const Editor = () => {

  console.log('render');
  

  const [bars, setBars] = useState(JSON.parse(localStorage.getItem('currentWorkout')) || [])
  const [showActions,setShowActions] = useState(false)
  const [actionId,setActionId] = useState()

  React.useEffect(() => {
    localStorage.setItem('currentWorkout', JSON.stringify(bars));
    console.log('saved');

  }, [bars]);

  function handleOnChange(id, values) {
    const index = bars.findIndex(bar => bar.id === id)

    const updatedArray = [...bars]
    updatedArray[index] = values
    setBars(updatedArray)
  }

  function handleOnClick(id) {  

    if(id === actionId) {
      setShowActions(!showActions)
    }else{
      setActionId(id)
      setShowActions(true)
    }
  }

  function addBar(zone) {
    setBars([...bars, {
      time: 60,
      power: zone,
      id: uuidv4()
    }
    ])
  }

  function removeBar(id) {    
    const updatedArray = [...bars]
    setBars(updatedArray.filter(item => item.id !== id))
    setShowActions(false)
  }

  function moveLeft(id) {
    const index = bars.findIndex(bar => bar.id === id)
    // not first position of array
    if(index > 0) {
      const updatedArray = [...bars]
      const element = [...bars][index]
      updatedArray.splice(index, 1)
      updatedArray.splice(index-1, 0, element)
      setBars(updatedArray)  
      setShowActions(false)
    }
  }

  function moveRight(id) {
    const index = bars.findIndex(bar => bar.id === id)
    // not first position of array
    if(index < bars.length-1) {
      const updatedArray = [...bars]
      const element = [...bars][index]
      updatedArray.splice(index, 1)
      updatedArray.splice(index+1, 0, element)
      setBars(updatedArray) 
      setShowActions(false)          
    }
  }

  const renderBar = (bar) => {
    return (
      <Bar
        key={bar.id}
        id={bar.id}
        time={bar.time}
        power={bar.power}
        onChange={handleOnChange}
        onClick={handleOnClick}        
      />
    )
  }

  return (
    <div>
      <div className='editor'>
        {showActions &&
          <div className='actions'>
            <button onClick={() => moveLeft(actionId)} title='Move Left'><FontAwesomeIcon icon={faArrowLeft} size="lg" fixedWidth /></button>
            <button onClick={() => moveRight(actionId)} title='Move Right'><FontAwesomeIcon icon={faArrowRight} size="lg" fixedWidth /></button>
            <button onClick={() => removeBar(actionId)} title='Delete'><FontAwesomeIcon icon={faTrash} size="lg" fixedWidth /></button>
          </div>
        }
        <div className='canvas'>
          {bars.map((bar) => renderBar(bar))}
        </div>
        <div className='timeline'>
          <span>0:00</span>
          <span>0:15</span>
          <span>0:30</span>
          <span>0:45</span>
          <span>1:00</span>
          <span>1:15</span>
          <span>1:30</span>
          <span>1:45</span>
          <span>2:00</span>
        </div>
        <div className='zones'>
          <div>Z6</div>
          <div>Z5</div>
          <div>Z4</div>
          <div>Z3</div>
          <div>Z2</div>
          <div>Z1</div>
        </div>
      </div>
      <div className='cta'>
        <button className="btn" onClick={() => addBar(50)} style={{ backgroundColor: Colors.GRAY }}>Z1</button>
        <button className="btn" onClick={() => addBar(150)} style={{ backgroundColor: Colors.BLUE }}>Z2</button>
        <button className="btn" onClick={() => addBar(250)} style={{ backgroundColor: Colors.GREEN }}>Z3</button>
        <button className="btn" onClick={() => addBar(350)} style={{ backgroundColor: Colors.YELLOW }}>Z4</button>
        <button className="btn" onClick={() => addBar(450)} style={{ backgroundColor: Colors.ORANGE }}>Z5</button>
        <button className="btn" onClick={() => addBar(550)} style={{ backgroundColor: Colors.RED }}>Z6</button>
      </div>
    </div>

  )
}

export default Editor