import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./Editor.css";
import { Colors, Zones } from "../Constants";
import Bar from "../Bar/Bar";
import Trapeze from "../Trapeze/Trapeze";
import FreeRide from "../FreeRide/FreeRide";
import Interval from "../Interval/Interval";
import Comment from "../Comment/Comment";
import EditComment from "../Comment/EditComment";
import Popup from "../Popup/Popup";
import Footer from "../Footer/Footer";
import Workouts from "../Workouts/Workouts";
import TimeAxis from "./TimeAxis";
import DistanceAxis from "./DistanceAxis";
import ZoneAxis from "./ZoneAxis";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faArrowRight,
  faArrowLeft,
  faFile,
  faSave,
  faUpload,
  faDownload,
  faComment,
  faBicycle,
  faCopy,
  faClock,
  faShareAlt,
  faTimesCircle,
  faList,
  faBiking,
  faRunning,
  faRuler,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import { ReactComponent as WarmdownLogo } from "../../assets/warmdown.svg";
import { ReactComponent as WarmupLogo } from "../../assets/warmup.svg";
import { ReactComponent as IntervalLogo } from "../../assets/interval.svg";
import { ReactComponent as SteadyLogo } from "../../assets/steady.svg";
import Converter from "xml-js";
import helpers from "../helpers";
import { firebaseApp } from "../firebase";
import { User as FirebaseUser } from "firebase/auth";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getDatabase, onValue, ref, update } from "firebase/database";
import SaveForm from "../Forms/SaveForm";
import SignupForm from "../Forms/SignupForm";
import LoginForm from "../Forms/LoginForm";
import ForgotPasswordForm from "../Forms/ForgotPasswordForm";
import UpdatePasswordForm from "../Forms/UpdatePasswordForm";
import { Helmet } from "react-helmet";
import { RouteComponentProps } from "react-router-dom";
import ReactGA from "react-ga";
import RunningTimesEditor, { RunningTimes } from "./RunningTimesEditor";
import LeftRightToggle from "./LeftRightToggle";
import createWorkoutXml from "./createWorkoutXml";
import ShareForm from "../Forms/ShareForm";
import ReactTooltip from "react-tooltip";

export interface BarType {
  id: string;
  time: number;
  length?: number;
  type: string;
  power?: number;
  startPower?: number;
  endPower?: number;
  cadence: number;
  restingCadence?: number;
  onPower?: number;
  offPower?: number;
  onDuration?: number;
  offDuration?: number;
  repeat?: number;
  pace?: number;
  onLength?: number;
  offLength?: number;
  incline?: number;
}

export interface Instruction {
  id: string;
  text: string;
  time: number;
  length: number;
}

interface Message {
  visible: boolean;
  class?: string;
  text?: string;
}

type TParams = { id: string };

const loadRunningTimes = (): RunningTimes => {
  const missingRunningTimes: RunningTimes = {
    oneMile: "",
    fiveKm: "",
    tenKm: "",
    halfMarathon: "",
    marathon: "",
  };
  const runningTimesJson = localStorage.getItem("runningTimes");
  if (runningTimesJson) {
    return JSON.parse(runningTimesJson);
  }

  // Fallback to old localStorage keys
  const oneMile = localStorage.getItem("oneMileTime") || "";
  const fiveKm = localStorage.getItem("fiveKmTime") || "";
  const tenKm = localStorage.getItem("tenKmTime") || "";
  const halfMarathon = localStorage.getItem("halfMarathonTime") || "";
  const marathon = localStorage.getItem("marathonTime") || "";
  if (oneMile || fiveKm || tenKm || halfMarathon || marathon) {
    return { oneMile, fiveKm, tenKm, halfMarathon, marathon };
  }

  return missingRunningTimes;
};
export type SportType = "bike" | "run";
export type DurationType = "time" | "distance";
export type PaceUnitType = "metric" | "imperial";

