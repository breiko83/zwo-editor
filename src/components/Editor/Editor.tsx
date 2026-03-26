import React, { useState, useEffect, useRef } from "react";
import "./Editor.css";
import { Zones } from "../Constants";
import Bar from "../Bar/Bar";
import Trapeze from "../Trapeze/Trapeze";
import FreeRide from "../FreeRide/FreeRide";
import Interval from "../Interval/Interval";
import Comment from "../Comment/Comment";
import EditComment from "../Comment/EditComment";
import Footer from "../Footer/Footer";
import helpers from "../helpers";
import { Helmet } from "react-helmet-async";
import { RouteComponentProps } from "react-router-dom";
import WorkoutMetadata from "./WorkoutMetadata";
import WorkoutCanvas from "./WorkoutCanvas";
import WorkoutSettings from "./WorkoutSettings";
import WorkoutToolbar from "./WorkoutToolbar";
import WorkoutTextEditor from "./WorkoutTextEditor";
import { workoutService } from "../../services/workoutService";
import { xmlService } from "../../services/xmlService";
import { textParserService } from "../../services/textParserService";
import { runningTextParserService } from "../../services/runningTextParserService";
import { useWorkoutState } from "./hooks/useWorkoutState";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { BarType, Instruction, SportType } from "../../types/workout";

type TParams = { id: string };

const Editor = ({ match }: RouteComponentProps<TParams>) => {
  const { v4: uuidv4 } = require("uuid");

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

  const canvasRef = useRef<HTMLInputElement>(null);
  const segmentsRef = useRef<HTMLInputElement>(null);
  const [segmentsWidth, setSegmentsWidth] = useState(1320);

  const [textEditorIsVisible, setTextEditorIsVisible] = useState(false);

  // Update segments width when bars change
  useEffect(() => {
    setSegmentsWidth(segmentsRef.current?.scrollWidth || 1320);
  }, [bars]);

  function generateId() {
    return Math.random().toString(36).substr(2, 16);
  }

  function newWorkout() {
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

  function addInstruction(text = "", time = 0, length = 0, openEditor = true) {
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
    if (openEditor)
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
    if (bars.length > 0) {
      if (!window.confirm("Are you sure you want to create a new workout?")) {
        return false;
      }
    }

    xmlService.parseWorkoutXml(file as File, uuidv4).then((parsedWorkout) => {
      setName(parsedWorkout.name);
      setDescription(parsedWorkout.description);
      setAuthor(parsedWorkout.author);
      setSportType(parsedWorkout.sportType);
      setDurationType(parsedWorkout.durationType);
      setTags(parsedWorkout.tags);
      setBars(parsedWorkout.bars);
      setInstructions(parsedWorkout.instructions);
    }).catch((error) => {
      console.error('Invalid workout file format', error);
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
          : helpers.getWorkoutLength(bars) / 3
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

    if (sportType === 'bike') {
      // Use textParserService for bike workouts
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
              addInstruction(block.text, block.duration, 0, false);
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
              block.power !== undefined &&
              block.endPower !== undefined
            ) {
              addInterval(
                block.repeat,
                block.duration,
                block.offDuration,
                block.power,
                block.endPower,
                block.cadence,
                block.restingCadence
              );
            }
            break;
        }
      });
    } else {
      // Use runningTextParserService for run workouts
      const parsedBlocks = runningTextParserService.parseWorkoutText(
        textValue,
        durationType
      );

      // Process parsed blocks and add them to workout
      parsedBlocks.forEach((block) => {
        switch (block.type) {
          case 'message':
            if (block.text !== undefined) {
              if (durationType === 'time' && block.duration !== undefined) {
                addInstruction(block.text, block.duration, 0, false);
              } else if (durationType === 'distance' && block.length !== undefined) {
                addInstruction(block.text, 0, block.length, false);
              }
            }
            break;
          case 'steady':
            if (block.pace !== undefined) {
              if (durationType === 'time' && block.duration !== undefined) {
                addBar(block.power, block.duration, 0, block.pace, 0, block.incline || 0);
              } else if (durationType === 'distance' && block.length !== undefined) {
                addBar(block.power, 0, 0, block.pace, block.length, block.incline || 0);
              }
            }
            break;
          case 'ramp':
          case 'warmup':
          case 'cooldown':
            if (block.startPower !== undefined && block.endPower !== undefined && block.pace !== undefined) {
              if (durationType === 'time' && block.duration !== undefined) {
                addTrapeze(block.startPower, block.endPower, block.duration, block.pace, 0, block.incline || 0);
              } else if (durationType === 'distance' && block.length !== undefined) {
                addTrapeze(block.startPower, block.endPower, 0, block.pace, block.length, block.incline || 0);
              }
            }
            break;
          case 'freerun':
            if (durationType === 'time' && block.duration !== undefined) {
              addFreeRide(block.duration, 0, 0, block.incline || 0);
            } else if (durationType === 'distance' && block.length !== undefined) {
              addFreeRide(0, 0, block.length, block.incline || 0);
            }
            break;
          case 'interval':
            if (block.repeat !== undefined && block.power !== undefined && block.endPower !== undefined && block.pace !== undefined) {
              if (durationType === 'time' && block.duration !== undefined && block.offDuration !== undefined) {
                addInterval(
                  block.repeat,
                  block.duration,
                  block.offDuration,
                  block.power,
                  block.endPower,
                  block.incline || 0,
                  block.restingIncline || 0,
                  block.pace,
                  0,
                  0
                );
              } else if (durationType === 'distance' && block.length !== undefined && block.offLength !== undefined) {
                addInterval(
                  block.repeat,
                  0,
                  0,
                  block.power,
                  block.endPower,
                  block.incline || 0,
                  block.restingIncline || 0,
                  block.pace,
                  block.length,
                  block.offLength
                );
              }
            }
            break;
        }
      });
    }
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
      </Helmet>

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
      {textEditorIsVisible && (
        <WorkoutTextEditor onChange={transformTextToWorkout} sportType={sportType} durationType={durationType} />
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
          onDownload={downloadWorkout}
          onUpload={handleUpload}
        />
      </div>
      <Footer />
    </div>
  );
};

export default Editor;
