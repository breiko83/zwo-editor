import React, { useState, useEffect, useRef } from 'react'
import './Editor.css'
import { Colors, Zones } from '../Constants'
import Bar from '../Bar/Bar'
import Trapeze from '../Trapeze/Trapeze'
import FreeRide from '../FreeRide/FreeRide'
import Repetition from '../Repetition/Repetition'
import Comment from '../Comment/Comment'
import Popup from '../Popup/Popup'
import Footer from '../Footer/Footer'
import Workouts from '../Workouts/Workouts'
import TimeAxis from '../Axis/TimeAxis'
import DistanceAxis from '../Axis/DistanceAxis'
import ZoneAxis from '../Axis/ZoneAxis'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faArrowRight, faArrowLeft, faFile, faSave, faUpload, faDownload, faComment, faBicycle, faCopy, faClock, faShareAlt, faTimesCircle, faList, faBiking, faRunning, faRuler } from '@fortawesome/free-solid-svg-icons'
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
import { Helmet } from "react-helmet";
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
export type DurationType = "time" | "distance";

const Editor = ({ match }: RouteComponentProps<TParams>) => {

  const { v4: uuidv4 } = require('uuid');

  const S3_URL = 'https://zwift-workout.s3-eu-west-1.amazonaws.com'

  const [id, setId] = useState(match.params.id === "new" ? (localStorage.getItem('id') || generateId()) : match.params.id)
  const [intervals, setIntervals] = useState<Array<Interval>>(JSON.parse(localStorage.getItem('currentWorkout') || '[]'))
  const [actionId, setActionId] = useState<string | undefined>(undefined)
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

  // distance or time
  const [durationType, setDurationType] = useState<DurationType>(localStorage.getItem('durationType') as DurationType || 'time')

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
        setDurationType(snapshot.val().durationType)
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
    localStorage.setItem('durationType', durationType)

    localStorage.setItem('runningTimes', JSON.stringify(runningTimes))

    setSegmentsWidth(segmentsRef.current?.scrollWidth || 1320)    

  }, [segmentsRef, intervals, ftp, instructions, weight, name, description, author, tags, sportType, durationType, runningTimes])

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

  function handleOnChange(id: string, values: Interval) {
    const index = intervals.findIndex(interval => interval.id === id)

    const updatedArray = [...intervals]
    updatedArray[index] = values

    setIntervals(updatedArray)

  }

  function handleOnClick(id: string) {

    if (id === actionId) {
      setActionId(undefined)
    } else {
      setActionId(id)
    }
  }

  function handleKeyPress(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.target instanceof HTMLInputElement) {
      // Ignore key presses coming from input elements
      return;
    }

    switch (event.keyCode) {
      case 8:
        removeBar(actionId || '')
        // Prevent navigation to previous page
        event.preventDefault()
        break;
      case 37:
        // reduce time
        removeTimeToBar(actionId || '')
        break;
      case 39:
        // add time
        addTimeToBar(actionId || '')
        break;
      case 38:
        // add power
        addPowerToBar(actionId || '')
        break;
      case 40:
        // add power
        removePowerToBar(actionId || '')
        break;
      default:
        //console.log(event.keyCode);        
        break;
    }
  }

  function addBar(zone: number, duration: number = 300, cadence: number = 0, pace: PaceType = PaceType.oneMile, length: number = 200) {
    const interval: SteadyInterval = {
      time: durationType === 'time' ? duration : helpers.round(helpers.calculateTime(length, runningSpeed(pace)), 1),
      length: durationType === 'time' ? helpers.round(helpers.calculateDistance(duration, runningSpeed(pace)), 1) : length,
      power: zone,
      cadence: cadence,
      type: 'steady',
      id: uuidv4(),
      pace: pace
    };
    setIntervals(intervals => [...intervals, interval])
  }

  function addTrapeze(zone1: number, zone2: number, duration: number = 300, pace: PaceType = PaceType.oneMile, length: number = 1000, cadence: number = 0) {
    const interval: RampInterval = {
      time: durationType === 'time' ? duration : helpers.round(helpers.calculateTime(length, runningSpeed(pace)), 1),
      length: durationType === 'time' ? helpers.round(helpers.calculateDistance(duration, runningSpeed(pace)), 1) : length,
      startPower: zone1,
      endPower: zone2,
      cadence: cadence,
      pace: pace,
      type: 'ramp',
      id: uuidv4()
    };
    setIntervals(intervals => [...intervals, interval])
  }

  function addFreeRide(duration = 600, cadence: number = 0) {
    const interval: FreeInterval = {
      time: duration,
      cadence: cadence,
      type: 'free',
      id: uuidv4()
    };
    setIntervals(intervals => [...intervals, interval])
  }

  function addInterval(repeat: number = 3, onDuration: number = 30, offDuration: number = 120, onPower: number = 1, offPower: number = 0.5, cadence: number = 0, restingCadence: number = 0, pace: PaceType = PaceType.oneMile, onLength: number = 200, offLength: number = 200) {
    const interval: RepetitionInterval = {
      time: durationType === 'time' ? (onDuration + offDuration) * repeat : helpers.round(helpers.calculateTime((onLength + offLength) * repeat, runningSpeed(pace)), 1),
      length: durationType === 'time' ? helpers.round(helpers.calculateDistance((onDuration + offDuration) * repeat, runningSpeed(pace)), 1) : (onLength + offLength) * repeat,
      id: uuidv4(),
      type: 'repetition',
      cadence: cadence,
      restingCadence: restingCadence,
      repeat: repeat,
      onDuration: durationType === 'time' ? onDuration : helpers.round(helpers.calculateTime(onLength / onPower, runningSpeed(pace)), 1),
      offDuration: durationType === 'time' ? offDuration : helpers.round(helpers.calculateTime(offLength / offPower, runningSpeed(pace)), 1),
      onPower: onPower,
      offPower: offPower,
      pace: pace,
      onLength: durationType === 'time' ? helpers.round(helpers.calculateDistance(onDuration / onPower, runningSpeed(pace)), 1) : onLength,
      offLength: durationType === 'time' ? helpers.round(helpers.calculateDistance(offDuration / offPower, runningSpeed(pace)), 1) : offLength,
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
    const updatedArray = [...instructions]
    setInstructions(updatedArray.filter(item => item.id !== id))
  }

  function removeBar(id: string) {
    const updatedArray = [...intervals]
    setIntervals(updatedArray.filter(item => item.id !== id))
    setActionId(undefined)
  }

  function addTimeToBar(id: string) {
    const updatedArray = [...intervals]

    const index = updatedArray.findIndex(interval => interval.id === id)
    const element = updatedArray[index]
    if (element && element.type === 'steady' && durationType === 'time') {
      element.time = element.time + 5
      element.length = helpers.calculateDistance(element.time, runningSpeed(element.pace)) / (element.power || 1)
      setIntervals(updatedArray)
    }

    if (element && element.type === 'steady' && durationType === 'distance') {
      element.length = (element.length || 0) + 200
      element.time = helpers.calculateTime(element.length, runningSpeed(element.pace)) / (element.power || 1)
      setIntervals(updatedArray)
    }
  }

  function removeTimeToBar(id: string) {
    const updatedArray = [...intervals]

    const index = updatedArray.findIndex(interval => interval.id === id)
    const element = updatedArray[index]
    if (element && element.type === 'steady' && element.time > 5 && durationType === 'time') {
      element.time = element.time - 5
      element.length = helpers.calculateDistance(element.time, runningSpeed(element.pace)) / (element.power || 1)
      setIntervals(updatedArray)
    }

    if (element && element.type === 'steady' && (element.length || 0) > 200 && durationType === 'distance') {
      element.length = (element.length || 0) - 200
      element.time = helpers.calculateTime(element.length, runningSpeed(element.pace)) / (element.power || 1)
      setIntervals(updatedArray)
    }
  }

  function addPowerToBar(id: string) {
    const updatedArray = [...intervals]

    const index = updatedArray.findIndex(interval => interval.id === id)
    const element = updatedArray[index]
    if (element && element.type === 'steady' && element.power) {
      element.power = parseFloat((element.power + 1 / ftp).toFixed(3))

      if (durationType === 'time') {
        element.length = helpers.calculateDistance(element.time, runningSpeed(element.pace)) / element.power
      } else {
        element.time = helpers.calculateTime(element.length || 0, runningSpeed(element.pace)) / element.power
      }

      setIntervals(updatedArray)
    }
  }

  function removePowerToBar(id: string) {
    const updatedArray = [...intervals]

    const index = updatedArray.findIndex(interval => interval.id === id)
    const element = updatedArray[index]
    if (element && element.type === 'steady' && element.power >= Zones.Z1.min) {
      element.power = parseFloat((element.power - 1 / ftp).toFixed(3))

      if (durationType === 'time') {
        element.length = helpers.calculateDistance(element.time, runningSpeed(element.pace)) / element.power
      } else {
        element.time = helpers.calculateTime(element.length || 0, runningSpeed(element.pace)) / element.power
      }

      setIntervals(updatedArray)
    }
  }

  function duplicateBar(id: string) {
    const index = intervals.findIndex(interval => interval.id === id)
    const element = [...intervals][index]

    if (element.type === 'steady') addBar(element.power || 80, element.time, element.cadence, element.pace, element.length)
    if (element.type === 'free') addFreeRide(element.time, element.cadence)
    if (element.type === 'ramp') addTrapeze(element.startPower || 80, element.endPower || 160, element.time, element.pace || 0, element.length, element.cadence)
    if (element.type === 'repetition') addInterval(element.repeat, element.onDuration, element.offDuration, element.onPower, element.offPower, element.cadence, element.restingCadence, element.pace, element.onLength, element.offLength)

    setActionId(undefined)
  }

  function moveLeft(id: string) {
    const index = intervals.findIndex(interval => interval.id === id)
    // not first position of array
    if (index > 0) {
      const updatedArray = [...intervals]
      const element = [...intervals][index]
      updatedArray.splice(index, 1)
      updatedArray.splice(index - 1, 0, element)
      setIntervals(updatedArray)
    }
  }

  function moveRight(id: string) {
    const index = intervals.findIndex(interval => interval.id === id)
    // not first position of array
    if (index < intervals.length - 1) {
      const updatedArray = [...intervals]
      const element = [...intervals][index]
      updatedArray.splice(index, 1)
      updatedArray.splice(index + 1, 0, element)
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
      durationType,
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
        durationType: durationType
      }

      const item2 = {
        name: name,
        description: description,
        updatedAt: Date(),
        sportType: sportType,
        durationType: durationType,
        workoutTime: helpers.formatDuration(helpers.getWorkoutLength(intervals, durationType)),
        workoutDistance: helpers.getWorkoutDistance(intervals)
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

    // remove previous workout

    // TODO fix for running distance based
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
              addBar(parseFloat(w.attributes.Power || w.attributes.PowerLow), parseFloat(w.attributes.Duration), parseFloat(w.attributes.Cadence || '0'), parseInt(w.attributes.Pace || '0'))

            if (w.name === 'Ramp' || w.name === 'Warmup' || w.name === 'Cooldown')
              addTrapeze(parseFloat(w.attributes.PowerLow), parseFloat(w.attributes.PowerHigh), parseFloat(w.attributes.Duration), parseInt(w.attributes.Pace || '0'), undefined, parseInt(w.attributes.Cadence))

            if (w.name === 'IntervalsT'){
              addInterval(parseFloat(w.attributes.Repeat), parseFloat(w.attributes.OnDuration), parseFloat(w.attributes.OffDuration), parseFloat(w.attributes.OnPower), parseFloat(w.attributes.OffPower), parseInt(w.attributes.Cadence || '0'), parseInt(w.attributes.CadenceResting), parseInt(w.attributes.Pace || '0'))
              duration = (parseFloat(w.attributes.OnDuration) + parseFloat(w.attributes.OffDuration)) * parseFloat(w.attributes.Repeat)
            }              

            if (w.name === 'free')
              addFreeRide(parseFloat(w.attributes.Duration), parseInt(w.attributes.Cadence))

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

  function runningSpeed(pace: PaceType = PaceType.oneMile) {
    if (sportType === "bike") {
      return 0;
    } else {
      // return speed in m/s
      // speed  = distance / time
      const distances = [1.60934, 5, 10, 21.0975, 42.195]
      const times = [runningTimes.oneMile, runningTimes.fiveKm, runningTimes.tenKm, runningTimes.halfMarathon, runningTimes.marathon]

      return distances[pace] * 1000 / helpers.getTimeinSeconds(times[pace])
    }
  }

  const renderInterval = (interval: Interval) => {
    switch (interval.type) {
      case 'steady':
        return (
          <Bar
            key={interval.id}
            interval={interval}
            ftp={ftp}
            weight={weight}
            sportType={sportType}
            durationType={durationType}
            speed={runningSpeed(interval.pace)}
            onChange={(id: string, value: any) => handleOnChange(id, value)} // Change any to Interface Interval?
            onClick={(id: string) => handleOnClick(id)}
            selected={interval.id === actionId}
            showLabel={true}
          />
        );
      case 'ramp':
        return (
          <Trapeze
            key={interval.id}
            interval={interval}
            ftp={ftp}
            sportType={sportType}
            durationType={durationType}
            speed={runningSpeed(interval.pace)}
            onChange={(id: string, value: any) => handleOnChange(id, value)} // Change any to Interface Interval?
            onClick={(id: string) => handleOnClick(id)}
            selected={interval.id === actionId}
          />
        );
      case 'free':
        return (
          <FreeRide
            key={interval.id}
            interval={interval}
            sportType={sportType}
            onChange={(id: string, value: any) => handleOnChange(id, value)} // Change any to Interface Interval?
            onClick={(id: string) => handleOnClick(id)}
            selected={interval.id === actionId}
          />
        );
      case 'repetition':
        return (
          <Repetition
            key={interval.id}
            id={interval.id}
            repeat={interval.repeat}
            onDuration={interval.onDuration}
            offDuration={interval.offDuration}
            onPower={interval.onPower}
            offPower={interval.offPower}
            onLength={interval.onLength}
            offLength={interval.offLength}
            cadence={interval.cadence}
            restingCadence={interval.restingCadence}
            ftp={ftp}
            weight={weight}
            sportType={sportType}
            durationType={durationType}
            pace={interval.pace}
            speed={runningSpeed(interval.pace)}
            handleIntervalChange={(id: string, value: any) => handleOnChange(id, value)}
            handleIntervalClick={(id: string) => handleOnClick(id)}
            selected={interval.id === actionId}
          />
        );
    }
  }

  const renderComment = (instruction: Instruction, index: number) => (
    <Comment
      key={instruction.id}
      instruction={instruction}
      durationType={durationType}
      width={durationType === "distance" ? parseInt(helpers.getWorkoutDistance(intervals))*100 : helpers.getWorkoutLength(intervals, durationType) / 3}
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
      const element = [...updatedArray][index]
      if (element.type !== 'steady') { // TODO: Only steady?
        return;
      }
      element.pace = pace

      if (durationType === 'time') {
        element.length = helpers.calculateDistance(element.time, runningSpeed(element.pace)) / (element.power || 1)
      } else {
        element.time = helpers.calculateTime(element.length || 0, runningSpeed(element.pace)) / (element.power || 1)
      }

      setIntervals(updatedArray)
    }
  }

  function getPace(id: string): PaceType | undefined {
    const index = intervals.findIndex(interval => interval.id === id)

    if (index !== -1) {
      const element = [...intervals][index]
      return element.type === 'free' ? undefined : element.pace
    }
  }

  function switchSportType(newSportType: SportType) {
    setSportType(newSportType);
    setDurationType(newSportType === "bike" ? "time" : "distance");
  }

  return (
    // Adding tabIndex allows div element to receive keyboard events
    <div className="container" onKeyDown={handleKeyPress} tabIndex={0}>
      <Helmet>
        <title>{name ? `${name} - Zwift Workout Editor` : "My Workout - Zwift Workout Editor"}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={name ? `${name} - Zwift Workout Editor` : "My Workout - Zwift Workout Editor"} />
        <meta property="og:description" content={description} />
        <link rel="canonical" href={`https://www.zwiftworkout.com/editor/${id}`} />
        <meta property="og:url" content={`https://www.zwiftworkout.com/editor/${id}`} />
      </Helmet>

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
            <input className="textInput" value={helpers.formatDuration(helpers.getWorkoutLength(intervals, durationType))} disabled />
          </div>
          {sportType === 'run' &&
            <div className="form-input">
              <label>Workout Distance</label>
              <input className="textInput" value={helpers.getWorkoutDistance(intervals)} disabled />
            </div>
          }
          <div className="form-input">
            <label>TSS</label>
            <input className="textInput" value={helpers.getStressScore(intervals, ftp)} disabled />
          </div>
          {sportType === 'run' &&
            <LeftRightToggle<"time","distance">
              label="Duration Type"
              leftValue="time"
              rightValue="distance"
              leftIcon={faClock}
              rightIcon={faRuler}
              selected={durationType}
              onChange={setDurationType}
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
        {actionId &&
          <div className='actions'>
            <button onClick={() => moveLeft(actionId)} title='Move Left'><FontAwesomeIcon icon={faArrowLeft} size="lg" fixedWidth /></button>
            <button onClick={() => moveRight(actionId)} title='Move Right'><FontAwesomeIcon icon={faArrowRight} size="lg" fixedWidth /></button>
            <button onClick={() => removeBar(actionId)} title='Delete'><FontAwesomeIcon icon={faTrash} size="lg" fixedWidth /></button>
            <button onClick={() => duplicateBar(actionId)} title='Duplicate'><FontAwesomeIcon icon={faCopy} size="lg" fixedWidth /></button>
            {sportType === "run" &&
              <PaceSelector value={getPace(actionId)} onChange={(pace) => setPace(pace, actionId)} />
            }
          </div>
        }
        <div className='canvas' ref={canvasRef}>          
          {actionId &&
            <div className='fader' style={{width: canvasRef.current?.scrollWidth}} onClick={() => setActionId(undefined)}></div>
          }
          <div className='segments' ref={segmentsRef}>
            {intervals.map(renderInterval)}
          </div>

          <div className='slider'>
            {instructions.map((instruction, index) => renderComment(instruction, index))}
          </div>

          {durationType === 'time' ? <TimeAxis width={segmentsWidth} /> : <DistanceAxis width={segmentsWidth} />}
        </div>        
        
        <ZoneAxis />
      </div>
      <div className='cta'>
        {sportType === "bike" ?
          <div>
            <button className="btn btn-square" onClick={() => addBar(0.5)} style={{ backgroundColor: Colors.GRAY }}>Z1</button>
            <button className="btn btn-square" onClick={() => addBar(Zones.Z2.min)} style={{ backgroundColor: Colors.BLUE }}>Z2</button>
            <button className="btn btn-square" onClick={() => addBar(Zones.Z3.min)} style={{ backgroundColor: Colors.GREEN }}>Z3</button>
            <button className="btn btn-square" onClick={() => addBar(Zones.Z4.min)} style={{ backgroundColor: Colors.YELLOW }}>Z4</button>
            <button className="btn btn-square" onClick={() => addBar(Zones.Z5.min)} style={{ backgroundColor: Colors.ORANGE }}>Z5</button>
            <button className="btn btn-square" onClick={() => addBar(Zones.Z6.min)} style={{ backgroundColor: Colors.RED }}>Z6</button>
          </div>
          :
          <button className="btn" onClick={() => addBar(1, 300, 0, 0, 1000)} style={{ backgroundColor: Colors.WHITE }}><SteadyLogo className="btn-icon" /> Steady Pace</button>
        }

        <button className="btn" onClick={() => addTrapeze(0.25, 0.75)} style={{ backgroundColor: Colors.WHITE }}><WarmupLogo className="btn-icon" /> Warm up</button>
        <button className="btn" onClick={() => addTrapeze(0.75, 0.25)} style={{ backgroundColor: Colors.WHITE }}><WarmdownLogo className="btn-icon" /> Cool down</button>
        <button className="btn" onClick={() => addInterval()} style={{ backgroundColor: Colors.WHITE }}><IntervalLogo className="btn-icon" /> Interval</button>
        {sportType === "bike" &&
          <button className="btn" onClick={() => addFreeRide()} style={{ backgroundColor: Colors.WHITE }}><FontAwesomeIcon icon={faBicycle} size="lg" fixedWidth /> Free Ride</button>
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