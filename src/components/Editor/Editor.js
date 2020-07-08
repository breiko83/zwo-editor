import React, { useState } from 'react'
import './Editor.css'
import { Colors, Zones } from '../Constants'
import Bar from '../Bar/Bar'
import Trapeze from '../Trapeze/Trapeze'
import FreeRide from '../FreeRide/FreeRide'
import Comment from '../Comment/Comment'
import Popup from '../Popup/Popup'
import { v4 as uuidv4 } from 'uuid'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faArrowRight, faArrowLeft, faFile, faSave, faUpload, faDownload, faComment, faBicycle, faCopy } from '@fortawesome/free-solid-svg-icons'
import { ReactComponent as WarmdownLogo } from '../../assets/warmdown.svg'
import { ReactComponent as WarmupLogo } from '../../assets/warmup.svg'
import Builder from 'xmlbuilder'
import Converter from 'xml-js'
import helpers from '../helpers'

const Editor = () => {

  const S3_URL = 'https://zwift-workout.s3-eu-west-1.amazonaws.com'

  const [id, setId] = useState(localStorage.getItem('id') || generateId())
  const [bars, setBars] = useState(JSON.parse(localStorage.getItem('currentWorkout')) || [])
  const [showActions, setShowActions] = useState(false)
  const [actionId, setActionId] = useState()
  const [ftp, setFtp] = useState(parseInt(localStorage.getItem('ftp')) || 200)
  const [weight, setWeight] = useState(parseInt(localStorage.getItem('weight')) || 75)
  const [instructions, setInstructions] = useState(JSON.parse(localStorage.getItem('instructions')) || [])

  const [name, setName] = useState(localStorage.getItem('name') || '')
  const [description, setDescription] = useState(localStorage.getItem('description') || '')
  const [author, setAuthor] = useState(localStorage.getItem('author') || '')

  const [popupIsVisile, setPopupVisibility] = useState(false)

  React.useEffect(() => {
    localStorage.setItem('currentWorkout', JSON.stringify(bars))
    localStorage.setItem('ftp', ftp)
    localStorage.setItem('id', id)
    localStorage.setItem('instructions', JSON.stringify(instructions))
    localStorage.setItem('weight', weight)

    localStorage.setItem('name', name)
    localStorage.setItem('description', description)
    localStorage.setItem('author', author)

    window.history.replaceState('', '', `/editor/${id}`)

  }, [instructions, bars, ftp, weight, id, name, author, description])

  function generateId() {
    return Math.random().toString(36).substr(2, 16)
  }

  function newWorkout() {
    console.log('New workout')

    setBars([])
    setInstructions([])
    setId(generateId())
  }

  function handleOnChange(id, values) {
    const index = bars.findIndex(bar => bar.id === id)

    const updatedArray = [...bars]
    updatedArray[index] = values
    setBars(updatedArray)
  }

  function handleOnClick(id) {

    if (id === actionId) {
      setShowActions(!showActions)
    } else {
      setActionId(id)
      setShowActions(true)
    }
  }

  function addBar(zone, duration = 300) {
    setBars(bars => [...bars, {
      time: duration,
      power: zone,
      type: 'bar',
      id: uuidv4()
    }
    ])
  }

  function addTrapeze(zone1, zone2, duration = 300) {
    setBars(bars => [...bars, {
      time: duration,
      startPower: zone1,
      endPower: zone2,
      type: 'trapeze',
      id: uuidv4()
    }
    ])
  }

  function addFreeRide(duration = 600) {
    setBars(bars => [...bars, {
      time: duration,
      type: 'freeRide',
      id: uuidv4()
    }
    ])
  }

  function addInstruction(text = '', time = 0) {
    setInstructions(instructions => [...instructions, {
      text: text,
      time: time,
      id: uuidv4()
    }])
  }

  function changeInstruction(id, values) {

    const index = instructions.findIndex(instructions => instructions.id === id)

    const updatedArray = [...instructions]
    updatedArray[index] = values
    setInstructions(updatedArray)

  }

  function deleteInstruction(id) {
    const updatedArray = [...instructions]
    setInstructions(updatedArray.filter(item => item.id !== id))
  }

  function removeBar(id) {
    const updatedArray = [...bars]
    setBars(updatedArray.filter(item => item.id !== id))
    setShowActions(false)
  }

  function duplicateBar(id) {
    const index = bars.findIndex(bar => bar.id === id)
    const element = [...bars][index]

    if (element.type === 'bar') addBar(element.power, element.time)
    if (element.type === 'freeRide') addFreeRide(element.time)
    if (element.type === 'trapeze') addTrapeze(element.startPower, element.endPower, element.time)
  }

  function moveLeft(id) {
    const index = bars.findIndex(bar => bar.id === id)
    // not first position of array
    if (index > 0) {
      const updatedArray = [...bars]
      const element = [...bars][index]
      updatedArray.splice(index, 1)
      updatedArray.splice(index - 1, 0, element)
      setBars(updatedArray)
      //setShowActions(false)
    }
  }

  function moveRight(id) {
    const index = bars.findIndex(bar => bar.id === id)
    // not first position of array
    if (index < bars.length - 1) {
      const updatedArray = [...bars]
      const element = [...bars][index]
      updatedArray.splice(index, 1)
      updatedArray.splice(index + 1, 0, element)
      setBars(updatedArray)
      //setShowActions(false)
    }
  }

  function saveWorkout() {

    setPopupVisibility(true)

    var totalTime = 0

    const xml = Builder.begin()
      .ele('workout_file')
      .ele('author', author).up()
      .ele('name', name).up()
      .ele('description', description).up()
      .ele('sportType', 'bike').up()
      .ele('tags', {}).up()
      .ele('workout')


    bars.map((bar, index) => {

      var segment
      var ramp

      if (bar.type === 'bar') {
        segment = Builder.create('SteadyState')
          .att('Duration', bar.time)
          .att('Power', bar.power)
          .att('pace', 0) // is this cadence?
      } else if (bar.type === 'trapeze') {

        // index 0 is warmup
        // last index is cooldown
        // everything else is ramp

        ramp = 'Ramp'
        if (index === 0) ramp = 'Warmup'
        if (index === bars.length - 1) ramp = 'Cooldown'

        if (bar.startPower < bar.endPower) {
          // warmup
          segment = Builder.create(ramp)
            .att('Duration', bar.time)
            .att('PowerLow', bar.startPower)
            .att('PowerHigh', bar.endPower)
            .att('pace', 0) // is this cadence?
        } else {
          // cooldown
          segment = Builder.create(ramp)
            .att('Duration', bar.time)
            .att('PowerLow', bar.startPower) // these 2 values are inverted
            .att('PowerHigh', bar.endPower) // looks like a bug on zwift editor
            .att('pace', 0) // is this cadence?
        }
      } else {
        // free ride
        segment = Builder.create('FreeRide')
          .att('Duration', bar.time)
          .att('Cadence', 85) // add control for this?
      }

      // add instructions if present
      instructions.filter((instruction) => (instruction.time > totalTime && instruction.time <= (totalTime + bar.time))).map((i) => {
        return segment.ele('textevent', { timeoffset: (i.time - totalTime), message: i.text })
      })

      xml.importDocument(segment)

      totalTime = totalTime + bar.time

      return false
    })

    const file = new Blob([xml.end({ pretty: true })], { type: 'application/xml' })

    // save this to cloud
    upload(file, false)

    return file
  }

  function downloadWorkout() {

    const tempFile = saveWorkout()

    var a = document.createElement("a")
    document.body.appendChild(a)
    a.style = "display: none"
    a.href = window.URL.createObjectURL(tempFile)
    a.download = `${id}.zwo`
    a.click()
    window.URL.revokeObjectURL(tempFile)
  }

  function handleUpload(e) {

    // ask user if they want to overwrite current workout first
    if (bars.length > 0) {
      if (!window.confirm('Are you sure you want to create a new workout?')) {
        return false
      }
    }

    newWorkout()

    const file = e.target.files[0]
    upload(file, true)

  }

  function upload(file, parse = false) {
    fetch('/.netlify/functions/upload', {
      method: 'POST',
      body: JSON.stringify(
        {
          fileType: 'zwo',
          fileName: `${id}.zwo`
        })
    })
      .then(res => res.json())
      .then(function (data) {
        const signedUrl = data.uploadURL

        // upload to S3
        fetch(signedUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'zwo'
          },
          body: file
        })
          .then(response => response.text())
          .then(data => {
            console.log('File uploaded')

            // can parse now

            if (parse) fetchAndParse(id)
          })
          .catch(error => {
            console.error(error)
          })
      })
  }

  function fetchAndParse(id) {

    // remove previous workout
    setBars([])
    setInstructions([])

    fetch(`${S3_URL}/${id}.zwo`)
      .then(response => response.text())
      .then(data => {
        console.log(data)

        //now parse file  
        const workout = Converter.xml2js(data)
        const workout_file = workout.elements[0]

        if (workout_file.name === 'workout_file') {
          // file is valid
          const authorIndex = workout_file.elements.findIndex(element => element.name === 'author')
          setAuthor(workout_file.elements[authorIndex].elements[0].text)

          const nameIndex = workout_file.elements.findIndex(element => element.name === 'name')
          setName(workout_file.elements[nameIndex].elements[0].text)

          const descriptionIndex = workout_file.elements.findIndex(element => element.name === 'description')
          setDescription(workout_file.elements[descriptionIndex].elements[0].text)

          const workoutIndex = workout_file.elements.findIndex(element => element.name === 'workout')

          var totalTime = 0

          workout_file.elements[workoutIndex].elements.map(w => {


            if (w.name === 'SteadyState')
              addBar(parseFloat(w.attributes.Power || w.attributes.PowerLow), parseFloat(w.attributes.Duration))

            if (w.name === 'Ramp' || w.name === 'Warmup' || w.name === 'Cooldown')
              addTrapeze(parseFloat(w.attributes.PowerLow), parseFloat(w.attributes.PowerHigh), parseFloat(w.attributes.Duration))

            if (w.name === 'FreeRide')
              addFreeRide(parseFloat(w.attributes.Duration))

            // check for instructions
            const textElements = w.elements
            if (textElements && textElements.length > 0) {

              textElements.map(t => {

                if (t.name === 'textevent')
                  addInstruction(t.attributes.message, totalTime + parseFloat(t.attributes.timeoffset))

                return false
              })

            }

            totalTime = totalTime + parseFloat(w.attributes.Duration)
            // map functions expect return value
            return false
          })
        }
      })
      .catch(error => {
        console.error(error)
      })
  }

  const renderBar = (bar) => {
    return (
      <Bar
        key={bar.id}
        id={bar.id}
        time={bar.time}
        power={bar.power}
        ftp={ftp}
        weight={weight}
        onChange={(id, value) => handleOnChange(id, value)}
        onClick={(id) => handleOnClick(id)}
      />
    )
  }

  const renderTrapeze = (bar) => {
    return (
      <Trapeze
        key={bar.id}
        id={bar.id}
        time={bar.time}
        startPower={bar.startPower}
        endPower={bar.endPower}
        ftp={ftp}
        onChange={(id, value) => handleOnChange(id, value)}
        onClick={(id) => handleOnClick(id)}
      />
    )
  }

  const renderFreeRide = (bar) => {
    return (
      <FreeRide
        key={bar.id}
        id={bar.id}
        time={bar.time}
        onChange={(id, value) => handleOnChange(id, value)}
        onClick={(id) => handleOnClick(id)}
      />
    )
  }

  const renderComment = (instruction) => {
    return (
      <Comment
        key={instruction.id}
        instruction={instruction}
        onChange={(id, values) => changeInstruction(id, values)}
        onDelete={(id) => deleteInstruction(id)}
      />
    )
  }

  return (
    <div>
      {popupIsVisile &&
        <Popup title="Save Workout">
          <div className="form-control">
            <label for="name">Workout Title</label>
            <input type="text" name="name" placeholder="Workout title" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-control">
            <label for="description">Workout description</label>
            <textarea name="description" placeholder="Workout description" onChange={(e) => setDescription(e.target.value)}>{description}</textarea>
          </div>
          <div className="form-control">
            <label for="author">Workout Author</label>
            <input type="text" name="author" placeholder="Workout Author" value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
          <div className="form-control">
            <button className="btn btn-primary" onClick={() => setPopupVisibility(false)}>Save</button>
            <button className="btn" onClick={() => setPopupVisibility(false)}>Dismiss</button>
          </div>
        </Popup>
      }
      <div className='editor' onClick={() => setShowActions(false)}>
        {showActions &&
          <div className='actions'>
            <button onClick={() => moveLeft(actionId)} title='Move Left'><FontAwesomeIcon icon={faArrowLeft} size="lg" fixedWidth /></button>
            <button onClick={() => moveRight(actionId)} title='Move Right'><FontAwesomeIcon icon={faArrowRight} size="lg" fixedWidth /></button>
            <button onClick={() => removeBar(actionId)} title='Delete'><FontAwesomeIcon icon={faTrash} size="lg" fixedWidth /></button>
            <button onClick={() => duplicateBar(actionId)} title='Duplicate'><FontAwesomeIcon icon={faCopy} size="lg" fixedWidth /></button>
          </div>
        }
        <div className='slider'>
          {instructions.map((instruction) => renderComment(instruction))}
        </div>

        <div className='canvas'>
          {bars.map((bar) => {
            if (bar.type === 'bar') {
              return (renderBar(bar))
            }
            else if (bar.type === 'trapeze') {
              return (renderTrapeze(bar))
            }
            else if (bar.type === 'freeRide') {
              return (renderFreeRide(bar))
            } else {
              return false
            }
          })}
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
          <div style={{ height: 250 * Zones.Z6.max }}>Z6</div>
          <div style={{ height: 250 * Zones.Z5.max }}>Z5</div>
          <div style={{ height: 250 * Zones.Z4.max }}>Z4</div>
          <div style={{ height: 250 * Zones.Z3.max }}>Z3</div>
          <div style={{ height: 250 * Zones.Z2.max }}>Z2</div>
          <div style={{ height: 250 * Zones.Z1.max }}>Z1</div>
        </div>
      </div>
      <div className='cta'>
        <button className="btn btn-square" onClick={() => addBar(Zones.Z1.min)} style={{ backgroundColor: Colors.GRAY }}>Z1</button>
        <button className="btn btn-square" onClick={() => addBar(Zones.Z2.min)} style={{ backgroundColor: Colors.BLUE }}>Z2</button>
        <button className="btn btn-square" onClick={() => addBar(Zones.Z3.min)} style={{ backgroundColor: Colors.GREEN }}>Z3</button>
        <button className="btn btn-square" onClick={() => addBar(Zones.Z4.min)} style={{ backgroundColor: Colors.YELLOW }}>Z4</button>
        <button className="btn btn-square" onClick={() => addBar(Zones.Z5.min)} style={{ backgroundColor: Colors.ORANGE }}>Z5</button>
        <button className="btn btn-square" onClick={() => addBar(Zones.Z6.min)} style={{ backgroundColor: Colors.RED }}>Z6</button>
        <button className="btn" onClick={() => addTrapeze(Zones.Z1.max / 2, Zones.Z4.min)} style={{ backgroundColor: Colors.WHITE }}><WarmupLogo className="btn-icon" /> Warm up</button>
        <button className="btn" onClick={() => addTrapeze(Zones.Z4.min, Zones.Z1.max / 2)} style={{ backgroundColor: Colors.WHITE }}><WarmdownLogo className="btn-icon" /> Cool down</button>
        <button className="btn" onClick={() => addFreeRide()} style={{ backgroundColor: Colors.WHITE }}><FontAwesomeIcon icon={faBicycle} size="lg" fixedWidth /> Free Ride</button>
        <button className="btn" onClick={() => addInstruction()} style={{ backgroundColor: Colors.WHITE }}><FontAwesomeIcon icon={faComment} size="lg" fixedWidth /> Text Event</button>

        <div className="form-input">
          <label htmlFor="ftp">FTP (W)</label>
          <input className="textInput" type="number" name="ftp" value={ftp} onChange={(e) => setFtp(e.target.value)} />
        </div>

        <div className="form-input">
          <label htmlFor="weight">Body Weight (Kg)</label>
          <input className="textInput" type="number" name="weight" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </div>


        <button className="btn" onClick={() => { if (window.confirm('Are you sure you want to create a new workout?')) newWorkout() }}><FontAwesomeIcon icon={faFile} size="lg" fixedWidth /> New</button>
        <button className="btn" onClick={() => saveWorkout()}><FontAwesomeIcon icon={faSave} size="lg" fixedWidth /> Save</button>
        <button className="btn" onClick={() => downloadWorkout()} ><FontAwesomeIcon icon={faDownload} size="lg" fixedWidth /> Download</button>
        <input
          accept=".xml,.zwo"
          id="contained-button-file"
          type="file"
          style={{ display: 'none' }}
          onChange={handleUpload}
        />
        <button className="btn" onClick={() => document.getElementById("contained-button-file").click()}><FontAwesomeIcon icon={faUpload} size="lg" fixedWidth /> Upload</button>
        <div className="form-input">
          <label>Workout Time</label>
          <input className="textInput" value={helpers.getWorkoutLength(bars)} disabled />
        </div>
        <div className="form-input">
          <label>TSS</label>
          <input className="textInput" value={helpers.getStressScore(bars, ftp)} disabled />
        </div>

      </div>
    </div>

  )
}

export default Editor