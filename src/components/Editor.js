import React, { useState, useCallback } from 'react'
import './Editor.css'
import { Colors, Zones } from './Constants'
import Bar from './Bar'
import { v4 as uuidv4 } from 'uuid'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faArrowRight, faArrowLeft, faFile, faSave } from '@fortawesome/free-solid-svg-icons'

const Editor = () => {

  const [bars, setBars] = useState(JSON.parse(localStorage.getItem('currentWorkout')) || [])
  const [showActions,setShowActions] = useState(false)
  const [actionId,setActionId] = useState()
  const [ftp, setFtp] = useState(parseInt(localStorage.getItem('ftp')))

  React.useEffect(() => {
    localStorage.setItem('currentWorkout', JSON.stringify(bars));
    localStorage.setItem('ftp',ftp)

  }, [bars,ftp]);

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
        ftp={ftp}
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
          {bars.map((bar) => renderBar(bar,ftp))}
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
          <div style={{height:250*Zones.Z6.max}}>Z6</div>
          <div style={{height:250*Zones.Z5.max}}>Z5</div>
          <div style={{height:250*Zones.Z4.max}}>Z4</div>
          <div style={{height:250*Zones.Z3.max}}>Z3</div>
          <div style={{height:250*Zones.Z2.max}}>Z2</div>
          <div style={{height:250*Zones.Z1.max}}>Z1</div>
        </div>
      </div>
      <div className='cta'>
        <button className="btn" onClick={() => addBar(Zones.Z1.min)} style={{ backgroundColor: Colors.GRAY }}>Z1</button>
        <button className="btn" onClick={() => addBar(Zones.Z2.min)} style={{ backgroundColor: Colors.BLUE }}>Z2</button>
        <button className="btn" onClick={() => addBar(Zones.Z3.min)} style={{ backgroundColor: Colors.GREEN }}>Z3</button>
        <button className="btn" onClick={() => addBar(Zones.Z4.min)} style={{ backgroundColor: Colors.YELLOW }}>Z4</button>
        <button className="btn" onClick={() => addBar(Zones.Z5.min)} style={{ backgroundColor: Colors.ORANGE }}>Z5</button>
        <button className="btn" onClick={() => addBar(Zones.Z6.min)} style={{ backgroundColor: Colors.RED }}>Z6</button>
        <input className="textInput" type="number" name="ftp" value={ftp} onChange={(e) => setFtp(e.target.value)} />
        <button className="btn" onClick={() => {if (window.confirm('Are you sure you want to create a new workout?')) setBars([])}}><FontAwesomeIcon icon={faFile} size="lg" fixedWidth /> New</button>
        <button className="btn"><FontAwesomeIcon icon={faSave} size="lg" fixedWidth /> Save</button>
      </div>
    </div>

  )
}

export default Editor