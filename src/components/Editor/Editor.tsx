import React, { useState, useEffect, useRef, useCallback } from 'react'
import './Editor.css'
import { ZoneColor, Zones } from '../../types/Zones'
import GenericBar from '../Bar/GenericBar'
import InstructionEditor from '../InstructionEditor/InstructionEditor'
import Popup from '../Popup/Popup'
import Footer from '../Footer/Footer'
import Workouts from '../Workouts/Workouts'
import TimeAxis from '../Axis/TimeAxis'
import ZoneAxis from '../Axis/ZoneAxis'
import { faTrash, faArrowRight, faArrowLeft, faFile, faSave, faDownload, faComment, faBicycle, faCopy, faShareAlt, faList, faBiking, faRunning, faClock, faRuler } from '@fortawesome/free-solid-svg-icons'
import { ReactComponent as WarmdownLogo } from '../../assets/warmdown.svg'
import { ReactComponent as WarmupLogo } from '../../assets/warmup.svg'
import { ReactComponent as IntervalLogo } from '../../assets/interval.svg'
import { ReactComponent as SteadyLogo } from '../../assets/steady.svg'
import firebase, { auth } from '../../network/firebase'
import * as workoutMeta from '../../network/workoutMeta'
import SaveForm from '../Forms/SaveForm'
import SignupForm from '../Forms/SignupForm'
import LoginForm from '../Forms/LoginForm'
import Head from '../Head/Head'
import { RouteComponentProps } from 'react-router-dom';
import ReactGA from 'react-ga';
import RunningTimesEditor from './RunningTimesEditor'
import LeftRightToggle from './LeftRightToggle'
import createWorkoutXml from '../../xml/createWorkoutXml'
import ShareForm from '../Forms/ShareForm'
import { PaceType } from '../../types/PaceType'
import PaceSelector from './PaceSelector'
import { Interval } from '../../types/Interval'
import { createInstruction, Instruction } from '../../types/Instruction'
import intervalFactory from '../../interval/intervalFactory'
import parseWorkoutXml from '../../xml/parseWorkoutXml'
import upload from '../../network/upload'
import download from '../../network/download'
import { createEmptyWorkout, Workout } from '../../types/Workout'
import { moveInterval, updateIntervalDuration, updateIntervalIntensity } from '../../interval/intervalUtils'
import Keyboard from '../Keyboard/Keyboard'
import Stats from './Stats'
import Title from './Title'
import NumberField from './NumberField'
import UploadButton from '../Button/UploadButton'
import IconButton from '../Button/IconButton'
import ColorButton from '../Button/ColorButton'
import Button from '../Button/Button'
import ActionButton from '../Button/ActionButton'
import * as storage from '../../storage/storage';
import Notification, { NotificationMessage } from './Notification'
import { SportType } from '../../types/SportType'
import createMode from '../../modes/createMode'
import { workoutDuration } from '../../utils/duration'
import * as format from '../../utils/format'
import { Duration } from '../../types/Length'
import DistanceAxis from '../Axis/DistanceAxis'
import { LengthType } from '../../types/LengthType'
import { workoutDistance } from '../../utils/distance'
import RunMode from '../../modes/RunMode'

type TParams = { id: string };

