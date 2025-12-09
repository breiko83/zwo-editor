import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./Editor.css";
import { Zones } from "../Constants";
import Bar from "../Bar/Bar";
import Trapeze from "../Trapeze/Trapeze";
import FreeRide from "../FreeRide/FreeRide";
import Interval from "../Interval/Interval";
import Comment from "../Comment/Comment";
import EditComment from "../Comment/EditComment";
import Popup from "../Popup/Popup";
import Footer from "../Footer/Footer";
import Workouts from "../Workouts/Workouts";
import ToastMessage from "../ToastMessage/ToastMessage";
import helpers from "../helpers";
import { User as FirebaseUser } from "firebase/auth";
import SaveForm from "../Forms/SaveForm";
import SignupForm from "../Forms/SignupForm";
import LoginForm from "../Forms/LoginForm";
import ForgotPasswordForm from "../Forms/ForgotPasswordForm";
import UpdatePasswordForm from "../Forms/UpdatePasswordForm";
import { Helmet } from "react-helmet-async";
import { RouteComponentProps } from "react-router-dom";
import ReactGA from "react-ga";
import ShareForm from "../Forms/ShareForm";
import WorkoutMetadata from "./WorkoutMetadata";
import WorkoutCanvas from "./WorkoutCanvas";
import WorkoutSettings from "./WorkoutSettings";
import WorkoutToolbar from "./WorkoutToolbar";
import WorkoutTextEditor from "./WorkoutTextEditor";
import { workoutService } from "../../services/workoutService";
import { xmlService } from "../../services/xmlService";
import { textParserService } from "../../services/textParserService";
import { useWorkoutState } from "./hooks/useWorkoutState";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useFirebaseSync } from "./hooks/useFirebaseSync";
import { BarType, Instruction, SportType } from "../../types/workout";
import { Message } from "../../types/ui";
import Bugsnag from "@bugsnag/js";

type TParams = { id: string };

