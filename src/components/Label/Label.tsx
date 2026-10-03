import React, { useLayoutEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt, faClock, faRuler } from "@fortawesome/free-solid-svg-icons";
import "./Label.css";
import helpers from "../helpers";
import { PaceUnitType } from "../../types/workout";

const PowerInput = (props: { name: string; value: number; onCommit: Function }) => {
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    if (draft === null) return;
    const watts = parseInt(draft);
    if (watts > 0) props.onCommit(watts);
    setDraft(null);
  };

  return (
    <input
      type="number"
      min="0"
      step="1"
      name={props.name}
      value={draft !== null ? draft : props.value}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") setDraft(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
      className="textField cadence"
    />
  );
};

const Label = (props: {
  sportType: string;
  duration: string;
  distance?: number;
  power?: number;
  powerStart?: number;
  powerEnd?: number;
  weight?: number;
  ftp?: number;
  pace?: number;
  cadence?: number;
  setCadence?: Function;
  setPower?: Function;
  setPowerStart?: Function;
  setPowerEnd?: Function;
  speed?: number;
  speedStart?: number;
  speedEnd?: number;
  paceUnitType?: PaceUnitType;
  incline?: number;
  setIncline?: Function;
}) => {
  const paces = ["1M", "5K", "10K", "HM", "M"];

  const ref = useRef<HTMLDivElement>(null);
  const [insideTop, setInsideTop] = useState<number | null>(null);
  const inside = insideTop !== null;

  useLayoutEffect(() => {
    const label = ref.current;
    const canvas = label?.closest(".canvas");
    const segment = label?.closest(".segment");
    if (!label || !canvas || !segment || inside) return;
    if (label.getBoundingClientRect().top < canvas.getBoundingClientRect().top) {
      const segmentTop = segment.getBoundingClientRect().top;
      const handleBottoms = Array.from(segment.querySelectorAll(".resize-handle-top")).map(
        (handle) => handle.getBoundingClientRect().bottom - segmentTop
      );
      setInsideTop(Math.max(7, ...handleBottoms) + 2);
    }
  }, [inside, props.power, props.powerStart, props.powerEnd]);

  return (
    <div
      ref={ref}
      className={`label ${props.sportType === "bike" ? "label-bike" : "label-run"}${inside ? " label-inside" : ""}`}
      style={inside ? { top: insideTop as number } : undefined}
    >
      {props.duration && props.duration !== "00:00" && (
        <div>
          <FontAwesomeIcon icon={faClock} fixedWidth /> {props.duration}
        </div>
      )}
      {props.power && props.sportType === "bike" && (
        props.setPower ? (
          <div className="cadence-row">
            <label className="cadenceLabel">
              <FontAwesomeIcon icon={faBolt} fixedWidth /> Power
            </label>
            <PowerInput name="power" value={props.power} onCommit={props.setPower} />
            <span>W</span>
          </div>
        ) : (
          <div>
            <FontAwesomeIcon icon={faBolt} fixedWidth /> {props.power}W
          </div>
        )
      )}
      {props.powerStart && props.powerEnd && props.sportType === "bike" && (
        props.setPowerStart && props.setPowerEnd ? (
          <div className="cadence-row power-range-row">
            <FontAwesomeIcon icon={faBolt} fixedWidth />
            <PowerInput name="powerStart" value={props.powerStart} onCommit={props.setPowerStart} />
            <span>W -</span>
            <PowerInput name="powerEnd" value={props.powerEnd} onCommit={props.setPowerEnd} />
            <span>W</span>
          </div>
        ) : (
          <div>
            <FontAwesomeIcon icon={faBolt} fixedWidth /> {props.powerStart}W -{" "}
            {props.powerEnd}W
          </div>
        )
      )}
      {props.weight && props.power && props.ftp && props.sportType === "bike" && (
        <div>
          {(props.power / props.weight).toFixed(1)}W/Kg &middot;{" "}
          {((props.power / props.ftp) * 100).toFixed(0)}% FTP
        </div>
      )}
      {props.powerStart &&
        props.powerEnd &&
        props.ftp &&
        props.sportType === "bike" && (
          <div>
            {((props.powerStart / props.ftp) * 100).toFixed(0)}% FTP -{" "}
            {((props.powerEnd / props.ftp) * 100).toFixed(0)}% FTP
          </div>
        )}
      {props.sportType === "run" &&
        props.distance !== undefined &&
        props.distance !== 0 && (
          <div>
            <FontAwesomeIcon icon={faRuler} fixedWidth />{" "}
            {props.distance.toFixed(0)} m
          </div>
        )}
      {props.power &&
        props.ftp &&
        props.pace !== null &&
        props.sportType === "run" && (
          <div>
            {((props.power / props.ftp) * 100).toFixed(1).replace(/[.]0$/, "")}%{" "}
            {paces[props.pace || 0]} pace
          </div>
        )}
      {props.powerStart &&
        props.powerEnd &&
        props.ftp &&
        props.pace !== null &&
        props.sportType === "run" && (
          <div>
            {((props.powerStart / props.ftp) * 100).toFixed(0)}% to{" "}
            {((props.powerEnd / props.ftp) * 100).toFixed(0)}%{" "}
            {paces[props.pace || 0]} pace
          </div>
        )}
      {props.sportType === "bike" && (
        <div className="cadence-row">
          <label className="cadenceLabel">Cadence</label>
          <input
            type="number"
            min="40"
            max="150"
            step="5"
            name="cadence"
            value={props.cadence || ""}
            onChange={(e) => {
              if (props.setCadence) props.setCadence(parseInt(e.target.value));
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="textField cadence"
          />
        </div>
      )}
      {props.sportType === "run" && props.speed && props.paceUnitType && (
        <div>
          <div>
            {props.paceUnitType === "metric"
              ? `${props.speed?.toFixed(1)} km/h`
              : `${helpers.kphToMph(props.speed).toFixed(1)} mph`}
          </div>
          <div>{helpers.speedToPace(props.speed, props.paceUnitType)} { props.paceUnitType === "metric" ? "min/km" : "min/mi" }</div>
        </div>
      )}
      {props.sportType === "run" && props.speedStart && props.speedEnd && props.paceUnitType && (
        <div>
        <div>
          {props.paceUnitType === "metric"
            ? `${props.speedStart?.toFixed(1)} km/h - ${props.speedEnd?.toFixed(1)} km/h`
            : `${helpers.kphToMph(props.speedStart).toFixed(1)} mph - ${helpers.kphToMph(props.speedEnd).toFixed(1)} mph`}
        </div>
        <div>{helpers.speedToPace(props.speedStart, props.paceUnitType)} - {helpers.speedToPace(props.speedEnd, props.paceUnitType)} { props.paceUnitType === "metric" ? "min/km" : "min/mi" }</div>
        </div>
      )}
      {props.sportType === "run" && (
        <div className="cadence-row">
          <label className="cadenceLabel">Incline</label>
          <input
            type="number"
            min="-100"
            max="100"
            step="1"
            name="incline"
            value={props.incline}
            onChange={(e) => {
              if (props.setIncline) {
                props.setIncline(e.target.value);
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="textField cadence"
          />
          <span>%</span>
        </div>
      )}
    </div>
  );
};

export default Label;