const Editor = ({ match }: RouteComponentProps<TParams>) => {
  const [id, setId] = useState(match.params.id === "new" ? (storage.getId() || generateId()) : match.params.id)

  const [name, setName] = useState(storage.getName())
  const [description, setDescription] = useState(storage.getDescription())
  const [author, setAuthor] = useState(storage.getAuthor())
  const [tags, setTags] = useState(storage.getTags())
  const [sportType, setSportType] = useState(storage.getSportType())
  const [lengthType, setLengthType] = useState(storage.getLengthType());
  const [intervals, setIntervals] = useState(storage.getIntervals())
  const [instructions, setInstructions] = useState(storage.getInstructions())

  const [ftp, setFtp] = useState(storage.getFtp())
  const [weight, setWeight] = useState(storage.getWeight())
  const [runningTimes, setRunningTimes] = useState(storage.getRunningTimes())

  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)

  const [savePopupIsVisile, setSavePopupVisibility] = useState(false)
  const [sharePopupIsVisile, setSharePopupVisibility] = useState(false)

  const [user, setUser] = useState<firebase.User | null>(null)
  const [visibleForm, setVisibleForm] = useState('login') // default form is login

  const canvasRef = useRef<HTMLInputElement>(null);
  const segmentsRef = useRef<HTMLInputElement>(null);
  const [segmentsWidth, setSegmentsWidth] = useState(1320);

  const [message, setMessage] = useState<NotificationMessage>({ text: "", className: "", visible: false });

  const [showWorkouts, setShowWorkouts] = useState(false)

  const getMode = useCallback(() => {
    return createMode({sportType, ftp, weight, runningTimes, lengthType});
  }, [sportType, ftp, weight, runningTimes, lengthType]);

  useEffect(() => {
    showMessage({ className: 'loading', text: 'Loading..' })

    download(id).then((xml) => {
      try {
        // workout exist on server
        loadWorkout(parseWorkoutXml(xml, getMode()));
        storage.setId(id)
      } catch (e) {
        // workout doesn't exist on cloud 
        if (id === storage.getId()) {
          // user refreshed the page
        } else {
          // treat this as new workout
          loadWorkout(createEmptyWorkout(sportType, lengthType))
        }

        storage.setId(id)
      }
      //finished loading
      hideMessage()
    })

    auth.onAuthStateChanged(user => {
      if (user) {
        setUser(user)
      }
    });

    window.history.replaceState('', '', `/editor/${id}`)

    ReactGA.initialize('UA-55073449-9');
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, [id, sportType, lengthType, getMode])

  useEffect(() => {
    storage.setName(name)
    storage.setDescription(description)
    storage.setAuthor(author)
    storage.setTags(tags)
    storage.setSportType(sportType)
    storage.setLengthType(lengthType)
    storage.setIntervals(intervals)
    storage.setInstructions(instructions)

    storage.setFtp(ftp)
    storage.setWeight(weight)
    storage.setRunningTimes(runningTimes)

    setSegmentsWidth(segmentsRef.current?.scrollWidth || 1320)
  }, [segmentsRef, intervals, ftp, instructions, weight, name, description, author, tags, sportType, lengthType, runningTimes])

  function generateId() {
    return Math.random().toString(36).substr(2, 16)
  }

  function loadWorkout(workout: Workout) {
    setSportType(workout.sportType)
    setLengthType(workout.lengthType)
    setAuthor(workout.author)
    setName(workout.name)
    setDescription(workout.description)
    setIntervals(workout.intervals)
    setInstructions(workout.instructions)
    setTags(workout.tags)
  }

  function newWorkout() {
    setId(generateId())
    loadWorkout(createEmptyWorkout(sportType, lengthType))
  }

  function showMessage({ text, className }: NotificationMessage) {
    setMessage({ text, className, visible: true })
  }

  function hideMessage() {
    setMessage((message) => ({ ...message, visible: false }))
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

  function addInterval(interval: Interval) {
    setIntervals(intervals => [...intervals, interval]);
  }

  function addInstruction(instruction: Instruction) {
    setInstructions(instructions => [...instructions, instruction]);
  }

  function updateInstruction(instruction: Instruction) {
    const index = instructions.findIndex(instructions => instructions.id === instruction.id)

    const updatedArray = [...instructions]
    updatedArray[index] = instruction
    setInstructions(updatedArray)
  }

  function deleteInstruction(id: string) {
    setInstructions(instructions.filter(item => item.id !== id))
  }

  function removeInterval(id: string) {
    setIntervals(intervals.filter(item => item.id !== id))
    setSelectedId(undefined)
  }

  function duplicateInterval(id: string) {
    const interval = intervals.find(interval => interval.id === id)
    if (interval) {
      addInterval(intervalFactory.clone(interval));
    }
    setSelectedId(undefined)
  }

  function saveWorkout() {
    setSavePopupVisibility(true)
  }

  async function deleteWorkout() {
    if (user) {
      try {
        await workoutMeta.remove(user, id);
        newWorkout()
      } catch(error) {
        console.log(error);
        showMessage({ className: 'error', text: 'Cannot delete workout' })
      }
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

  async function save() {
    const mode = getMode();
    showMessage({ className: 'loading', text: 'Saving..' })

    const xml = createWorkoutXml({
      author,
      name,
      description,
      sportType,
      lengthType,
      tags,
      intervals,
      instructions,
    }, mode);

    const file = new Blob([xml], { type: 'application/xml' })

    // save to cloud (firebase) if logged in
    if (user) {
      try {
        await workoutMeta.update(user, {
          id: id,
          name: name,
          description: description,
          updatedAt: Date(),
          sportType: sportType,
          durationType: lengthType,
          workoutTime: format.duration(workoutDuration(intervals, mode)),
          workoutDistance: mode instanceof RunMode ? format.distance(workoutDistance(intervals, mode)) : "",
        });
        //upload to s3  
        upload(id, file)
        hideMessage()
      } catch (error) {
        console.log(error);
        showMessage({ className: 'error', text: 'Cannot save this' })
      }
    } else {
      // download workout without saving
      hideMessage()
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

  async function handleUpload(file: Blob) {
    // ask user if they want to overwrite current workout first
    if (intervals.length > 0) {
      if (!window.confirm('Are you sure you want to create a new workout?')) {
        return false
      }
    }

    newWorkout()

    try {
      await upload(id, file);
      loadWorkout(parseWorkoutXml(await download(id), getMode()));
    } catch (e) {
      console.error(e);
    }
  }

  const renderInterval = (interval: Interval) => {
    return (
      <GenericBar
        key={interval.id}
        interval={interval}
        mode={getMode()}
        onChange={updateInterval}
        onClick={toggleSelection}
        selected={interval.id === selectedId}
      />
    );
  }

  const renderInstruction = (instruction: Instruction, index: number) => (
    <InstructionEditor
      key={instruction.id}
      instruction={instruction}
      width={workoutDuration(intervals, getMode()).seconds / 3}
      onChange={updateInstruction}
      onDelete={deleteInstruction}
      index={index}
      mode={getMode()}
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
    if (window.confirm(`Switching from ${sportType} to ${newSportType} will clear current workout. Are you sure?`)) {
      newWorkout();
      setSportType(newSportType);
    }
  }

  function switchLengthType(newLengthType: LengthType) {
    if (window.confirm(`Switching from ${lengthType} to ${newLengthType} will clear current workout. Are you sure?`)) {
      newWorkout();
      setLengthType(newLengthType);
    }
  }

  return (
    <Keyboard
      className="container"
      onBackspacePress={() => selectedId && removeInterval(selectedId)}
      onUpPress={() => selectedId && setIntervals(updateIntervalIntensity(selectedId, 0.01, intervals))}
      onDownPress={() => selectedId && setIntervals(updateIntervalIntensity(selectedId, -0.01, intervals))}
      onLeftPress={() => selectedId && setIntervals(updateIntervalDuration(selectedId, new Duration(-5), intervals, getMode()))}
      onRightPress={() => selectedId && setIntervals(updateIntervalDuration(selectedId, new Duration(5), intervals, getMode()))}
    >
      <Head id={id} name={name} description={description} />

      <Notification {...message} onClose={hideMessage} />

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
        <Title name={name} author={author} description={description} />
        <div className="workout">
          <Stats intervals={intervals} ftp={ftp} mode={getMode()} />
          {sportType === 'run' &&
            <LeftRightToggle<"time","distance">
              label="Duration Type"
              leftValue="time"
              rightValue="distance"
              leftIcon={faClock}
              rightIcon={faRuler}
              selected={lengthType}
              onChange={switchLengthType}
            />
          }
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
            <ActionButton title='Move Left' icon={faArrowLeft} onClick={() => selectedId && setIntervals(moveInterval(selectedId, -1, intervals))} />
            <ActionButton title='Move Right' icon={faArrowRight} onClick={() => selectedId && setIntervals(moveInterval(selectedId, +1, intervals))} />
            <ActionButton title='Delete' icon={faTrash} onClick={() => selectedId && removeInterval(selectedId)} />
            <ActionButton title='Duplicate' icon={faCopy} onClick={() => selectedId && duplicateInterval(selectedId)} />
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
            {instructions.map((instruction, index) => renderInstruction(instruction, index))}
          </div>

          {lengthType === "time" ? <TimeAxis width={segmentsWidth} /> : <DistanceAxis width={segmentsWidth} />}
        </div>
        <ZoneAxis />
      </div>
      <div className='cta'>
        {sportType === "bike" ?
          <div>
            <ColorButton label="Z1" color={ZoneColor.GRAY} onClick={() => addInterval(intervalFactory.steady({ intensity: 0.5 }, getMode()))} />
            <ColorButton label="Z2" color={ZoneColor.BLUE} onClick={() => addInterval(intervalFactory.steady({ intensity: Zones.Z2.min }, getMode()))} />
            <ColorButton label="Z3" color={ZoneColor.GREEN} onClick={() => addInterval(intervalFactory.steady({ intensity: Zones.Z3.min }, getMode()))} />
            <ColorButton label="Z4" color={ZoneColor.YELLOW} onClick={() => addInterval(intervalFactory.steady({ intensity: Zones.Z4.min }, getMode()))} />
            <ColorButton label="Z5" color={ZoneColor.ORANGE} onClick={() => addInterval(intervalFactory.steady({ intensity: Zones.Z5.min }, getMode()))} />
            <ColorButton label="Z6" color={ZoneColor.RED} onClick={() => addInterval(intervalFactory.steady({ intensity: Zones.Z6.min }, getMode()))} />
          </div>
          :
          <Button onClick={() => addInterval(intervalFactory.steady({}, getMode()))}><SteadyLogo className="btn-icon" /> Steady Pace</Button>
        }

        <Button onClick={() => addInterval(intervalFactory.ramp({ startIntensity: 0.25, endIntensity: 0.75 }, getMode()))}><WarmupLogo className="btn-icon" /> Warm up</Button>
        <Button onClick={() => addInterval(intervalFactory.ramp({ startIntensity: 0.75, endIntensity: 0.25 }, getMode()))}><WarmdownLogo className="btn-icon" /> Cool down</Button>
        <Button onClick={() => addInterval(intervalFactory.repetition({}, getMode()))}><IntervalLogo className="btn-icon" /> Interval</Button>
        {sportType === "bike" &&
          <IconButton label="Free Ride" icon={faBicycle} onClick={() => addInterval(intervalFactory.free({}, getMode()))} />
        }
        <IconButton label="Text Event" icon={faComment} onClick={() => addInstruction(createInstruction({}, getMode()))} />
        {sportType === "bike" &&
          <NumberField name="ftp" label={"FTP (W)"} value={ftp} onChange={setFtp} />
        }
        {sportType === "bike" &&
          <NumberField name="weight" label={"Body Weight (kg)"} value={weight} onChange={setWeight} />
        }
        <IconButton label="New" icon={faFile} onClick={() => { if (window.confirm('Are you sure you want to create a new workout?')) newWorkout() }} />
        <IconButton label="Save" icon={faSave} onClick={saveWorkout} />
        <IconButton label="Delete" icon={faTrash} onClick={() => { if (window.confirm('Are you sure you want to delete this workout?')) deleteWorkout() }} />
        <IconButton label="Download" icon={faDownload} onClick={downloadWorkout} />
        <UploadButton onUpload={handleUpload} />
        <IconButton label="Workouts" icon={faList} onClick={() => setShowWorkouts(true)} />
        <IconButton label="Share" icon={faShareAlt} onClick={shareWorkout} />
      </div>
      <Footer />
    </Keyboard>
  )
}

export default Editor