const Editor = ({ match }: RouteComponentProps<TParams>) => {
  const { v4: uuidv4 } = require("uuid");

  const S3_URL = "https://zwift-workout.s3-eu-west-1.amazonaws.com";

  const generateIdValue = match.params.id === "new"
    ? localStorage.getItem("id") || generateId()
    : match.params.id;

  // Use custom hook for workout state management
  const {
    id,
    setId,
    bars,
    setBars,
    actionId,
    setActionId,
    ftp,
    setFtp,
    weight,
    setWeight,
    instructions,
    setInstructions,
    tags,
    setTags,
    name,
    setName,
    description,
    setDescription,
    author,
    setAuthor,
    sportType,
    setSportType,
    durationType,
    setDurationType,
    paceUnitType,
    setPaceUnitType,
    runningTimes,
    setRunningTimes,
    selectedInstruction,
    setSelectedInstruction,
  } = useWorkoutState(generateIdValue);

  const [savePopupIsVisible, setSavePopupVisibility] = useState(false);
  const [sharePopupIsVisible, setSharePopupVisibility] = useState(false);

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [visibleForm, setVisibleForm] = useState("login"); // default form is login

  const canvasRef = useRef<HTMLInputElement>(null);
  const segmentsRef = useRef<HTMLInputElement>(null);
  const [segmentsWidth, setSegmentsWidth] = useState(1320);

  const [message, setMessage] = useState<Message>();

  const [showWorkouts, setShowWorkouts] = useState(false);
  const [textEditorIsVisible, setTextEditorIsVisible] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get("mode");
    if (mode === "resetPassword") {
      setVisibleForm("updatePassword");
      setSavePopupVisibility(true);
    }
  }, [location]);

  // Firebase sync hook
  const { saveWorkout: saveToFirebase, deleteWorkout: deleteFromFirebase, logout: logoutFromFirebase } = useFirebaseSync({
    id,
    setAuthor,
    setName,
    setDescription,
    setBars,
    setInstructions,
    setTags,
    setDurationType,
    setSportType,
    setMessage,
    setUser,
  });

  useEffect(() => {
    ReactGA.initialize("UA-55073449-9");
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []);

  // Update segments width when bars change
  useEffect(() => {
    setSegmentsWidth(segmentsRef.current?.scrollWidth || 1320);
  }, [bars]);

  function generateId() {
    return Math.random().toString(36).substr(2, 16);
  }

  function newWorkout() {
    console.log("New workout");

    setId(generateId());
    setBars([]);
    setInstructions([]);
    setName("");
    setDescription("");
    setAuthor("");
    setTags([]);
  }

  function handleOnChange(id: string, values: BarType) {
    const index = bars.findIndex((bar) => bar.id === id);

    const updatedArray = [...bars];
    updatedArray[index] = values;

    setBars(updatedArray);
  }

  function handleOnClick(id: string) {
    if (id === actionId) {
      setActionId(undefined);
    } else {
      setActionId(id);
    }
  }

  // Keyboard shortcuts hook
  useKeyboardShortcuts({
    actionId,
    removeBar,
    addTimeToBar,
    removeTimeToBar,
    addPowerToBar,
    removePowerToBar,
  });

  function addBar(
    zone: number = 1,
    duration: number = 300,
    cadence: number = 0,
    pace: number = 0,
    length: number = 200,
    incline: number = 0
  ) {
    const newBar = workoutService.createBar(
      zone,
      duration,
      cadence,
      pace,
      length,
      incline,
      durationType,
      uuidv4
    );
    setBars((bars) => [...bars, newBar]);
  }

  function addTrapeze(
    zone1: number,
    zone2: number,
    duration: number = 300,
    pace: number = 0,
    length: number = 1000,
    cadence: number = 0,
  ) {
    const newTrapeze = workoutService.createTrapeze(
      zone1,
      zone2,
      duration,
      pace,
      length,
      cadence,
      durationType,
      uuidv4
    );
    setBars((bars) => [...bars, newTrapeze]);
  }

  function addFreeRide(
    duration: number = 600,
    cadence: number = 0,
    length: number = 1000,
    incline: number = 0
  ) {
    const newFreeRide = workoutService.createFreeRide(
      duration,
      cadence,
      length,
      incline,
      durationType,
      uuidv4
    );
    setBars((bars) => [...bars, newFreeRide]);
  }

  function addInterval(
    repeat: number = 3,
    onDuration: number = 30,
    offDuration: number = 120,
    onPower: number = 1,
    offPower: number = 0.5,
    cadence: number = 0,
    restingCadence: number = 0,
    pace: number = 0,
    onLength: number = 200,
    offLength: number = 200
  ) {
    const newInterval = workoutService.createInterval(
      repeat,
      onDuration,
      offDuration,
      onPower,
      offPower,
      cadence,
      restingCadence,
      pace,
      onLength,
      offLength,
      durationType,
      uuidv4
    );
    setBars((bars) => [...bars, newInterval]);
  }

  function addInstruction(text = "", time = 0, length = 0) {
    const id = uuidv4();
    setInstructions((instructions) => [
      ...instructions,
      {
        text: text,
        time: time,
        length: length,
        id: id,
      },
    ]);
    // open instruction editor
    setSelectedInstruction({ text: text, time: time, length: length, id: id });
  }

  function changeInstruction(id: string, values: Instruction) {
    const index = instructions.findIndex(
      (instructions) => instructions.id === id
    );

    const updatedArray = [...instructions];
    updatedArray[index] = values;
    setInstructions(updatedArray);
  }

  function deleteInstruction(id: string) {
    const updatedArray = [...instructions];
    setInstructions(updatedArray.filter((item) => item.id !== id));
  }

  function removeBar(id: string) {
    const updatedArray = [...bars];
    setBars(updatedArray.filter((item) => item.id !== id));
    setActionId(undefined);
  }

  function addTimeToBar(id: string) {
    const updatedArray = [...bars];

    const index = updatedArray.findIndex((bar) => bar.id === id);
    const element = updatedArray[index];
    if (element && durationType === "time") {
      element.time = element.time + 5;
      element.length =
        (helpers.calculateDistance(
          element.time,
          calculateSpeed(element.pace || 0)
        ) *
          1) /
        (element.power || 1);
      setBars(updatedArray);
    }

    if (element && durationType === "distance") {
      element.length = (element.length || 0) + 200;
      element.time =
        (helpers.calculateTime(
          element.length,
          calculateSpeed(element.pace || 0)
        ) *
          1) /
        (element.power || 1);
      setBars(updatedArray);
    }
  }

  function removeTimeToBar(id: string) {
    const updatedArray = [...bars];

    const index = updatedArray.findIndex((bar) => bar.id === id);
    const element = updatedArray[index];
    if (element && element.time > 5 && durationType === "time") {
      element.time = element.time - 5;
      element.length =
        (helpers.calculateDistance(
          element.time,
          calculateSpeed(element.pace || 0)
        ) *
          1) /
        (element.power || 1);
      setBars(updatedArray);
    }

    if (element && (element.length || 0) > 200 && durationType === "distance") {
      element.length = (element.length || 0) - 200;
      element.time =
        (helpers.calculateTime(
          element.length,
          calculateSpeed(element.pace || 0)
        ) *
          1) /
        (element.power || 1);
      setBars(updatedArray);
    }
  }

  function addPowerToBar(id: string) {
    const updatedArray = [...bars];

    const index = updatedArray.findIndex((bar) => bar.id === id);
    const element = updatedArray[index];
    if (element && element.power) {
      element.power = parseFloat((element.power + 1 / ftp).toFixed(3));

      if (durationType === "time") {
        element.length =
          (helpers.calculateDistance(
            element.time,
            calculateSpeed(element.pace || 0)
          ) *
            1) /
          element.power;
      } else {
        element.time =
          (helpers.calculateTime(
            element.length || 0,
            calculateSpeed(element.pace || 0)
          ) *
            1) /
          element.power;
      }

      setBars(updatedArray);
    }
  }

  function removePowerToBar(id: string) {
    const updatedArray = [...bars];

    const index = updatedArray.findIndex((bar) => bar.id === id);
    const element = updatedArray[index];
    if (element && element.power && element.power >= Zones.Z1.min) {
      element.power = parseFloat((element.power - 1 / ftp).toFixed(3));

      if (durationType === "time") {
        element.length =
          (helpers.calculateDistance(
            element.time,
            calculateSpeed(element.pace || 0)
          ) *
            1) /
          element.power;
      } else {
        element.time =
          (helpers.calculateTime(
            element.length || 0,
            calculateSpeed(element.pace || 0)
          ) *
            1) /
          element.power;
      }

      setBars(updatedArray);
    }
  }

  function duplicateBar(id: string) {
    const index = bars.findIndex((bar) => bar.id === id);
    const element = [...bars][index];

    workoutService.duplicateBar(element, {
      addBar,
      addFreeRide,
      addTrapeze,
      addInterval,
    });

    setActionId(undefined);
  }

  function moveLeft(id: string) {
    const updatedBars = workoutService.moveLeft(bars, id);
    setBars(updatedBars);
  }

  function moveRight(id: string) {
    const updatedBars = workoutService.moveRight(bars, id);
    setBars(updatedBars);
  }

  function saveWorkout() {
    setSavePopupVisibility(true);
  }

  function deleteWorkout() {
    // delete from cloud (firebase) if logged in
    if (user) {
      deleteFromFirebase(user, newWorkout);
    }
  }

  function shareWorkout() {
    if (user) {
      save();
      setSharePopupVisibility(true);
    } else {
      saveWorkout();
    }
  }

  async function save() {
    const xml = xmlService.createWorkoutXml({
      author,
      name,
      description,
      sportType,
      durationType,
      tags,
      bars,
      instructions,
    });

    const file = new Blob([xml], { type: "application/xml" });

    // save to cloud (firebase) if logged in
    if (user) {
      await saveToFirebase(
        user,
        author,
        name,
        description,
        sportType,
        durationType,
        tags,
        bars,
        instructions
      );
      // upload to S3
      upload(file, false);
    }

    return file;
  }

  function logout() {
    logoutFromFirebase();
  }

  function downloadWorkout() {
    const xml = xmlService.createWorkoutXml({
      author,
      name,
      description,
      sportType,
      durationType,
      tags,
      bars,
      instructions,
    });

    xmlService.downloadWorkout(xml, id);
  }

  function handleUpload(file: Blob) {
    // ask user if they want to overwrite current workout first
    if (bars.length > 0) {
      if (!window.confirm("Are you sure you want to create a new workout?")) {
        return false;
      }
    }

    newWorkout();
    upload(file, true);
  }

  function upload(file: Blob, parse = false) {
    fetch(
      process.env.REACT_APP_UPLOAD_FUNCTION ||
        "https://zwiftworkout.netlify.app/.netlify/functions/upload",
      {
        method: "POST",
        body: JSON.stringify({
          fileType: "zwo",
          fileName: `${id}.zwo`,
        }),
      }
    )
      .then((res) => res.json())
      .then(function (data) {
        const signedUrl = data.uploadURL;

        // upload to S3
        fetch(signedUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "zwo",
          },
          body: file,
        })
          .then((response) => response.text())
          .then((data) => {
            // can parse now
            if (parse) fetchAndParse(id);
          })
          .catch((error) => {
            Bugsnag.notify(error);
            console.error(error);
          });
      });
  }

  function fetchAndParse(id: string) {
    // remove previous workout
    setBars([]);
    setInstructions([]);

    fetch(`${S3_URL}/${id}.zwo`)
      .then((response) => response.text())
      .then((data) => {
        // Create a File object from the text data
        const file = new File([data], `${id}.zwo`, { type: 'text/xml' });

        // Use xmlService to parse the workout
        return xmlService.parseWorkoutXml(file, uuidv4);
      })
      .then((parsedWorkout) => {
        // Set workout metadata
        setName(parsedWorkout.name);
        setDescription(parsedWorkout.description);
        setAuthor(parsedWorkout.author);
        setSportType(parsedWorkout.sportType);
        setDurationType(parsedWorkout.durationType);
        setTags(parsedWorkout.tags);

        // Set workout bars and instructions
        setBars(parsedWorkout.bars);
        setInstructions(parsedWorkout.instructions);
      })
      .catch((error) => {
        Bugsnag.notify(error);
        console.error(error);
        setMessage({ visible: true, class: 'error', text: 'Invalid workout file format' });
      });
  }

  function calculateSpeed(pace: number = 0) {
    if (sportType === "bike") {
      return 0;
    } else {
      // return speed in m/s
      // speed  = distance / time
      const distances = [1.60934, 5, 10, 21.0975, 42.195];
      const times = [
        runningTimes.oneMile,
        runningTimes.fiveKm,
        runningTimes.tenKm,
        runningTimes.halfMarathon,
        runningTimes.marathon,
      ];

      return (distances[pace] * 1000) / helpers.getTimeinSeconds(times[pace]);
    }
  }

  const renderBar = (bar: BarType) => (
    <Bar
      id={bar.id}
      time={bar.time}
      length={bar.length || 200}
      power={bar.power || 100}
      cadence={bar.cadence}
      ftp={ftp}
      weight={weight}
      sportType={sportType}
      durationType={durationType}
      paceUnitType={paceUnitType}
      pace={bar.pace || 0}
      speed={calculateSpeed(bar.pace || 0)}
      onChange={(id: string, value: BarType) => handleOnChange(id, value)}
      onClick={(id: string) => handleOnClick(id)}
      selected={bar.id === actionId}
      showLabel={true}
      incline={bar.incline}
    />
  );

  const renderTrapeze = (bar: BarType) => (
    <Trapeze
      id={bar.id}
      time={bar.time}
      length={bar.length || 200}
      cadence={bar.cadence}
      startPower={bar.startPower || 80}
      endPower={bar.endPower || 160}
      ftp={ftp}
      sportType={sportType}
      durationType={durationType}
      paceUnitType={paceUnitType}
      pace={bar.pace || 0}
      speed={calculateSpeed(bar.pace || 0)}
      onChange={(id: string, value: BarType) => handleOnChange(id, value)}
      onClick={(id: string) => handleOnClick(id)}
      selected={bar.id === actionId}
    />
  );

  const renderFreeRide = (bar: BarType) => (
    <FreeRide
      id={bar.id}
      time={bar.time}
      length={bar.length}
      cadence={bar.cadence}
      incline={bar.incline || 0}
      durationType={durationType}
      sportType={sportType}
      onChange={(id: string, value: BarType) => handleOnChange(id, value)}
      onClick={(id: string) => handleOnClick(id)}
      selected={bar.id === actionId}
    />
  );

  const renderInterval = (bar: BarType) => (
    <Interval
      id={bar.id}
      repeat={bar.repeat || 3}
      onDuration={bar.onDuration || 10}
      offDuration={bar.offDuration || 50}
      onPower={bar.onPower || 250}
      offPower={bar.offPower || 120}
      onLength={bar.onLength || 200}
      offLength={bar.offLength || 200}
      cadence={bar.cadence}
      restingCadence={bar.restingCadence || 0}
      ftp={ftp}
      weight={weight}
      sportType={sportType}
      durationType={durationType}
      pace={bar.pace || 0}
      speed={calculateSpeed(bar.pace || 0)}
      handleIntervalChange={(id: string, value: BarType) =>
        handleOnChange(id, value)
      }
      handleIntervalClick={(id: string) => handleOnClick(id)}
      selected={bar.id === actionId}
    />
  );

  const renderComment = (instruction: Instruction, index: number) => (
    <Comment
      instruction={instruction}
      durationType={durationType}
      width={
        durationType === "distance"
          ? helpers.getWorkoutDistance(bars) * 100
          : helpers.getWorkoutLength(bars, durationType) / 3
      }
      onChange={(id: string, values: Instruction) =>
        changeInstruction(id, values)
      }
      onClick={(id: string) =>
        setSelectedInstruction(instructions.find((i) => i.id === id))
      }
      index={index}
    />
  );

  const renderRegistrationForm = () => {
    switch (visibleForm) {
      case "login":
        return (
          <LoginForm
            login={setUser}
            showSignup={() => setVisibleForm("signup")}
            dismiss={() => setSavePopupVisibility(false)}
            showForgotPassword={() => setVisibleForm("forgotPassword")}
          />
        );
      case "signup":
        return (
          <SignupForm
            signUp={setUser}
            showLogin={() => setVisibleForm("login")}
            dismiss={() => setSavePopupVisibility(false)}
          />
        );
      case "forgotPassword":
        return (
          <ForgotPasswordForm
            dismiss={() => setSavePopupVisibility(false)}
            workoutId={id}
          />
        );
      case "updatePassword":
        return (
          <UpdatePasswordForm
            dismiss={() => {
              setVisibleForm("login");
              setSavePopupVisibility(true);
            }}
          />
        );
      default:
        break;
    }
  };

  function setPace(value: string, id: string) {
    const index = bars.findIndex((bar) => bar.id === id);

    if (index !== -1) {
      const updatedArray = [...bars];
      const element = [...updatedArray][index];
      element.pace = parseInt(value);

      if (durationType === "time") {
        element.length =
          (helpers.calculateDistance(
            element.time,
            calculateSpeed(element.pace || 0)
          ) *
            1) /
          (element.power || 1);
      } else {
        element.time =
          (helpers.calculateTime(
            element.length || 0,
            calculateSpeed(element.pace || 0)
          ) *
            1) /
          (element.power || 1);
      }

      setBars(updatedArray);
    }
  }

  function getPace(id: string): number {
    const index = bars.findIndex((bar) => bar.id === id);

    if (index !== -1) {
      const element = [...bars][index];
      return element.pace || 0;
    }
    return 0;
  }

  function switchSportType(newSportType: SportType) {
    setSportType(newSportType);
    setDurationType(newSportType === "bike" ? "time" : "distance");
  }

  function toggleTextEditor() {
    if (bars.length > 0 && !textEditorIsVisible) {
      if (
        window.confirm(
          "Editing a workout from the text editor will overwrite current workout"
        )
      )
        setTextEditorIsVisible(!textEditorIsVisible);
    } else {
      setTextEditorIsVisible(!textEditorIsVisible);
    }
  }

  function transformTextToWorkout(textValue: string) {
    // reset each time
    setBars([]);
    setInstructions([]);

    // Use textParserService to parse workout text
    const parsedBlocks = textParserService.parseWorkoutText(
      textValue,
      ftp,
      weight
    );

    // Process parsed blocks and add them to workout
    parsedBlocks.forEach((block) => {
      switch (block.type) {
        case 'message':
          if (block.text !== undefined && block.duration !== undefined) {
            addInstruction(block.text, block.duration);
          }
          break;
        case 'steady':
          if (block.power !== undefined && block.duration !== undefined) {
            addBar(block.power, block.duration, block.cadence);
          }
          break;
        case 'ramp':
        case 'warmup':
        case 'cooldown':
          if (
            block.startPower !== undefined &&
            block.endPower !== undefined &&
            block.duration !== undefined
          ) {
            addTrapeze(
              block.startPower,
              block.endPower,
              block.duration,
              undefined,
              undefined,
              block.cadence
            );
          }
          break;
        case 'freeride':
          if (block.duration !== undefined) {
            addFreeRide(block.duration, block.cadence);
          }
          break;
        case 'interval':
          if (
            block.repeat !== undefined &&
            block.duration !== undefined &&
            block.offDuration !== undefined &&
            block.startPower !== undefined &&
            block.endPower !== undefined
          ) {
            addInterval(
              block.repeat,
              block.duration,
              block.offDuration,
              block.startPower,
              block.endPower,
              block.cadence,
              block.restingCadence
            );
          }
          break;
      }
    });
  }

  return (
    // Adding tabIndex allows div element to receive keyboard events
    <div className="container" tabIndex={0}>
      <Helmet>
        <title>
          {name
            ? `${name} - Zwift Workout Editor`
            : "My Workout - Zwift Workout Editor"}
        </title>
        <meta name="description" content={description} />
        <meta
          property="og:title"
          content={
            name
              ? `${name} - Zwift Workout Editor`
              : "My Workout - Zwift Workout Editor"
          }
        />
        <meta property="og:description" content={description} />
        <link
          rel="canonical"
          href={`https://www.zwiftworkout.com/editor/${id}`}
        />
        <meta
          property="og:url"
          content={`https://www.zwiftworkout.com/editor/${id}`}
        />
      </Helmet>

      <ToastMessage
        message={message}
        onDismiss={() => setMessage({ visible: false })}
      />

      {showWorkouts && (
        <Popup width="500px" dismiss={() => setShowWorkouts(false)}>
          {user ? <Workouts userId={user.uid} /> : renderRegistrationForm()}
        </Popup>
      )}

      {selectedInstruction && (
        <EditComment
          instruction={selectedInstruction}
          onChange={(id: string, values: Instruction) => {
            changeInstruction(id, values);
            setSelectedInstruction(undefined);
          }}
          dismiss={() => setSelectedInstruction(undefined)}
          onDelete={(id: string) => {
            deleteInstruction(id);
            setSelectedInstruction(undefined);
          }}
        />
      )}

      {savePopupIsVisible && (
        <Popup width="500px" dismiss={() => setSavePopupVisibility(false)}>
          {user ? (
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
                save();
                setSavePopupVisibility(false);
              }}
              onDismiss={() => setSavePopupVisibility(false)}
              onLogout={logout}
            />
          ) : (
            renderRegistrationForm()
          )}
        </Popup>
      )}
      {sharePopupIsVisible && (
        <Popup width="500px" dismiss={() => setSharePopupVisibility(false)}>
          <ShareForm id={id} onDismiss={() => setSharePopupVisibility(false)} />
        </Popup>
      )}
      <WorkoutMetadata
        name={name}
        description={description}
        author={author}
        bars={bars}
        sportType={sportType}
        durationType={durationType}
        paceUnitType={paceUnitType}
        ftp={ftp}
        setDurationType={setDurationType}
        setPaceUnitType={setPaceUnitType}
        setSportType={switchSportType}
      />
      <WorkoutSettings
        sportType={sportType}
        ftp={ftp}
        setFtp={setFtp}
        weight={weight}
        setWeight={setWeight}
        runningTimes={runningTimes}
        setRunningTimes={setRunningTimes}
      />
      {textEditorIsVisible && sportType === "bike" && (
        <WorkoutTextEditor onChange={transformTextToWorkout} />
      )}
      <WorkoutCanvas
        bars={bars}
        instructions={instructions}
        actionId={actionId}
        sportType={sportType}
        durationType={durationType}
        segmentsWidth={segmentsWidth}
        canvasRef={canvasRef}
        segmentsRef={segmentsRef}
        textEditorIsVisible={textEditorIsVisible}
        setActionId={setActionId}
        moveLeft={moveLeft}
        moveRight={moveRight}
        removeBar={removeBar}
        duplicateBar={duplicateBar}
        getPace={getPace}
        setPace={setPace}
        addBar={addBar}
        toggleTextEditor={toggleTextEditor}
        addTrapeze={addTrapeze}
        addInterval={addInterval}
        addFreeRide={addFreeRide}
        addInstruction={addInstruction}
        renderBar={renderBar}
        renderTrapeze={renderTrapeze}
        renderFreeRide={renderFreeRide}
        renderInterval={renderInterval}
        renderComment={renderComment}
      />
      <div className="cta">
        <WorkoutToolbar
          onNew={newWorkout}
          onSave={saveWorkout}
          onDelete={deleteWorkout}
          onDownload={downloadWorkout}
          onUpload={handleUpload}
          onShare={shareWorkout}
          onWorkouts={() => setShowWorkouts(true)}
        />
      </div>
      <Footer />
    </div>
  );
};

export default Editor;
