import React, { useState } from 'react'
import './Editor.css'
import { Colors, Zones } from '../Constants'
import Bar from '../Bar/Bar'
import Trapeze from '../Trapeze/Trapeze'
import FreeRide from '../FreeRide/FreeRide'
import Comment from '../Comment/Comment'
import Popup from '../Popup/Popup'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faArrowRight, faArrowLeft, faFile, faSave, faUpload, faDownload, faComment, faBicycle, faCopy, faClock } from '@fortawesome/free-solid-svg-icons'
import { ReactComponent as WarmdownLogo } from '../../assets/warmdown.svg'
import { ReactComponent as WarmupLogo } from '../../assets/warmup.svg'
import Builder from 'xmlbuilder'
import Converter from 'xml-js'
import helpers from '../helpers'
import firebase, { auth } from '../firebase'
import SignupForm from '../Forms/SignupForm'
import LoginForm from '../Forms/LoginForm'
import { Helmet } from "react-helmet";

interface Bar {
  id: string,
  time: number,
  type: string,
  power?: number,
  startPower?: number,
  endPower?: number,
  cadence: number
}

interface Instruction {
  id: string,
  text: string,
  time: number
}

const Editor = () => {

  const { v4: uuidv4 } = require('uuid');

  const S3_URL = 'https://zwift-workout.s3-eu-west-1.amazonaws.com'

  const [id, setId] = useState(localStorage.getItem('id') || generateId())
  const [bars, setBars] = useState<Array<Bar>>(JSON.parse(localStorage.getItem('currentWorkout') || '[]'))
  const [actionId, setActionId] = useState<string | undefined>(undefined)
  const [ftp, setFtp] = useState(parseInt(localStorage.getItem('ftp') || '200'))
  const [weight, setWeight] = useState(parseInt(localStorage.getItem('weight') || '75'))
  const [instructions, setInstructions] = useState<Array<Instruction>>(JSON.parse(localStorage.getItem('instructions') || '[]'))
  const [cadence, setCadence] = useState(0)
  const [showCadenceInput, setShowCadenceInput] = useState(false)

  const [name, setName] = useState(localStorage.getItem('name') || '')
  const [description, setDescription] = useState(localStorage.getItem('description') || '')
  const [author, setAuthor] = useState(localStorage.getItem('author') || '')

  const [popupIsVisile, setPopupVisibility] = useState(false)

  const [user, setUser] = useState<firebase.User | null>(null)
  const [visibleForm, setVisibleForm] = useState('login') // default form is login

  React.useEffect(() => {
    localStorage.setItem('currentWorkout', JSON.stringify(bars))
    localStorage.setItem('ftp', ftp.toString())
    localStorage.setItem('id', id)
    localStorage.setItem('instructions', JSON.stringify(instructions))
    localStorage.setItem('weight', weight.toString())

    localStorage.setItem('name', name)
    localStorage.setItem('description', description)
    localStorage.setItem('author', author)

    window.history.replaceState('', '', `/editor/${id}`)

    auth.onAuthStateChanged(user => {
      if (user) {
        setUser(user)
      }
    });

  }, [instructions, bars, ftp, weight, id, name, author, description])

  function generateId() {
    return Math.random().toString(36).substr(2, 16)
  }

  function newWorkout() {
    console.log('New workout')

    setBars([])
    setInstructions([])
    setId(generateId())
    setName('')
    setDescription('')
    setAuthor('')
  }

  function handleOnChange(id: string, values: Bar) {
    const index = bars.findIndex(bar => bar.id === id)

    const updatedArray = [...bars]
    updatedArray[index] = values
    setBars(updatedArray)
  }

  function handleOnClick(id: string) {

    if (id === actionId) {
      setActionId(undefined)
    } else {
      setActionId(id)

      const index = bars.findIndex(bar => bar.id === id)
      const element = [...bars][index]

      setCadence(element.cadence)
    }
  }

  function addBar(zone: number, duration: number = 300, cadence: number = 0) {
    setBars(bars => [...bars, {
      time: duration,
      power: zone,
      cadence: cadence,
      type: 'bar',
      id: uuidv4()
    }
    ])
  }

  function addTrapeze(zone1: number, zone2: number, duration: number = 300) {
    setBars(bars => [...bars, {
      time: duration,
      startPower: zone1,
      endPower: zone2,
      cadence: 0,
      type: 'trapeze',
      id: uuidv4()
    }
    ])
  }

  function addFreeRide(duration = 600) {
    setBars(bars => [...bars, {
      time: duration,
      cadence: 0,
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

  function changeInstruction(id: string, values: Instruction) {

    const index = instructions.findIndex(instructions => instructions.id === id)

    const updatedArray = [...instructions]
    updatedArray[index] = values
    setInstructions(updatedArray)

  }

  function deleteInstruction(id: string) {
    const updatedArray = [...instructions]
    setInstructions(updatedArray.filter(item => item.id !== id))
  }

  function removeBar(id: string) {
    const updatedArray = [...bars]
    setBars(updatedArray.filter(item => item.id !== id))
    setActionId(undefined)
  }

  function duplicateBar(id: string) {
    const index = bars.findIndex(bar => bar.id === id)
    const element = [...bars][index]

    if (element.type === 'bar') addBar(element.power || 80, element.time)
    if (element.type === 'freeRide') addFreeRide(element.time)
    if (element.type === 'trapeze') addTrapeze(element.startPower || 80, element.endPower || 160, element.time)

    setActionId(undefined)
  }

  function moveLeft(id: string) {
    const index = bars.findIndex(bar => bar.id === id)
    // not first position of array
    if (index > 0) {
      const updatedArray = [...bars]
      const element = [...bars][index]
      updatedArray.splice(index, 1)
      updatedArray.splice(index - 1, 0, element)
      setBars(updatedArray)
    }
  }

  function moveRight(id: string) {
    const index = bars.findIndex(bar => bar.id === id)
    // not first position of array
    if (index < bars.length - 1) {
      const updatedArray = [...bars]
      const element = [...bars][index]
      updatedArray.splice(index, 1)
      updatedArray.splice(index + 1, 0, element)
      setBars(updatedArray)
    }
  }

  function saveCadence(id: string, cadence: number) {
    setCadence(cadence)

    const updatedArray = [...bars]

    const index = updatedArray.findIndex(bar => bar.id === id)
    const element = [...updatedArray][index]

    element.cadence = cadence
    setBars(updatedArray)

  }

  function saveWorkout() {
    setPopupVisibility(true)
  }

  function save() {

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

      var segment: Builder.XMLNode
      var ramp

      if (bar.type === 'bar') {
        segment = Builder.create('SteadyState')
          .att('Duration', bar.time)
          .att('Power', bar.power)
          .att('pace', 0)

        // add cadence if not zero
        if (bar.cadence !== 0)
          segment.att('Cadence', bar.cadence)

      } else if (bar.type === 'trapeze' && bar.startPower && bar.endPower) {

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

    // save to cloud (firebase) if logged in
    if (user) {
      const itemsRef = firebase.database().ref('workouts/' + id);
      const item = {
        id: id,
        name: name,
        description: description,
        author: author,
        workout: bars,
        userId: user.uid,
        updatedAt: Date()
      }
      itemsRef.set(item);
    }

    return file
  }

  function logout() {
    console.log('logout');

    auth.signOut().then(() => setUser(null))
  }

  function downloadWorkout() {

    const tempFile = save()
    const url = window.URL.createObjectURL(tempFile)

    var a = document.createElement("a")
    document.body.appendChild(a)
    a.style.display = "none"
    a.href = url
    a.download = `${id}.zwo`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  function handleUpload(file: Blob) {

    // ask user if they want to overwrite current workout first
    if (bars.length > 0) {
      if (!window.confirm('Are you sure you want to create a new workout?')) {
        return false
      }
    }

    newWorkout()
    upload(file, true)
  }

  function upload(file: Blob, parse = false) {
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

  function fetchAndParse(id: string) {

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
          const authorIndex = workout_file.elements.findIndex((element: { name: string }) => element.name === 'author')
          setAuthor(workout_file.elements[authorIndex].elements[0].text)

          const nameIndex = workout_file.elements.findIndex((element: { name: string }) => element.name === 'name')
          setName(workout_file.elements[nameIndex].elements[0].text)

          const descriptionIndex = workout_file.elements.findIndex((element: { name: string }) => element.name === 'description')
          setDescription(workout_file.elements[descriptionIndex].elements[0].text)

          const workoutIndex = workout_file.elements.findIndex((element: { name: string }) => element.name === 'workout')

          var totalTime = 0

          workout_file.elements[workoutIndex].elements.map((w: { name: string; attributes: { Power: any; PowerLow: string; Duration: string; PowerHigh: string; Cadence: string }; elements: any }) => {


            if (w.name === 'SteadyState')
              addBar(parseFloat(w.attributes.Power || w.attributes.PowerLow), parseFloat(w.attributes.Duration), parseFloat(w.attributes.Cadence))

            if (w.name === 'Ramp' || w.name === 'Warmup' || w.name === 'Cooldown')
              addTrapeze(parseFloat(w.attributes.PowerLow), parseFloat(w.attributes.PowerHigh), parseFloat(w.attributes.Duration))

            if (w.name === 'FreeRide')
              addFreeRide(parseFloat(w.attributes.Duration))

            // check for instructions
            const textElements = w.elements
            if (textElements && textElements.length > 0) {

              textElements.map((t: { name: string; attributes: { message: string | undefined; timeoffset: string } }) => {

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

  const renderBar = (bar: Bar) => (
    <Bar
      key={bar.id}
      id={bar.id}
      time={bar.time}
      power={bar.power || 100}
      cadence={bar.cadence}
      ftp={ftp}
      weight={weight}
      onChange={(id: string, value: any) => handleOnChange(id, value)} // Change any to Interface Bar?
      onClick={(id: string) => handleOnClick(id)}
      selected={bar.id === actionId}
    />
  )

  const renderTrapeze = (bar: Bar) => (
    <Trapeze
      key={bar.id}
      id={bar.id}
      time={bar.time}
      startPower={bar.startPower || 80}
      endPower={bar.endPower || 160}
      ftp={ftp}
      onChange={(id: string, value: any) => handleOnChange(id, value)} // Change any to Interface Bar?
      onClick={(id: string) => handleOnClick(id)}
      selected={bar.id === actionId}
    />
  )

  const renderFreeRide = (bar: Bar) => (
    <FreeRide
      key={bar.id}
      id={bar.id}
      time={bar.time}
      onChange={(id: string, value: any) => handleOnChange(id, value)} // Change any to Interface Bar?
      onClick={(id: string) => handleOnClick(id)}
      selected={bar.id === actionId}
    />
  )

  const renderComment = (instruction: Instruction) => (
    <Comment
      key={instruction.id}
      instruction={instruction}
      onChange={(id: string, values: Instruction) => changeInstruction(id, values)}
      onDelete={(id: string) => deleteInstruction(id)} />
  )

  const renderRegistrationForm = () => {
    if (visibleForm === 'login') {
      return <LoginForm login={setUser} showSignup={() => setVisibleForm('signup')} dismiss={() => setPopupVisibility(false)} />
    } else {
      return <SignupForm signUp={setUser} showLogin={() => setVisibleForm('login')} dismiss={() => setPopupVisibility(false)} />
    }
  }

  return (
    <div className="container">
      <Helmet>
        <title>{name ? `${name} - Zwift Workout Editor` : "Zwift Workout Editor"}</title>
      </Helmet>      
      
      {popupIsVisile &&
        <Popup>
          {user ?
            <div>
              <h2>Save Workout</h2>
              <div className="form-control">
                <label htmlFor="name">Workout Title</label>
                <input type="text" name="name" placeholder="Workout title" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="form-control">
                <label htmlFor="description">Workout description</label>
                <textarea name="description" placeholder="Workout description" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
              </div>
              <div className="form-control">
                <label htmlFor="author">Workout Author</label>
                <input type="text" name="author" placeholder="Workout Author" value={author} onChange={(e) => setAuthor(e.target.value)} />
              </div>
              <div className="form-control">
                <button className="btn btn-primary" onClick={() => {
                  save()
                  setPopupVisibility(false)
                }}>Save</button>
                <button className="btn" onClick={() => setPopupVisibility(false)}>Dismiss</button>
                <button onClick={() => logout()}>Logout</button>
              </div>
            </div>
            :
            renderRegistrationForm()
          }
        </Popup>
      }
      <div className='editor'>
        {actionId &&
          <div className='actions'>
            <button onClick={() => moveLeft(actionId)} title='Move Left'><FontAwesomeIcon icon={faArrowLeft} size="lg" fixedWidth /></button>
            <button onClick={() => moveRight(actionId)} title='Move Right'><FontAwesomeIcon icon={faArrowRight} size="lg" fixedWidth /></button>
            <button onClick={() => removeBar(actionId)} title='Delete'><FontAwesomeIcon icon={faTrash} size="lg" fixedWidth /></button>
            <button onClick={() => duplicateBar(actionId)} title='Duplicate'><FontAwesomeIcon icon={faCopy} size="lg" fixedWidth /></button>
            <button onClick={() => setShowCadenceInput(!showCadenceInput)} title='Cadence'><FontAwesomeIcon icon={faClock} size="lg" fixedWidth /></button>
            {(showCadenceInput || cadence !== 0) &&
              <input className="textInput" type="number" min="40" max="150" name="cadence" value={cadence} onChange={(e) => saveCadence(actionId, parseInt(e.target.value))} />
            }
          </div>
        }
        <div className='canvas'>
          <div className='slider'>
            {instructions.map((instruction) => renderComment(instruction))}
          </div>
          {actionId &&
            <div className='fader' onClick={() => setActionId(undefined)}></div>
          }
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
        <button className="btn btn-square" onClick={() => addBar(0.5)} style={{ backgroundColor: Colors.GRAY }}>Z1</button>
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
          <input className="textInput" type="number" name="ftp" value={ftp} onChange={(e) => setFtp(parseInt(e.target.value))} />
        </div>

        <div className="form-input">
          <label htmlFor="weight">Body Weight (Kg)</label>
          <input className="textInput" type="number" name="weight" value={weight} onChange={(e) => setWeight(parseInt(e.target.value))} />
        </div>


        <button className="btn" onClick={() => { if (window.confirm('Are you sure you want to create a new workout?')) newWorkout() }}><FontAwesomeIcon icon={faFile} size="lg" fixedWidth /> New</button>
        <button className="btn" onClick={() => saveWorkout()}><FontAwesomeIcon icon={faSave} size="lg" fixedWidth /> Save</button>
        <button className="btn" onClick={() => downloadWorkout()} ><FontAwesomeIcon icon={faDownload} size="lg" fixedWidth /> Download</button>
        <input
          accept=".xml,.zwo"
          id="contained-button-file"
          type="file"
          style={{ display: 'none' }}
          onChange={(e) => handleUpload(e.target.files![0])}
        />
        <button className="btn" onClick={() => document.getElementById("contained-button-file")!.click()}><FontAwesomeIcon icon={faUpload} size="lg" fixedWidth /> Upload</button>
        <div className="form-input">
          <label>Workout Time</label>
          <input className="textInput" value={helpers.getWorkoutLength(bars)} disabled />
        </div>
        <div className="form-input">
          <label>TSS</label>
          <input className="textInput" value={helpers.getStressScore(bars, ftp)} disabled />
        </div>

      </div>
      <div className="terms">Terms</div>
    </div>

  )
}

export default Editor