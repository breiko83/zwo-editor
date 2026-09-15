import React, { useCallback, useEffect, useRef, useState, memo } from "react";
import Bar from "../Bar/Bar";
import "./Interval.css";

import { BarType, PaceUnitType } from "../../types/workout";

const Interval = (props: {
  id: string;
  repeat: number;
  onDuration?: number;
  offDuration?: number;
  onLength?: number;
  offLength?: number;
  onPower: number;
  offPower: number;
  cadence: number;
  restingCadence: number;
  ftp: number;
  weight: number;
  pace: number;
  speed?: number;
  sportType: string;
  durationType: string;
  paceUnitType?: PaceUnitType;
  handleIntervalChange: Function;
  handleIntervalClick: Function;
  selected: boolean;
}) => {
  const { v4: uuidv4 } = require("uuid");

  const [bars, setBars] = useState<Array<BarType>>([]);
  const [nIntervals, setNIntervals] = useState(props.repeat);

  const barsRef = useRef(bars);
  barsRef.current = bars;

  const [onDuration, setOnDuration] = useState(props.onDuration);
  const [offDuration, setOffDuration] = useState(props.offDuration);

  const [onLength, setOnLength] = useState(props.onLength);
  const [offLength, setOffLength] = useState(props.offLength);

  useEffect(() => {
    const bars: BarType[] = [];

    for (var i = 0; i < nIntervals; i++) {
      bars.push({
        time: onDuration || 0,
        length: onLength || 0,
        power: props.onPower,
        cadence: props.cadence,
        type: "bar",
        pace: props.pace,
        id: uuidv4(),
      });

      bars.push({
        time: offDuration || 0,
        length: offLength || 0,
        power: props.offPower,
        cadence: props.restingCadence,
        type: "bar",
        pace: props.pace,
        id: uuidv4(),
      });
    }
    setBars(bars);

    // eslint-disable-next-line
  }, [nIntervals]);

  const { handleIntervalChange, handleIntervalClick, id: intervalId, pace } = props;

  const handleOnChange = useCallback(
    (id: string, values: BarType) => {
      const bars = barsRef.current;
      const index = bars.findIndex((bar) => bar.id === id);

      if (index % 2 === 1) {
        setOffDuration(values.time);
        setOffLength(values.length);
      } else {
        setOnDuration(values.time);
        setOnLength(values.length);
      }

      for (var i = 0; i < bars.length; i++) {
        if (index % 2 === i % 2) {
          bars[i].time = values.time;
          bars[i].power = values.power;
          bars[i].length = values.length;
          bars[i].cadence = values.cadence;
        }
      }
      var time = 0;
      bars.map((bar) => (time += bar.time));

      var length = 0;
      bars.map((bar) => (length += bar.length || 0));

      handleIntervalChange(intervalId, {
        time: time,
        length: length,
        id: intervalId,
        type: "interval",
        cadence: bars[0].cadence,
        restingCadence: bars[1].cadence,
        pace: pace,
        repeat: nIntervals,
        onDuration: bars[0].time,
        offDuration: bars[1].time,
        onPower: bars[0].power,
        offPower: bars[1].power,
        onLength: bars[0].length,
        offLength: bars[1].length,
      });
    },
    [handleIntervalChange, intervalId, pace, nIntervals]
  );

  const handleBarClick = useCallback(() => {
    handleIntervalClick(intervalId);
  }, [handleIntervalClick, intervalId]);

  function handleAddInterval() {
    setNIntervals(nIntervals + 1);
    var time = 0;
    bars.map((bar) => (time += bar.time));

    props.handleIntervalChange(props.id, {
      time:
        ((props.onDuration || 0) + (props.offDuration || 0)) * (nIntervals + 1),
      length:
        ((props.onLength || 0) + (props.offLength || 0)) * (nIntervals + 1),
      id: props.id,
      type: "interval",
      cadence: props.cadence,
      restingCadence: props.restingCadence,
      pace: props.pace,
      repeat: props.repeat + 1,
      onDuration: props.onDuration,
      offDuration: props.offDuration,
      onPower: props.onPower,
      offPower: props.offPower,
      onLength: props.onLength,
      offLength: props.offLength,
    });
  }

  function handleRemoveInterval() {
    if (nIntervals > 1) {
      setNIntervals(nIntervals - 1);
      var time = 0;
      bars.map((bar) => (time += bar.time));

      props.handleIntervalChange(props.id, {
        time:
          ((props.onDuration || 0) + (props.offDuration || 0)) *
          (nIntervals - 1),
        length:
          ((props.onLength || 0) + (props.offLength || 0)) * (nIntervals - 1),
        id: props.id,
        type: "interval",
        cadence: props.cadence,
        restingCadence: props.restingCadence,
        pace: props.pace,
        repeat: props.repeat - 1,
        onDuration: props.onDuration,
        offDuration: props.offDuration,
        onPower: props.onPower,
        offPower: props.offPower,
        onLength: props.onLength,
        offLength: props.offLength,
      });
    }
  }

  const renderBar = (bar: BarType, withLabel: boolean) => (
    <Bar
      id={bar.id}
      time={bar.time}
      length={bar.length}
      power={bar.power || 100}
      cadence={bar.cadence}
      ftp={props.ftp}
      weight={props.weight}
      sportType={props.sportType}
      durationType={props.durationType}
      paceUnitType={props.paceUnitType}
      pace={props.pace}
      speed={props.speed}
      onChange={handleOnChange}
      onClick={handleBarClick}
      selected={props.selected}
      showLabel={withLabel}
    />
  );

  return (
    <div>
      <div className="buttons">
        <button onClick={handleAddInterval}>+</button>
        <button onClick={handleRemoveInterval}>-</button>
      </div>
      <div className="intervals">
        {bars.map((bar, index) => (
          <React.Fragment key={bar.id || `interval-bar-${index}`}>
            {renderBar(bar, index === 0 || index === bars.length - 1)}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default memo(Interval);
