import React, { useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import './Editor.css'
import { Colors, Zones } from '../Constants'
import GenericBar from '../Bar/GenericBar'
import Comment from '../Comment/Comment'
import Popup from '../Popup/Popup'
import Footer from '../Footer/Footer'
import Workouts from '../Workouts/Workouts'
import TimeAxis from '../Axis/TimeAxis'
import ZoneAxis from '../Axis/ZoneAxis'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faArrowRight, faArrowLeft, faFile, faSave, faUpload, faDownload, faComment, faBicycle, faCopy, faShareAlt, faTimesCircle, faList, faBiking, faRunning } from '@fortawesome/free-solid-svg-icons'
import { ReactComponent as WarmdownLogo } from '../../assets/warmdown.svg'
import { ReactComponent as WarmupLogo } from '../../assets/warmup.svg'
import { ReactComponent as IntervalLogo } from '../../assets/interval.svg'
import { ReactComponent as SteadyLogo } from '../../assets/steady.svg'
import Converter from 'xml-js'
import helpers from '../helpers'
import firebase, { auth } from '../firebase'
import SaveForm from '../Forms/SaveForm'
import SignupForm from '../Forms/SignupForm'
import LoginForm from '../Forms/LoginForm'
import Head from '../Head/Head'
import { RouteComponentProps } from 'react-router-dom';
import ReactGA from 'react-ga';
import RunningTimesEditor, { RunningTimes } from './RunningTimesEditor'
import LeftRightToggle from './LeftRightToggle'
import createWorkoutXml from '../../xml/createWorkoutXml'
import ShareForm from '../Forms/ShareForm'
import PaceSelector, { PaceType } from './PaceSelector'
import { FreeInterval, Interval, RampInterval, RepetitionInterval, SteadyInterval } from '../Interval'


export interface Instruction {
  id: string,
  text: string,
  time: number,
  length: number
}

interface Message {
  visible: boolean,
  class?: string,
  text?: string
}

type TParams = { id: string };

const loadRunningTimes = (): RunningTimes => {
  const missingRunningTimes: RunningTimes = { oneMile: "", fiveKm: "", tenKm: "", halfMarathon: "", marathon: "" }
  const runningTimesJson = localStorage.getItem('runningTimes')
  if (runningTimesJson) {
    return JSON.parse(runningTimesJson)
  }

  // Fallback to old localStorage keys
  const oneMile = localStorage.getItem('oneMileTime') || ''
  const fiveKm = localStorage.getItem('fiveKmTime') || ''
  const tenKm = localStorage.getItem('tenKmTime') || ''
  const halfMarathon = localStorage.getItem('halfMarathonTime') || ''
  const marathon = localStorage.getItem('marathonTime') || ''
  if (oneMile || fiveKm || tenKm || halfMarathon || marathon) {
    return { oneMile, fiveKm, tenKm, halfMarathon, marathon }
  }

  return missingRunningTimes
}
export type SportType = "bike" | "run";

