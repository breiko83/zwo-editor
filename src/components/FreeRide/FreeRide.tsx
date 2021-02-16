import React, { useState } from "react";
import "./FreeRide.css";
import { Resizable } from "re-resizable";
import "moment-duration-format";
import Label from "../Label/Label";
import helpers from "../helpers";

const FreeRide = (props: {
  id: string;
  time?: number;
  length?: number;
  cadence: number;
  sportType: string;
  durationType: string;
  onChange: Function;
  onClick: Function;
  selected: boolean;
}) => {
  const timeMultiplier = 3;
  const lengthMultiplier = 10;

  const durationLabel = helpers.formatDuration(props.time);

  // RUN WORKOUTS ON DISTANCE - BIKE WORKOUTS ON TIME
  const [width, setWidth] = useState(
    props.durationType === "time"
      ? (props.time || 0) / timeMultiplier
      : (props.length || 0) / lengthMultiplier
  );

  // DISTANCE
  const distance = props.length;

  const [showLabel, setShowLabel] = useState(false);

  const handleCadenceChange = (cadence: number) => {
    props.onChange(props.id, {
      time: props.time,
      type: "freeRide",
      cadence: cadence,
      id: props.id,
    });
  };

  // standard height
  const height = 100;

  const handleResizeStop = (dWidth: number) => {
    setWidth(width + dWidth);

    const length =
      props.durationType === "time"
        ? undefined
        : helpers.round((width + dWidth) * lengthMultiplier, 200);
    const time =
      props.durationType === "time"
        ? helpers.round((width + dWidth) * timeMultiplier, 5)
        : undefined

    props.onChange(props.id, {
      time: time,
      length: length,
      type: "freeRide",
      cadence: props.cadence,
      id: props.id,
    });
  };

  const handleResize = (dWidth: number) => {
    const length =
      props.durationType === "time"
        ? undefined
        : helpers.round((width + dWidth) * lengthMultiplier, 200);
    const time =
      props.durationType === "time"
        ? helpers.round((width + dWidth) * timeMultiplier, 5)
        : undefined

    props.onChange(props.id, {
      time: time,
      length: length,
      type: "freeRide",
      cadence: props.cadence,
      id: props.id,
    });
  };

  return (
    <div
      className="segment"
      onMouseEnter={() => setShowLabel(true)}
      onMouseLeave={() => setShowLabel(false)}
      style={props.selected ? { zIndex: 1 } : {}}
      onClick={() => props.onClick(props.id)}
    >
      {(props.selected || showLabel) && (
        
        <Label
          sportType={props.sportType}
          duration={durationLabel}
          distance={distance}
          cadence={props.cadence}
          setCadence={(cadence: number) => handleCadenceChange(cadence)}
        />
      )}
      <Resizable
        className="freeRide"
        size={{
          width:
            props.durationType === "time"
              ? (props.time || 0) / timeMultiplier
              : (props.length || 0) / lengthMultiplier,
          height: height,
        }}
        minWidth={timeMultiplier}
        minHeight={height}
        maxHeight={height}
        enable={{ right: true }}
        grid={[1, 1]}
        onResizeStop={(e, direction, ref, d) => handleResizeStop(d.width)}
        onResize={(e, direction, ref, d) => handleResize(d.width)}
      ></Resizable>
    </div>
  );
};

export default FreeRide;