const Editor = ({ match }: RouteComponentProps<TParams>) => {
  const auth = getAuth(firebaseApp);
  const { v4: uuidv4 } = require("uuid");

  const S3_URL = "https://zwift-workout.s3-eu-west-1.amazonaws.com";

  const [id, setId] = useState(
    match.params.id === "new"
      ? localStorage.getItem("id") || generateId()
      : match.params.id
  );
  const [bars, setBars] = useState<Array<BarType>>(
    JSON.parse(localStorage.getItem("currentWorkout") || "[]")
  );
  const [actionId, setActionId] = useState<string | undefined>(undefined);
  const [ftp, setFtp] = useState(
    parseInt(localStorage.getItem("ftp") || "200")
  );
  const [weight, setWeight] = useState(
    parseInt(localStorage.getItem("weight") || "75")
  );
  const [instructions, setInstructions] = useState<Array<Instruction>>(
    JSON.parse(localStorage.getItem("instructions") || "[]")
  );
  const [tags, setTags] = useState(
    JSON.parse(localStorage.getItem("tags") || "[]")
  );

  const [name, setName] = useState(localStorage.getItem("name") || "");
  const [description, setDescription] = useState(
    localStorage.getItem("description") || ""
  );
  const [author, setAuthor] = useState(localStorage.getItem("author") || "");

  const [savePopupIsVisible, setSavePopupVisibility] = useState(false);
  const [sharePopupIsVisible, setSharePopupVisibility] = useState(false);

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [visibleForm, setVisibleForm] = useState("login"); // default form is login

  const canvasRef = useRef<HTMLInputElement>(null);
  const segmentsRef = useRef<HTMLInputElement>(null);
  const [segmentsWidth, setSegmentsWidth] = useState(1320);

  const [message, setMessage] = useState<Message>();

  const [showWorkouts, setShowWorkouts] = useState(false);

  // bike or run
  const [sportType, setSportType] = useState<SportType>(
    (localStorage.getItem("sportType") as SportType) || "bike"
  );

  // distance or time
  const [durationType, setDurationType] = useState<DurationType>(
    (localStorage.getItem("durationType") as DurationType) || "time"
  );

  // min / km or min / mi
  const [paceUnitType, setPaceUnitType] = useState<PaceUnitType>(
    (localStorage.getItem("paceUnitType") as PaceUnitType) || "metric"
  );

  const [runningTimes, setRunningTimes] = useState(loadRunningTimes());

  const [textEditorIsVisible, setTextEditorIsVisible] = useState(false);
  const [selectedInstruction, setSelectedInstruction] = useState<Instruction>();

  const db = getDatabase(firebaseApp);

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get("mode");
    if (mode === "resetPassword") {
      setVisibleForm("updatePassword");
      setSavePopupVisibility(true);
    }
  }, [location]);

  useEffect(() => {
    setMessage({ visible: true, class: "loading", text: "Loading.." });

    const starCountRef = ref(db, "workouts/" + id);
    onValue(starCountRef, (snapshot) => {
      if (snapshot.val()) {
        // workout exist on server
        setAuthor(snapshot.val().author);
        setName(snapshot.val().name);
        setDescription(snapshot.val().description);
        setBars(snapshot.val().workout || []);
        setInstructions(snapshot.val().instructions || []);
        setTags(snapshot.val().tags || []);
        setDurationType(snapshot.val().durationType);
        setSportType(snapshot.val().sportType);

        localStorage.setItem("id", id);
      } else {
        // workout doesn't exist on cloud
        if (id === localStorage.getItem("id")) {
          // user refreshed the page
        } else {
          // treat this as new workout
          setBars([]);
          setInstructions([]);
          setName("");
          setDescription("");
          setAuthor("");
          setTags([]);
        }

        localStorage.setItem("id", id);
      }
      //finished loading
      setMessage({ visible: false });
    });

    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      }
    });

    window.history.replaceState("", "", `/editor/${id}`);

    ReactGA.initialize("UA-55073449-9");
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, [id, db, auth]);

  useEffect(() => {
    localStorage.setItem("currentWorkout", JSON.stringify(bars));
    localStorage.setItem("ftp", ftp.toString());

    localStorage.setItem("instructions", JSON.stringify(instructions));
    localStorage.setItem("weight", weight.toString());

    localStorage.setItem("name", name);
    localStorage.setItem("description", description);
    localStorage.setItem("author", author);
    localStorage.setItem("tags", JSON.stringify(tags));
    localStorage.setItem("sportType", sportType);
    localStorage.setItem("durationType", durationType);
    localStorage.setItem("paceUnitType", paceUnitType);

    localStorage.setItem("runningTimes", JSON.stringify(runningTimes));

    setSegmentsWidth(segmentsRef.current?.scrollWidth || 1320);
  }, [
    segmentsRef,
    bars,
    ftp,
    instructions,
    weight,
    name,
    description,
    author,
    tags,
    sportType,
    durationType,
    paceUnitType,
    runningTimes,
  ]);

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

  function handleKeyPress(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.target instanceof HTMLInputElement) {
      // Ignore key presses coming from input elements
      return;
    }

    if (event.target instanceof HTMLTextAreaElement) {
      // Ignore key presses coming from textarea elements
      return;
    }

    switch (event.keyCode) {
      case 8:
        removeBar(actionId || "");
        // Prevent navigation to previous page
        event.preventDefault();
        break;
      case 37:
        // reduce time
        removeTimeToBar(actionId || "");
        break;
      case 39:
        // add time
        addTimeToBar(actionId || "");
        break;
      case 38:
        // add power
        addPowerToBar(actionId || "");
        break;
      case 40:
        // add power
        removePowerToBar(actionId || "");
        break;
      default:
        //console.log(event.keyCode);
        break;
    }
  }

  function addBar(
    zone: number,
    duration: number = 300,
    cadence: number = 0,
    pace: number = 0,
    length: number = 200,
    incline: number = 0
  ) {
    setBars((bars) => [
      ...bars,
      {
        time:
          durationType === "time"
            ? duration
            : helpers.round(
                helpers.calculateTime(length, calculateSpeed(pace)),
                1
              ),
        length:
          durationType === "time"
            ? helpers.round(
                helpers.calculateDistance(duration, calculateSpeed(pace)),
                1
              )
            : length,
        power: zone,
        cadence: cadence,
        type: "bar",
        id: uuidv4(),
        pace: pace,
        incline: incline,
      },
    ]);
  }

  function addTrapeze(
    zone1: number,
    zone2: number,
    duration: number = 300,
    pace: number = 0,
    length: number = 1000,
    cadence: number = 0
  ) {
    setBars((bars) => [
      ...bars,
      {
        time:
          durationType === "time"
            ? duration
            : helpers.round(
                helpers.calculateTime(length, calculateSpeed(pace)),
                1
              ),
        length:
          durationType === "time"
            ? helpers.round(
                helpers.calculateDistance(duration, calculateSpeed(pace)),
                1
              )
            : length,
        startPower: zone1,
        endPower: zone2,
        cadence: cadence,
        pace: pace,
        type: "trapeze",
        id: uuidv4(),
      },
    ]);
  }

  function addFreeRide(
    duration: number = 600,
    cadence: number = 0,
    length: number = 1000
  ) {
    setBars((bars) => [
      ...bars,
      {
        time: durationType === "time" ? duration : 0,
        length: durationType === "time" ? 0 : length,
        cadence: cadence,
        type: "freeRide",
        id: uuidv4()
      },
    ]);
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
    setBars((bars) => [
      ...bars,
      {
        time:
          durationType === "time"
            ? (onDuration + offDuration) * repeat
            : helpers.round(
                helpers.calculateTime(
                  (onLength + offLength) * repeat,
                  calculateSpeed(pace)
                ),
                1
              ),
        length:
          durationType === "time"
            ? helpers.round(
                helpers.calculateDistance(
                  (onDuration + offDuration) * repeat,
                  calculateSpeed(pace)
                ),
                1
              )
            : (onLength + offLength) * repeat,
        id: uuidv4(),
        type: "interval",
        cadence: cadence,
        restingCadence: restingCadence,
        repeat: repeat,
        onDuration:
          durationType === "time"
            ? onDuration
            : helpers.round(
                helpers.calculateTime(
                  (onLength * 1) / onPower,
                  calculateSpeed(pace)
                ),
                1
              ),
        offDuration:
          durationType === "time"
            ? offDuration
            : helpers.round(
                helpers.calculateTime(
                  (offLength * 1) / offPower,
                  calculateSpeed(pace)
                ),
                1
              ),
        onPower: onPower,
        offPower: offPower,
        pace: pace,
        onLength:
          durationType === "time"
            ? helpers.round(
                helpers.calculateDistance(
                  (onDuration * 1) / onPower,
                  calculateSpeed(pace)
                ),
                1
              )
            : onLength,
        offLength:
          durationType === "time"
            ? helpers.round(
                helpers.calculateDistance(
                  (offDuration * 1) / offPower,
                  calculateSpeed(pace)
                ),
                1
              )
            : offLength
      },
    ]);
  }

  function addInstruction(text = "", time = 0, length = 0) {
    setInstructions((instructions) => [
      ...instructions,
      {
        text: text,
        time: time,
        length: length,
        id: uuidv4(),
      },
    ]);
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
            element.length,
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
            element.length,
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

    if (element.type === "bar")
      addBar(
        element.power || 80,
        element.time,
        element.cadence,
        element.pace,
        element.length
      );
    if (element.type === "freeRide")
      addFreeRide(element.time, element.cadence, element.length);
    if (element.type === "trapeze")
      addTrapeze(
        element.startPower || 80,
        element.endPower || 160,
        element.time,
        element.pace || 0,
        element.length,
        element.cadence
      );
    if (element.type === "interval")
      addInterval(
        element.repeat,
        element.onDuration,
        element.offDuration,
        element.onPower,
        element.offPower,
        element.cadence,
        element.restingCadence,
        element.pace,
        element.onLength,
        element.offLength
      );

    setActionId(undefined);
  }

  function moveLeft(id: string) {
    const index = bars.findIndex((bar) => bar.id === id);
    // not first position of array
    if (index > 0) {
      const updatedArray = [...bars];
      const element = [...bars][index];
      updatedArray.splice(index, 1);
      updatedArray.splice(index - 1, 0, element);
      setBars(updatedArray);
    }
  }

  function moveRight(id: string) {
    const index = bars.findIndex((bar) => bar.id === id);
    // not first position of array
    if (index < bars.length - 1) {
      const updatedArray = [...bars];
      const element = [...bars][index];
      updatedArray.splice(index, 1);
      updatedArray.splice(index + 1, 0, element);
      setBars(updatedArray);
    }
  }

  function saveWorkout() {
    setSavePopupVisibility(true);
  }

  function deleteWorkout() {
    // save to cloud (firebase) if logged in
    if (user) {
      var updates: any = {};
      updates[`users/${user.uid}/workouts/${id}`] = null;
      updates[`workouts/${id}`] = null;

      // save to firebase

      update(ref(db), updates)
        .then(() => {
          newWorkout();
        })
        .catch((error) => {
          console.log(error);
          setMessage({
            visible: true,
            class: "error",
            text: "Cannot delete workout",
          });
        });
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

  function save() {
    setMessage({ visible: true, class: "loading", text: "Saving.." });

    const xml = createWorkoutXml({
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
      const item = {
        id: id,
        name: name,
        description: description,
        author: author,
        workout: bars,
        tags: tags,
        instructions: instructions,
        userId: user.uid,
        updatedAt: Date(),
        sportType: sportType,
        durationType: durationType,
      };

      const item2 = {
        name: name,
        description: description,
        updatedAt: Date(),
        sportType: sportType,
        durationType: durationType,
        workoutTime: helpers.formatDuration(
          helpers.getWorkoutLength(bars, durationType)
        ),
        workoutDistance: helpers.getWorkoutDistance(bars),
      };

      var updates: any = {};
      updates[`users/${user.uid}/workouts/${id}`] = item2;
      updates[`workouts/${id}`] = item;

      // save to firebase
      update(ref(db), updates)
        .then(() => {
          //upload to s3
          upload(file, false);
          setMessage({ visible: false });
        })
        .catch((error) => {
          console.log(error);
          setMessage({
            visible: true,
            class: "error",
            text: "Cannot save this",
          });
        });
    } else {
      // download workout without saving
      setMessage({ visible: false });
    }

    return file;
  }

  function logout() {
    signOut(auth).then(() => setUser(null));
  }

  function downloadWorkout() {
    const tempFile = save();
    const url = window.URL.createObjectURL(tempFile);

    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";
    a.href = url;
    a.download = `${id}.zwo`;
    a.click();
    window.URL.revokeObjectURL(url);
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
            console.log("File uploaded");

            // can parse now

            if (parse) fetchAndParse(id);
          })
          .catch((error) => {
            console.error(error);
          });
      });
  }

  function fetchAndParse(id: string) {
    // remove previous workout

    // TODO fix for running distance based
    setBars([]);
    setInstructions([]);

    fetch(`${S3_URL}/${id}.zwo`)
      .then((response) => response.text())
      .then((data) => {
        // remove xml comments
        data = data.replace(/<!--(.*?)-->/gm, "");

        //now parse file
        const workout = Converter.xml2js(data);
        const workout_file = workout.elements[0];

        if (workout_file.name === "workout_file") {
          // file is valid
          const authorIndex = workout_file.elements.findIndex(
            (element: { name: string }) => element.name === "author"
          );
          if (
            authorIndex !== -1 &&
            workout_file.elements[authorIndex].elements
          ) {
            setAuthor(workout_file.elements[authorIndex].elements[0].text);
          }

          const nameIndex = workout_file.elements.findIndex(
            (element: { name: string }) => element.name === "name"
          );
          if (nameIndex !== -1 && workout_file.elements[nameIndex].elements) {
            setName(workout_file.elements[nameIndex].elements[0].text);
          }

          const descriptionIndex = workout_file.elements.findIndex(
            (element: { name: string }) => element.name === "description"
          );
          if (
            descriptionIndex !== -1 &&
            workout_file.elements[descriptionIndex].elements
          ) {
            setDescription(
              workout_file.elements[descriptionIndex].elements[0].text
            );
          }

          const workoutIndex = workout_file.elements.findIndex(
            (element: { name: string }) => element.name === "workout"
          );

          var totalTime = 0;

          workout_file.elements[workoutIndex].elements.map(
            (w: {
              name: string;
              attributes: {
                Power: any;
                PowerLow: string;
                Duration: string;
                PowerHigh: string;
                Cadence: string;
                CadenceResting: string;
                Repeat: string;
                OnDuration: string;
                OffDuration: string;
                OnPower: string;
                OffPower: string;
                Pace: string;
                Incline: string;
              };
              elements: any;
            }) => {
              let duration = parseFloat(w.attributes.Duration);

              if (w.name === "SteadyState")
                addBar(
                  parseFloat(w.attributes.Power || w.attributes.PowerLow),
                  parseFloat(w.attributes.Duration),
                  parseFloat(w.attributes.Cadence || "0"),
                  parseInt(w.attributes.Pace || "0"),
                  undefined,
                  parseFloat(w.attributes.Incline || "0") * 100
                );

              if (
                w.name === "Ramp" ||
                w.name === "Warmup" ||
                w.name === "Cooldown"
              )
                addTrapeze(
                  parseFloat(w.attributes.PowerLow),
                  parseFloat(w.attributes.PowerHigh),
                  parseFloat(w.attributes.Duration),
                  parseInt(w.attributes.Pace || "0"),
                  undefined,
                  parseInt(w.attributes.Cadence),
                );

              if (w.name === "IntervalsT") {
                addInterval(
                  parseFloat(w.attributes.Repeat),
                  parseFloat(w.attributes.OnDuration),
                  parseFloat(w.attributes.OffDuration),
                  parseFloat(w.attributes.OnPower),
                  parseFloat(w.attributes.OffPower),
                  parseInt(w.attributes.Cadence || "0"),
                  parseInt(w.attributes.CadenceResting),
                  parseInt(w.attributes.Pace || "0"),
                  undefined,
                  undefined,
                );
                duration =
                  (parseFloat(w.attributes.OnDuration) +
                    parseFloat(w.attributes.OffDuration)) *
                  parseFloat(w.attributes.Repeat);
              }

              if (w.name === "FreeRide")
                addFreeRide(
                  parseFloat(w.attributes.Duration),
                  parseInt(w.attributes.Cadence),
                  undefined,
                );

              // check for instructions
              const textElements = w.elements;
              if (textElements && textElements.length > 0) {
                textElements.map(
                  (t: {
                    name: string;
                    attributes: {
                      message: string | undefined;
                      timeoffset: string;
                    };
                  }) => {
                    if (t.name.toLowerCase() === "textevent")
                      addInstruction(
                        t.attributes.message,
                        totalTime + parseFloat(t.attributes.timeoffset)
                      );

                    return false;
                  }
                );
              }

              totalTime = totalTime + duration;
              // map functions expect return value
              return false;
            }
          );
        }
      })
      .catch((error) => {
        console.error(error);
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
      key={bar.id}
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
      onChange={(id: string, value: any) => handleOnChange(id, value)} // Change any to Interface Bar?
      onClick={(id: string) => handleOnClick(id)}
      selected={bar.id === actionId}
      showLabel={true}
      incline={bar.incline}
    />
  );

  const renderTrapeze = (bar: BarType) => (
    <Trapeze
      key={bar.id}
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
      onChange={(id: string, value: any) => handleOnChange(id, value)} // Change any to Interface Bar?
      onClick={(id: string) => handleOnClick(id)}
      selected={bar.id === actionId}
    />
  );

  const renderFreeRide = (bar: BarType) => (
    <FreeRide
      key={bar.id}
      id={bar.id}
      time={bar.time}
      length={bar.length}
      cadence={bar.cadence}
      durationType={durationType}
      sportType={sportType}
      onChange={(id: string, value: any) => handleOnChange(id, value)} // Change any to Interface Bar?
      onClick={(id: string) => handleOnClick(id)}
      selected={bar.id === actionId}
    />
  );

  const renderInterval = (bar: BarType) => (
    <Interval
      key={bar.id}
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
      handleIntervalChange={(id: string, value: any) =>
        handleOnChange(id, value)
      }
      handleIntervalClick={(id: string) => handleOnClick(id)}
      selected={bar.id === actionId}
    />
  );

  const renderComment = (instruction: Instruction, index: number) => (
    <Comment
      key={instruction.id}
      instruction={instruction}
      durationType={durationType}
      width={
        durationType === "distance"
          ? parseInt(helpers.getWorkoutDistance(bars)) * 100
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
            element.length,
            calculateSpeed(element.pace || 0)
          ) *
            1) /
          (element.power || 1);
      }

      setBars(updatedArray);
    }
  }

  function getPace(id: string) {
    const index = bars.findIndex((bar) => bar.id === id);

    if (index !== -1) {
      const element = [...bars][index];
      return element.pace;
    }
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

    // 2 minutes block at 112% FTP
    // 2 minutes block at 330 W
    // 30 seconds block at ..

    //console.log(textValue);

    const workoutBlocks = textValue.split("\n");
    workoutBlocks.forEach((workoutBlock) => {
      // Handle messages first to avoid false positives with keywords
      if (workoutBlock.includes("message")) {
        // extract message
        const doubleQuoteMatch = workoutBlock.match(/"([^"]*)"/);
        const singleQuoteMatch = workoutBlock.match(/'([^']*)'/);
        const message = doubleQuoteMatch || singleQuoteMatch;
        const text = message ? message[1] : "";

        const durationInSeconds = workoutBlock.match(/([0-9]\d*s)/);
        const durationInMinutes = workoutBlock.match(/([0-9]*:?[0-9][0-9]*m)/);

        let duration = durationInSeconds && parseInt(durationInSeconds[0]);
        duration = durationInMinutes
          ? parseInt(durationInMinutes[0].split(":")[0]) * 60 +
            (parseInt(durationInMinutes[0].split(":")[1]) || 0)
          : duration;

        addInstruction(text, duration || 0);
        return; // Skip to next iteration
      }

      if (workoutBlock.includes("steady")) {
        // generate a steady state block

        // extract watts
        const powerInWatts = workoutBlock.match(/([0-9]\d*w)/);
        const powerInWattsPerKg = workoutBlock.match(/([0-9]*.?[0-9]wkg)/);
        const powerInPercentageFtp = workoutBlock.match(/([0-9]\d*%)/);

        let power = powerInWatts ? parseInt(powerInWatts[0]) / ftp : 1;
        power = powerInWattsPerKg
          ? (parseFloat(powerInWattsPerKg[0]) * weight) / ftp
          : power;
        power = powerInPercentageFtp
          ? parseInt(powerInPercentageFtp[0]) / 100
          : power;

        // extract duration in seconds
        const durationInSeconds = workoutBlock.match(/([0-9]\d*s)/);
        const durationInMinutes = workoutBlock.match(/([0-9]*:?[0-9][0-9]*m)/);

        let duration = durationInSeconds && parseInt(durationInSeconds[0]);
        duration = durationInMinutes
          ? parseInt(durationInMinutes[0].split(":")[0]) * 60 +
            (parseInt(durationInMinutes[0].split(":")[1]) || 0)
          : duration;

        // extract cadence in rpm
        const cadence = workoutBlock.match(/([0-9]\d*rpm)/);
        const rpm = cadence ? parseInt(cadence[0]) : undefined;

        // extract multiplier
        // const multiplier = workoutBlock.match(/([0-9]\d*x)/)
        // const nTimes = multiplier ? Array(parseInt(multiplier[0])) : Array(1)
        // for (var i = 0; i < nTimes.length; i++)

        addBar(power, duration || 300, rpm);
      }

      if (
        workoutBlock.includes("ramp") ||
        workoutBlock.includes("warmup") ||
        workoutBlock.includes("cooldown")
      ) {
        // generate a steady ramp block

        // extract watts
        const startPowerInWatts = workoutBlock.match(/([0-9]\d*w)/);
        const startPowerInWattsPerKg = workoutBlock.match(/([0-9]*.?[0-9]wkg)/);
        const startPowerInPercentageFtp = workoutBlock.match(/([0-9]\d*%)/);

        let startPower = startPowerInWatts
          ? parseInt(startPowerInWatts[0]) / ftp
          : 1;
        startPower = startPowerInWattsPerKg
          ? (parseFloat(startPowerInWattsPerKg[0]) * weight) / ftp
          : startPower;
        startPower = startPowerInPercentageFtp
          ? parseInt(startPowerInPercentageFtp[0]) / 100
          : startPower;

        // extract watts
        const endPowerInWatts = workoutBlock.match(/(-[0-9]\d*w)/);
        const endPowerInWattsPerKg = workoutBlock.match(/(-[0-9]*.?[0-9]wkg)/);
        const endPowerInPercentageFtp = workoutBlock.match(/-([0-9]\d*%)/);

        let endPower = endPowerInWatts
          ? Math.abs(parseInt(endPowerInWatts[0])) / ftp
          : 1;
        endPower = endPowerInWattsPerKg
          ? (Math.abs(parseFloat(endPowerInWattsPerKg[0])) * weight) / ftp
          : endPower;
        endPower = endPowerInPercentageFtp
          ? Math.abs(parseInt(endPowerInPercentageFtp[0])) / 100
          : endPower;

        const durationInSeconds = workoutBlock.match(/([0-9]\d*s)/);
        const durationInMinutes = workoutBlock.match(/([0-9]*:?[0-9][0-9]*m)/);

        let duration = durationInSeconds && parseInt(durationInSeconds[0]);
        duration = durationInMinutes
          ? parseInt(durationInMinutes[0].split(":")[0]) * 60 +
            (parseInt(durationInMinutes[0].split(":")[1]) || 0)
          : duration;

        // extract cadence in rpm
        const cadence = workoutBlock.match(/([0-9]\d*rpm)/);
        const rpm = cadence ? parseInt(cadence[0]) : undefined;

        addTrapeze(
          startPower,
          endPower,
          duration || 300,
          undefined,
          undefined,
          rpm
        );
      }

      if (workoutBlock.includes("freeride")) {
        const durationInSeconds = workoutBlock.match(/([0-9]\d*s)/);
        const durationInMinutes = workoutBlock.match(/([0-9]*:?[0-9][0-9]*m)/);

        let duration = durationInSeconds && parseInt(durationInSeconds[0]);
        duration = durationInMinutes
          ? parseInt(durationInMinutes[0].split(":")[0]) * 60 +
            (parseInt(durationInMinutes[0].split(":")[1]) || 0)
          : duration;

        // extract cadence in rpm
        const cadence = workoutBlock.match(/([0-9]\d*rpm)/);
        const rpm = cadence ? parseInt(cadence[0]) : undefined;

        addFreeRide(duration || 600, rpm);
      }

      if (workoutBlock.includes("interval")) {
        const multiplier = workoutBlock.match(/([0-9]\d*x)/);
        const nTimes = multiplier ? parseInt(multiplier[0]) : 3;

        const durationInSeconds = workoutBlock.match(/([0-9]\d*s)/);
        const durationInMinutes = workoutBlock.match(/([0-9]*:?[0-9][0-9]*m)/);

        let duration = durationInSeconds && parseInt(durationInSeconds[0]);
        duration = durationInMinutes
          ? parseInt(durationInMinutes[0].split(":")[0]) * 60 +
            (parseInt(durationInMinutes[0].split(":")[1]) || 0)
          : duration;

        const offDurationInSeconds = workoutBlock.match(/(-[0-9]\d*s)/);
        const offDurationInMinutes = workoutBlock.match(
          /(-[0-9]*:?[0-9][0-9]*m)/
        );

        let offDuration =
          offDurationInSeconds && Math.abs(parseInt(offDurationInSeconds[0]));
        offDuration = offDurationInMinutes
          ? Math.abs(parseInt(offDurationInMinutes[0].split(":")[0])) * 60 +
            (parseInt(offDurationInMinutes[0].split(":")[1]) || 0)
          : offDuration;

        // extract watts
        const startPowerInWatts = workoutBlock.match(/([0-9]\d*w)/);
        const startPowerInWattsPerKg = workoutBlock.match(/([0-9]*.?[0-9]wkg)/);
        const startPowerInPercentageFtp = workoutBlock.match(/([0-9]\d*%)/);

        let startPower = startPowerInWatts
          ? parseInt(startPowerInWatts[0]) / ftp
          : 1;
        startPower = startPowerInWattsPerKg
          ? (parseFloat(startPowerInWattsPerKg[0]) * weight) / ftp
          : startPower;
        startPower = startPowerInPercentageFtp
          ? parseInt(startPowerInPercentageFtp[0]) / 100
          : startPower;

        // extract watts
        const endPowerInWatts = workoutBlock.match(/(-[0-9]\d*w)/);
        const endPowerInWattsPerKg = workoutBlock.match(/(-[0-9]*.?[0-9]wkg)/);
        const endPowerInPercentageFtp = workoutBlock.match(/-([0-9]\d*%)/);

        let endPower = endPowerInWatts
          ? Math.abs(parseInt(endPowerInWatts[0])) / ftp
          : 0.5;
        endPower = endPowerInWattsPerKg
          ? (Math.abs(parseFloat(endPowerInWattsPerKg[0])) * weight) / ftp
          : endPower;
        endPower = endPowerInPercentageFtp
          ? Math.abs(parseInt(endPowerInPercentageFtp[0])) / 100
          : endPower;

        // extract cadence in rpm
        const cadence = workoutBlock.match(/([0-9]\d*rpm)/);
        const rpm = cadence ? parseInt(cadence[0]) : undefined;

        const restingCadence = workoutBlock.match(/(-[0-9]\d*rpm)/);
        const restingRpm = restingCadence
          ? Math.abs(parseInt(restingCadence[0]))
          : undefined;

        addInterval(
          nTimes,
          duration || 30,
          offDuration || 120,
          startPower,
          endPower,
          rpm,
          restingRpm
        );
      }
    });
  }

  return (
    // Adding tabIndex allows div element to receive keyboard events
    <div className="container" onKeyDown={handleKeyPress} tabIndex={0}>
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

      {message?.visible && (
        <div className={`message ${message.class}`}>
          {message.text}
          <button
            className="close"
            onClick={() => setMessage({ visible: false })}
          >
            <FontAwesomeIcon icon={faTimesCircle} size="lg" fixedWidth />
          </button>
        </div>
      )}

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
      <div className="info">
        <div className="title">
          <h1>{name}</h1>
          <div className="description">{description}</div>
          <p>{author ? `by ${author}` : ""}</p>
        </div>
        <div className="workout">
          <div className="form-input">
            <label>Workout Time</label>
            <input
              className="textInput"
              value={helpers.formatDuration(
                helpers.getWorkoutLength(bars, durationType)
              )}
              disabled
            />
          </div>
          {sportType === "run" && (
            <div className="form-input">
              <label>Workout Distance</label>
              <input
                className="textInput"
                value={helpers.getWorkoutDistance(bars)}
                disabled
              />
            </div>
          )}
          {sportType === "bike" && (
            <div className="form-input">
              <label title="Training Load">Training Load</label>
              <input
                className="textInput"
                value={helpers.getStressScore(bars, ftp)}
                disabled
              />
            </div>
          )}
          {sportType === "run" && (
            <div className="form-input">
              <label>Avg. Workout Pace</label>
              <input
                className="textInput"
                value={helpers.getWorkoutPace(bars, durationType, paceUnitType)}
                disabled
              />
            </div>
          )}
          {sportType === "run" && (
            <LeftRightToggle<"time", "distance">
              label="Duration Type"
              leftValue="time"
              rightValue="distance"
              leftIcon={faClock}
              rightIcon={faRuler}
              selected={durationType}
              onChange={setDurationType}
            />
          )}
          {sportType === "run" && (
            <LeftRightToggle<"metric", "imperial">
              label="Pace Unit"
              leftValue="metric"
              rightValue="imperial"
              leftLabel="min/km"
              rightLabel="min/mi"
              selected={paceUnitType}
              onChange={setPaceUnitType}
            />
          )}
          <LeftRightToggle<"bike", "run">
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
      {sportType === "run" && (
        <RunningTimesEditor times={runningTimes} onChange={setRunningTimes} />
      )}
      {textEditorIsVisible && sportType === "bike" && (
        <div className="text-editor">
          <textarea
            onChange={(e) => transformTextToWorkout(e.target.value)}
            rows={10}
            spellCheck={false}
            className="text-editor-textarea"
            placeholder="Add one block per line here: &#10;steady 3.0wkg 30s"
          ></textarea>
          <div className="text-editor-instructions">
            <h2>Instructions</h2>
            <p>
              Every row correspond to a workout block. Scroll down to see some
              examples.
            </p>
            <h3>Blocks</h3>
            <p>
              <span>steady</span> <span>warmup</span> <span>cooldown</span>{" "}
              <span>ramp</span> <span>intervals</span> <span>freeride</span>{" "}
              <span>message</span>
            </p>
            <h3>Time</h3>
            <p>
              <span>30s</span> or <span>0:30m</span>
            </p>
            <h3>Power</h3>
            <p>
              <span>250w</span> or <span>3.0wkg</span> or <span>75%</span> (FTP)
            </p>
            <h3>Cadence</h3>
            <p>
              <span>120rpm</span>
            </p>
            <h2>Examples</h2>
            <h3>Steady block</h3>
            <p>
              <code>steady 3.0wkg 30s</code>
              <code>steady 120w 10m 85rpm</code>
            </p>
            <h3>Warmup / Cooldown / Ramp block</h3>
            <p>
              <code>warmup 2.0wkg-3.5wkg 10m</code>
              <code>cooldown 180w-100w 5m 110rpm</code>
            </p>
            <h3>Intervals</h3>
            <p>
              <code>interval 10x 30s-30s 4.0wkg-1.0wkg 110rpm-85rpm</code>
              <code>interval 3x 1:00m-5:00m 300w-180w</code>
            </p>
            <h3>Free Ride</h3>
            <p>
              <code>freeride 10m 85rpm</code>
            </p>
            <h3>Text Event</h3>
            <p>
              <code>message "Get ready to your first set!" 30s</code>
              <code>message "Last one!" 20:00m</code>
            </p>
          </div>
        </div>
      )}
      <div id="editor" className="editor">
        {actionId && (
          <div className="actions">
            <button onClick={() => moveLeft(actionId)} title="Move Left">
              <FontAwesomeIcon icon={faArrowLeft} size="lg" fixedWidth />
            </button>
            <button onClick={() => moveRight(actionId)} title="Move Right">
              <FontAwesomeIcon icon={faArrowRight} size="lg" fixedWidth />
            </button>
            <button onClick={() => removeBar(actionId)} title="Delete">
              <FontAwesomeIcon icon={faTrash} size="lg" fixedWidth />
            </button>
            <button onClick={() => duplicateBar(actionId)} title="Duplicate">
              <FontAwesomeIcon icon={faCopy} size="lg" fixedWidth />
            </button>
            {sportType === "run" && (
              <select
                name="pace"
                value={getPace(actionId)}
                onChange={(e) => setPace(e.target?.value, actionId)}
                className="selectInput"
              >
                <option value="0">1 Mile Pace</option>
                <option value="1">5K Pace</option>
                <option value="2">10K Pace</option>
                <option value="3">Half Marathon Pace</option>
                <option value="4">Marathon Pace</option>
              </select>
            )}
          </div>
        )}
        <div className="canvas" ref={canvasRef}>
          {actionId && (
            <div
              className="fader"
              style={{ width: canvasRef.current?.scrollWidth }}
              onClick={() => setActionId(undefined)}
            ></div>
          )}
          <div className="segments" ref={segmentsRef}>
            {bars.map((bar) => {
              if (bar.type === "bar") {
                return renderBar(bar);
              } else if (bar.type === "trapeze") {
                return renderTrapeze(bar);
              } else if (bar.type === "freeRide") {
                return renderFreeRide(bar);
              } else if (bar.type === "interval") {
                return renderInterval(bar);
              } else {
                return false;
              }
            })}
          </div>

          <div className="slider">
            {instructions.map((instruction, index) =>
              renderComment(instruction, index)
            )}
          </div>

          {durationType === "time" ? (
            <TimeAxis width={segmentsWidth} />
          ) : (
            <DistanceAxis width={segmentsWidth} />
          )}
        </div>

        <ZoneAxis />
      </div>
      <div className="cta">
        {sportType === "bike" ? (
          <div>
            <ReactTooltip effect="solid" />
            <button
              className="btn btn-square"
              onClick={() => toggleTextEditor()}
              style={{ backgroundColor: "palevioletred" }}
              data-tip="New! Workout text editor!"
            >
              <FontAwesomeIcon icon={faPen} fixedWidth />
            </button>
            <button
              className="btn btn-square"
              onClick={() => addBar(0.5)}
              style={{ backgroundColor: Colors.GRAY }}
            >
              Z1
            </button>
            <button
              className="btn btn-square"
              onClick={() => addBar(Zones.Z2.min)}
              style={{ backgroundColor: Colors.BLUE }}
            >
              Z2
            </button>
            <button
              className="btn btn-square"
              onClick={() => addBar(Zones.Z3.min)}
              style={{ backgroundColor: Colors.GREEN }}
            >
              Z3
            </button>
            <button
              className="btn btn-square"
              onClick={() => addBar(Zones.Z4.min)}
              style={{ backgroundColor: Colors.YELLOW }}
            >
              Z4
            </button>
            <button
              className="btn btn-square"
              onClick={() => addBar(Zones.Z5.min)}
              style={{ backgroundColor: Colors.ORANGE }}
            >
              Z5
            </button>
            <button
              className="btn btn-square"
              onClick={() => addBar(Zones.Z6.min)}
              style={{ backgroundColor: Colors.RED }}
            >
              Z6
            </button>
          </div>
        ) : (
          <button
            className="btn"
            onClick={() => addBar(1, 300, 0, 0, 1000)}
            style={{ backgroundColor: Colors.WHITE }}
          >
            <SteadyLogo className="btn-icon" /> Steady Pace
          </button>
        )}

        <button
          className="btn"
          onClick={() => addTrapeze(0.25, 0.75)}
          style={{ backgroundColor: Colors.WHITE }}
        >
          <WarmupLogo className="btn-icon" /> Warm up
        </button>
        <button
          className="btn"
          onClick={() => addTrapeze(0.75, 0.25)}
          style={{ backgroundColor: Colors.WHITE }}
        >
          <WarmdownLogo className="btn-icon" /> Cool down
        </button>
        <button
          className="btn"
          onClick={() => addInterval()}
          style={{ backgroundColor: Colors.WHITE }}
        >
          <IntervalLogo className="btn-icon" /> Interval
        </button>
        <button
          className="btn"
          onClick={() => addFreeRide()}
          style={{ backgroundColor: Colors.WHITE }}
        >
          <FontAwesomeIcon
            icon={sportType === "bike" ? faBicycle : faRunning}
            size="lg"
            fixedWidth
          />{" "}
          Free {sportType === "bike" ? "Ride" : "Run"}
        </button>
        <button
          className="btn"
          onClick={() => addInstruction()}
          style={{ backgroundColor: Colors.WHITE }}
        >
          <FontAwesomeIcon icon={faComment} size="lg" fixedWidth /> Text Event
        </button>
        {sportType === "bike" && (
          <div className="form-input">
            <label htmlFor="ftp">FTP (W)</label>
            <input
              className="textInput"
              type="number"
              name="ftp"
              value={ftp}
              onChange={(e) => setFtp(parseInt(e.target.value))}
            />
          </div>
        )}

        {sportType === "bike" && (
          <div className="form-input">
            <label htmlFor="weight">Body Weight (Kg)</label>
            <input
              className="textInput"
              type="number"
              name="weight"
              value={weight}
              onChange={(e) => setWeight(parseInt(e.target.value))}
            />
          </div>
        )}

        <button
          className="btn"
          onClick={() => {
            if (
              window.confirm("Are you sure you want to create a new workout?")
            )
              newWorkout();
          }}
        >
          <FontAwesomeIcon icon={faFile} size="lg" fixedWidth /> New
        </button>
        <button className="btn" onClick={() => saveWorkout()}>
          <FontAwesomeIcon icon={faSave} size="lg" fixedWidth /> Save
        </button>
        <button
          className="btn"
          onClick={() => {
            if (window.confirm("Are you sure you want to delete this workout?"))
              deleteWorkout();
          }}
        >
          <FontAwesomeIcon icon={faTrash} size="lg" fixedWidth /> Delete
        </button>
        <button className="btn" onClick={() => downloadWorkout()}>
          <FontAwesomeIcon icon={faDownload} size="lg" fixedWidth /> Download
        </button>
        <input
          accept=".xml,.zwo"
          id="contained-button-file"
          type="file"
          style={{ display: "none" }}
          onChange={(e) => handleUpload(e.target.files![0])}
        />
        <button
          className="btn"
          onClick={() =>
            document.getElementById("contained-button-file")!.click()
          }
        >
          <FontAwesomeIcon icon={faUpload} size="lg" fixedWidth /> Upload
        </button>
        <button className="btn" onClick={() => setShowWorkouts(true)}>
          <FontAwesomeIcon icon={faList} size="lg" fixedWidth /> Workouts
        </button>
        <button className="btn" onClick={() => shareWorkout()}>
          <FontAwesomeIcon icon={faShareAlt} size="lg" fixedWidth /> Share
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default Editor;