const Editor = ({ match }: RouteComponentProps<TParams>) => {
  const S3_URL = 'https://zwift-workout.s3-eu-west-1.amazonaws.com'

  const [id, setId] = useState(match.params.id === "new" ? (localStorage.getItem('id') || generateId()) : match.params.id)
  const [intervals, setIntervals] = useState<Array<Interval>>(JSON.parse(localStorage.getItem('currentWorkout') || '[]'))
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [ftp, setFtp] = useState(parseInt(localStorage.getItem('ftp') || '200'))
  const [weight, setWeight] = useState(parseInt(localStorage.getItem('weight') || '75'))
  const [instructions, setInstructions] = useState<Array<Instruction>>(JSON.parse(localStorage.getItem('instructions') || '[]'))  
  const [tags, setTags] = useState(JSON.parse(localStorage.getItem('tags') || '[]'))

  const [name, setName] = useState(localStorage.getItem('name') || '')
  const [description, setDescription] = useState(localStorage.getItem('description') || '')
  const [author, setAuthor] = useState(localStorage.getItem('author') || '')

  const [savePopupIsVisile, setSavePopupVisibility] = useState(false)
  const [sharePopupIsVisile, setSharePopupVisibility] = useState(false)

  const [user, setUser] = useState<firebase.User | null>(null)
  const [visibleForm, setVisibleForm] = useState('login') // default form is login

  const canvasRef = useRef<HTMLInputElement>(null);
  const segmentsRef = useRef<HTMLInputElement>(null);
  const [segmentsWidth, setSegmentsWidth] = useState(1320);

  const [message, setMessage] = useState<Message>()

  const [showWorkouts, setShowWorkouts] = useState(false)

  // bike or run
  const [sportType, setSportType] = useState<SportType>(localStorage.getItem('sportType') as SportType || 'bike')

  const [runningTimes, setRunningTimes] = useState(loadRunningTimes())

  const db = firebase.database();

  useEffect(() => {

    setMessage({ visible: true, class: 'loading', text: 'Loading..' })

    db.ref('workouts/' + id).once('value').then(function (snapshot) {
      if (snapshot.val()) {
        // workout exist on server
        setAuthor(snapshot.val().author)
        setName(snapshot.val().name)
        setDescription(snapshot.val().description)
        setIntervals(snapshot.val().workout || [])
        setInstructions(snapshot.val().instructions || [])
        setTags(snapshot.val().tags || [])
        setSportType(snapshot.val().sportType)

        localStorage.setItem('id', id)

      } else {

        // workout doesn't exist on cloud 
        if (id === localStorage.getItem('id')) {
          // user refreshed the page
        } else {
          // treat this as new workout
          setIntervals([])
          setInstructions([])
          setName('')
          setDescription('')
          setAuthor('')
          setTags([])
        }

        localStorage.setItem('id', id)

      }
      console.log('useEffect firebase');

      //finished loading
      setMessage({ visible: false })
    })

    auth.onAuthStateChanged(user => {
      if (user) {
        setUser(user)
      }
    });

    window.history.replaceState('', '', `/editor/${id}`)

    ReactGA.initialize('UA-55073449-9');
    ReactGA.pageview(window.location.pathname + window.location.search);

  }, [id, db])

  useEffect(() => {

    localStorage.setItem('currentWorkout', JSON.stringify(intervals))
    localStorage.setItem('ftp', ftp.toString())

    localStorage.setItem('instructions', JSON.stringify(instructions))
    localStorage.setItem('weight', weight.toString())

    localStorage.setItem('name', name)
    localStorage.setItem('description', description)
    localStorage.setItem('author', author)
    localStorage.setItem('tags', JSON.stringify(tags))
    localStorage.setItem('sportType', sportType)

    localStorage.setItem('runningTimes', JSON.stringify(runningTimes))

    setSegmentsWidth(segmentsRef.current?.scrollWidth || 1320)    

  }, [segmentsRef, intervals, ftp, instructions, weight, name, description, author, tags, sportType, runningTimes])

  function generateId() {
    return Math.random().toString(36).substr(2, 16)
  }

  function newWorkout() {
    console.log('New workout')

    setId(generateId())
    setIntervals([])
    setInstructions([])
    setName('')
    setDescription('')
    setAuthor('')
    setTags([])

  }

  function updateInterval(updatedInterval: Interval) {
    const index = intervals.findIndex(interval => interval.id === updatedInterval.id)

    const updatedArray = [...intervals]
    updatedArray[index] = updatedInterval

    setIntervals(updatedArray)
  }

  function toggleSelection(id: string) {
    if (id === selectedId) {
      setSelectedId(undefined)
    } else {
      setSelectedId(id)
    }
  }

  function handleKeyPress(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.target instanceof HTMLInputElement) {
      // Ignore key presses coming from input elements
      return;
    }

    switch (event.keyCode) {
      case 8:
        removeBar(selectedId || '')
        // Prevent navigation to previous page
        event.preventDefault()
        break;
      case 37:
        // reduce time
        removeTimeToBar(selectedId || '')
        break;
      case 39:
        // add time
        addTimeToBar(selectedId || '')
        break;
      case 38:
        // add power
        addPowerToBar(selectedId || '')
        break;
      case 40:
        // add power
        removePowerToBar(selectedId || '')
        break;
      default:
        //console.log(event.keyCode);        
        break;
    }
  }

  function addSteadyInterval(power: number, duration: number = 300, cadence: number = 0, pace: PaceType = PaceType.oneMile) {
    const interval: SteadyInterval = {
      duration: duration,
      power: power,
      cadence: cadence,
      type: 'steady',
      id: uuidv4(),
      pace: pace
    };
    setIntervals(intervals => [...intervals, interval])
  }

  function addRampInterval(startPower: number, endPower: number, duration: number = 300, pace: PaceType = PaceType.oneMile, cadence: number = 0) {
    const interval: RampInterval = {
      duration: duration,
      startPower: startPower,
      endPower: endPower,
      cadence: cadence,
      pace: pace,
      type: 'ramp',
      id: uuidv4()
    };
    setIntervals(intervals => [...intervals, interval])
  }

  function addFreeInterval(duration = 600, cadence: number = 0) {
    const interval: FreeInterval = {
      duration: duration,
      cadence: cadence,
      type: 'free',
      id: uuidv4()
    };
    setIntervals(intervals => [...intervals, interval])
  }

  function addRepetitionInterval(repeat: number = 3, onDuration: number = 30, offDuration: number = 120, onPower: number = 1, offPower: number = 0.5, cadence: number = 0, restingCadence: number = 0, pace: PaceType = PaceType.oneMile) {
    const interval: RepetitionInterval = {
      id: uuidv4(),
      type: 'repetition',
      cadence: cadence,
      restingCadence: restingCadence,
      repeat: repeat,
      onDuration: onDuration,
      offDuration: offDuration,
      onPower: onPower,
      offPower: offPower,
      pace: pace,
    };
    setIntervals(intervals => [...intervals, interval])
  }

  function addInstruction(text = '', time = 0, length = 0) {
    setInstructions(instructions => [...instructions, {
      text: text,
      time: time,
      length: length,
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
    setInstructions(instructions.filter(item => item.id !== id))
  }

  function removeBar(id: string) {
    setIntervals(intervals.filter(item => item.id !== id))
    setSelectedId(undefined)
  }

  function replaceInterval(id: string, transform: (interval: Interval) => Interval) {
    const index = intervals.findIndex(interval => interval.id === id);
    if (index === -1) {
      return;
    }

    setIntervals([
      ...intervals.slice(0, index),
      ...[transform(intervals[index])],
      ...intervals.slice(index + 1),
    ]);
  }

  function addTimeToBar(id: string) {
    replaceInterval(id, (interval) => {
      if (interval.type === 'steady') {
        return { ...interval, duration: interval.duration + 5 };
      }
      return interval;
    });
  }

  function removeTimeToBar(id: string) {
    replaceInterval(id, (interval) => {
      if (interval.type === 'steady' && interval.duration > 5) {
        return { ...interval, duration: interval.duration - 5 };
      }
      return interval;
    });
  }

  function addPowerToBar(id: string) {
    replaceInterval(id, (interval) => {
      if (interval.type === 'steady') {
        return { ...interval, power: parseFloat((interval.power + 1 / ftp).toFixed(3)) }
      }
      return interval;
    });
  }

  function removePowerToBar(id: string) {
    replaceInterval(id, (interval) => {
      if (interval.type === 'steady' && interval.power >= Zones.Z1.min) {
        return { ...interval, power: parseFloat((interval.power - 1 / ftp).toFixed(3)) }
      }
      return interval;
    });
  }

  function duplicateBar(id: string) {
    const index = intervals.findIndex(interval => interval.id === id)
    const interval = intervals[index]

    if (interval.type === 'steady') addSteadyInterval(interval.power, interval.duration, interval.cadence, interval.pace)
    if (interval.type === 'free') addFreeInterval(interval.duration, interval.cadence)
    if (interval.type === 'ramp') addRampInterval(interval.startPower, interval.endPower, interval.duration, interval.pace, interval.cadence)
    if (interval.type === 'repetition') addRepetitionInterval(interval.repeat, interval.onDuration, interval.offDuration, interval.onPower, interval.offPower, interval.cadence, interval.restingCadence, interval.pace)

    setSelectedId(undefined)
  }

  function moveLeft(id: string) {
    const index = intervals.findIndex(interval => interval.id === id)
    // not first position of array
    if (index > 0) {
      const updatedArray = [...intervals]
      const interval = updatedArray[index]
      updatedArray.splice(index, 1)
      updatedArray.splice(index - 1, 0, interval)
      setIntervals(updatedArray)
    }
  }

  function moveRight(id: string) {
    const index = intervals.findIndex(interval => interval.id === id)
    // not first position of array
    if (index < intervals.length - 1) {
      const updatedArray = [...intervals]
      const interval = updatedArray[index]
      updatedArray.splice(index, 1)
      updatedArray.splice(index + 1, 0, interval)
      setIntervals(updatedArray)
    }
  }

  function saveWorkout() {
    setSavePopupVisibility(true)
  }

  function deleteWorkout() {
    // save to cloud (firebase) if logged in
    if (user) {
      const itemsRef = firebase.database().ref();

      var updates: any = {}
      updates[`users/${user.uid}/workouts/${id}`] = null
      updates[`workouts/${id}`] = null


      // save to firebase      
      itemsRef.update(updates).then(() => {
        newWorkout()
      }).catch((error) => {
        console.log(error);
        setMessage({ visible: true, class: 'error', text: 'Cannot delete workout' })
      });
    }
  }

  function shareWorkout() {
    if (user) {
      save()
      setSharePopupVisibility(true)
    } else {
      saveWorkout()
    }

  }

  function save() {

    setMessage({ visible: true, class: 'loading', text: 'Saving..' })

    const xml = createWorkoutXml({
      author,
      name,
      description,
      sportType,
      tags,
      intervals,
      instructions
    });

    const file = new Blob([xml], { type: 'application/xml' })

    // save to cloud (firebase) if logged in
    if (user) {
      const itemsRef = firebase.database().ref();

      const item = {
        id: id,
        name: name,
        description: description,
        author: author,
        workout: intervals,
        tags: tags,
        instructions: instructions,
        userId: user.uid,
        updatedAt: Date(),
        sportType: sportType,
      }

      const item2 = {
        name: name,
        description: description,
        updatedAt: Date(),
        sportType: sportType,
        workoutTime: helpers.formatDuration(helpers.getWorkoutDuration(intervals)),
      }

      var updates: any = {}
      updates[`users/${user.uid}/workouts/${id}`] = item2
      updates[`workouts/${id}`] = item


      // save to firebase      
      itemsRef.update(updates).then(() => {
        //upload to s3  
        upload(file, false)
        setMessage({ visible: false })

      }).catch((error) => {
        console.log(error);
        setMessage({ visible: true, class: 'error', text: 'Cannot save this' })
      });
    } else {
      // download workout without saving
      setMessage({ visible: false })
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
    if (intervals.length > 0) {
      if (!window.confirm('Are you sure you want to create a new workout?')) {
        return false
      }
    }

    newWorkout()
    upload(file, true)
  }

  function upload(file: Blob, parse = false) {
    fetch('https://zwiftworkout.netlify.app/.netlify/functions/upload', {
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
    setIntervals([])
    setInstructions([])

    fetch(`${S3_URL}/${id}.zwo`)
      .then(response => response.text())
      .then(data => {

        // remove xml comments
        data = data.replace(/<!--(.*?)-->/gm, "")

        //now parse file  
        const workout = Converter.xml2js(data)
        const workout_file = workout.elements[0]

        if (workout_file.name === 'workout_file') {
          // file is valid
          const authorIndex = workout_file.elements.findIndex((element: { name: string }) => element.name === 'author')
          if (authorIndex !== -1 && workout_file.elements[authorIndex].elements) {
            setAuthor(workout_file.elements[authorIndex].elements[0].text)
          }

          const nameIndex = workout_file.elements.findIndex((element: { name: string }) => element.name === 'name')
          if (nameIndex !== -1 && workout_file.elements[nameIndex].elements) {
            setName(workout_file.elements[nameIndex].elements[0].text)
          }

          const descriptionIndex = workout_file.elements.findIndex((element: { name: string }) => element.name === 'description')
          if (descriptionIndex !== -1 && workout_file.elements[descriptionIndex].elements) {
            setDescription(workout_file.elements[descriptionIndex].elements[0].text)
          }

          const workoutIndex = workout_file.elements.findIndex((element: { name: string }) => element.name === 'workout')

          var totalTime = 0

          workout_file.elements[workoutIndex].elements.map((w: { name: string; attributes: { Power: any; PowerLow: string; Duration: string; PowerHigh: string; Cadence: string; CadenceResting: string; Repeat: string; OnDuration: string; OffDuration: string; OnPower: string, OffPower: string; Pace: string }; elements: any }) => {

            let duration = parseFloat(w.attributes.Duration)

            if (w.name === 'SteadyState')
              addSteadyInterval(parseFloat(w.attributes.Power || w.attributes.PowerLow), parseFloat(w.attributes.Duration), parseFloat(w.attributes.Cadence || '0'), parseInt(w.attributes.Pace || '0'))

            if (w.name === 'Ramp' || w.name === 'Warmup' || w.name === 'Cooldown')
              addRampInterval(parseFloat(w.attributes.PowerLow), parseFloat(w.attributes.PowerHigh), parseFloat(w.attributes.Duration), parseInt(w.attributes.Pace || '0'), parseInt(w.attributes.Cadence))

            if (w.name === 'IntervalsT'){
              addRepetitionInterval(parseFloat(w.attributes.Repeat), parseFloat(w.attributes.OnDuration), parseFloat(w.attributes.OffDuration), parseFloat(w.attributes.OnPower), parseFloat(w.attributes.OffPower), parseInt(w.attributes.Cadence || '0'), parseInt(w.attributes.CadenceResting), parseInt(w.attributes.Pace || '0'))
              duration = (parseFloat(w.attributes.OnDuration) + parseFloat(w.attributes.OffDuration)) * parseFloat(w.attributes.Repeat)
            }              

            if (w.name === 'free')
              addFreeInterval(parseFloat(w.attributes.Duration), parseInt(w.attributes.Cadence))

            // check for instructions
            const textElements = w.elements
            if (textElements && textElements.length > 0) {

              textElements.map((t: { name: string; attributes: { message: string | undefined; timeoffset: string } }) => {

                if (t.name.toLowerCase() === 'textevent')
                  addInstruction(t.attributes.message, totalTime + parseFloat(t.attributes.timeoffset))

                return false
              })

            }

            totalTime = totalTime + duration
            // map functions expect return value
            return false
          })
        }
      })
      .catch(error => {
        console.error(error)
      })
  }

  const renderInterval = (interval: Interval) => {
    return (
      <GenericBar
        key={interval.id}
        interval={interval}
        ftp={ftp}
        weight={weight}
        sportType={sportType}
        onChange={updateInterval}
        onClick={toggleSelection}
        selected={interval.id === selectedId}
      />
    );
  }

  const renderComment = (instruction: Instruction, index: number) => (
    <Comment
      key={instruction.id}
      instruction={instruction}
      width={helpers.getWorkoutDuration(intervals) / 3}
      onChange={(id: string, values: Instruction) => changeInstruction(id, values)}
      onDelete={(id: string) => deleteInstruction(id)} 
      index={index}
      />
  )

  const renderRegistrationForm = () => {
    if (visibleForm === 'login') {
      return <LoginForm login={setUser} showSignup={() => setVisibleForm('signup')} dismiss={() => setSavePopupVisibility(false)} />
    } else {
      return <SignupForm signUp={setUser} showLogin={() => setVisibleForm('login')} dismiss={() => setSavePopupVisibility(false)} />
    }
  }

  function setPace(pace: PaceType, id: string) {
    const index = intervals.findIndex(interval => interval.id === id)

    if (index !== -1) {
      const updatedArray = [...intervals]
      const interval = updatedArray[index]
      if (interval.type !== 'steady') { // TODO: Only steady?
        return;
      }
      interval.pace = pace
      setIntervals(updatedArray)
    }
  }

  function getPace(id: string): PaceType | undefined {
    const index = intervals.findIndex(interval => interval.id === id)

    if (index !== -1) {
      const interval = intervals[index]
      return interval.type === 'free' ? undefined : interval.pace
    }
  }

  function switchSportType(newSportType: SportType) {
    setSportType(newSportType);
  }

  return (
    // Adding tabIndex allows div element to receive keyboard events
    <div className="container" onKeyDown={handleKeyPress} tabIndex={0}>
      <Head id={id} name={name} description={description} />

      {message?.visible &&
        <div className={`message ${message.class}`}>
          {message.text}
          <button className="close" onClick={() => setMessage({ visible: false })}>
            <FontAwesomeIcon icon={faTimesCircle} size="lg" fixedWidth />
          </button>
        </div>
      }

      {showWorkouts &&
        <Popup width="500px" dismiss={() => setShowWorkouts(false)}>
          {user ?
            <Workouts userId={user.uid} />
            :
            renderRegistrationForm()
          }
        </Popup>
      }

      {savePopupIsVisile &&
        <Popup width="500px" dismiss={() => setSavePopupVisibility(false)}>
          {user ?
            <SaveForm
              name={name}
              description={description}
              author={author}
              tags={tags}
              onNameChange={setName}
              onDescriptionChange={setDescription}
              onAuthorChange={setAuthor}
              onTagsChange={setTags}
              onSave={() => {
                save()
                setSavePopupVisibility(false)
              }}
              onDismiss={() => setSavePopupVisibility(false)}
              onLogout={logout}
            />
            :
            renderRegistrationForm()
          }
        </Popup>
      }
      {sharePopupIsVisile &&
        <Popup width="500px" dismiss={() => setSharePopupVisibility(false)}>
          <ShareForm id={id} onDismiss={() => setSharePopupVisibility(false)} />
        </Popup>
      }
      <div className="info">
        <div className="title">
          <h1>{name}</h1>
          <div className="description">{description}</div>
          <p>{author ? `by ${author}` : ''}</p>
        </div>
        <div className="workout">
          <div className="form-input">
            <label>Workout Time</label>
            <input className="textInput" value={helpers.formatDuration(helpers.getWorkoutDuration(intervals))} disabled />
          </div>
          <div className="form-input">
            <label>TSS</label>
            <input className="textInput" value={helpers.getStressScore(intervals, ftp)} disabled />
          </div>
          <LeftRightToggle<"bike","run">
            label="Sport Type"
            leftValue="bike"
            rightValue="run"
            leftIcon={faBiking}
            rightIcon={faRunning}
            selected={sportType}
            onChange={switchSportType}
          />
        </div>
      </div>
      {sportType === "run" && <RunningTimesEditor times={runningTimes} onChange={setRunningTimes} />}

      <div id="editor" className='editor'>
        {selectedId &&
          <div className='actions'>
            <button onClick={() => moveLeft(selectedId)} title='Move Left'><FontAwesomeIcon icon={faArrowLeft} size="lg" fixedWidth /></button>
            <button onClick={() => moveRight(selectedId)} title='Move Right'><FontAwesomeIcon icon={faArrowRight} size="lg" fixedWidth /></button>
            <button onClick={() => removeBar(selectedId)} title='Delete'><FontAwesomeIcon icon={faTrash} size="lg" fixedWidth /></button>
            <button onClick={() => duplicateBar(selectedId)} title='Duplicate'><FontAwesomeIcon icon={faCopy} size="lg" fixedWidth /></button>
            {sportType === "run" &&
              <PaceSelector value={getPace(selectedId)} onChange={(pace) => setPace(pace, selectedId)} />
            }
          </div>
        }
        <div className='canvas' ref={canvasRef}>          
          {selectedId &&
            <div className='fader' style={{width: canvasRef.current?.scrollWidth}} onClick={() => setSelectedId(undefined)}></div>
          }
          <div className='segments' ref={segmentsRef}>
            {intervals.map(renderInterval)}
          </div>

          <div className='slider'>
            {instructions.map((instruction, index) => renderComment(instruction, index))}
          </div>

          <TimeAxis width={segmentsWidth} />
        </div>
        <ZoneAxis />
      </div>
      <div className='cta'>
        {sportType === "bike" ?
          <div>
            <button className="btn btn-square" onClick={() => addSteadyInterval(0.5)} style={{ backgroundColor: Colors.GRAY }}>Z1</button>
            <button className="btn btn-square" onClick={() => addSteadyInterval(Zones.Z2.min)} style={{ backgroundColor: Colors.BLUE }}>Z2</button>
            <button className="btn btn-square" onClick={() => addSteadyInterval(Zones.Z3.min)} style={{ backgroundColor: Colors.GREEN }}>Z3</button>
            <button className="btn btn-square" onClick={() => addSteadyInterval(Zones.Z4.min)} style={{ backgroundColor: Colors.YELLOW }}>Z4</button>
            <button className="btn btn-square" onClick={() => addSteadyInterval(Zones.Z5.min)} style={{ backgroundColor: Colors.ORANGE }}>Z5</button>
            <button className="btn btn-square" onClick={() => addSteadyInterval(Zones.Z6.min)} style={{ backgroundColor: Colors.RED }}>Z6</button>
          </div>
          :
          <button className="btn" onClick={() => addSteadyInterval(1, 300, 0, 0)} style={{ backgroundColor: Colors.WHITE }}><SteadyLogo className="btn-icon" /> Steady Pace</button>
        }

        <button className="btn" onClick={() => addRampInterval(0.25, 0.75)} style={{ backgroundColor: Colors.WHITE }}><WarmupLogo className="btn-icon" /> Warm up</button>
        <button className="btn" onClick={() => addRampInterval(0.75, 0.25)} style={{ backgroundColor: Colors.WHITE }}><WarmdownLogo className="btn-icon" /> Cool down</button>
        <button className="btn" onClick={() => addRepetitionInterval()} style={{ backgroundColor: Colors.WHITE }}><IntervalLogo className="btn-icon" /> Interval</button>
        {sportType === "bike" &&
          <button className="btn" onClick={() => addFreeInterval()} style={{ backgroundColor: Colors.WHITE }}><FontAwesomeIcon icon={faBicycle} size="lg" fixedWidth /> Free Ride</button>
        }
        <button className="btn" onClick={() => addInstruction()} style={{ backgroundColor: Colors.WHITE }}><FontAwesomeIcon icon={faComment} size="lg" fixedWidth /> Text Event</button>
        {sportType === "bike" &&
          <div className="form-input">
            <label htmlFor="ftp">FTP (W)</label>
            <input className="textInput" type="number" name="ftp" value={ftp} onChange={(e) => setFtp(parseInt(e.target.value))} />
          </div>
        }

        {sportType === "bike" &&
          <div className="form-input">
            <label htmlFor="weight">Body Weight (Kg)</label>
            <input className="textInput" type="number" name="weight" value={weight} onChange={(e) => setWeight(parseInt(e.target.value))} />
          </div>
        }

        <button className="btn" onClick={() => { if (window.confirm('Are you sure you want to create a new workout?')) newWorkout() }}><FontAwesomeIcon icon={faFile} size="lg" fixedWidth /> New</button>
        <button className="btn" onClick={() => saveWorkout()}><FontAwesomeIcon icon={faSave} size="lg" fixedWidth /> Save</button>
        <button className="btn" onClick={() => { if (window.confirm('Are you sure you want to delete this workout?')) deleteWorkout() }}><FontAwesomeIcon icon={faTrash} size="lg" fixedWidth /> Delete</button>
        <button className="btn" onClick={() => downloadWorkout()} ><FontAwesomeIcon icon={faDownload} size="lg" fixedWidth /> Download</button>
        <input
          accept=".xml,.zwo"
          id="contained-button-file"
          type="file"
          style={{ display: 'none' }}
          onChange={(e) => handleUpload(e.target.files![0])}
        />
        <button className="btn" onClick={() => document.getElementById("contained-button-file")!.click()}><FontAwesomeIcon icon={faUpload} size="lg" fixedWidth /> Upload</button>
        <button className="btn" onClick={() => setShowWorkouts(true)}><FontAwesomeIcon icon={faList} size="lg" fixedWidth /> Workouts</button>
        <button className="btn" onClick={() => shareWorkout()} ><FontAwesomeIcon icon={faShareAlt} size="lg" fixedWidth /> Share</button>
      </div>
      <Footer />
    </div>

  )
}

export default Editor