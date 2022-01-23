import React, {Dispatch, SetStateAction, useState} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt, faClock, faRuler, faWindowClose } from "@fortawesome/free-solid-svg-icons";
import "./Label.css";

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
  speed?: number;
  speedStart?: number;
  speedEnd?: number;
  onClose: () => void;
}) => {
  const paces = ["1M", "5K", "10K", "HM", "M"];
  return (
    <div className="label">
      <div style={{position: 'absolute', right: "3px", top: "0"}} onClick={props.onClose}><FontAwesomeIcon icon={faWindowClose} /></div>
      {props.duration && props.duration !== '00:00' && (
        <div>
          <FontAwesomeIcon icon={faClock} fixedWidth /> {props.duration}
        </div>
      )}
      {props.power && props.sportType === "bike" && (
        <div>
          <FontAwesomeIcon icon={faBolt} fixedWidth /> {props.power}W
        </div>
      )}
      {props.powerStart && props.powerEnd && props.sportType === "bike" && (
        <div>
          <FontAwesomeIcon icon={faBolt} fixedWidth /> {props.powerStart}W -{" "}
          {props.powerEnd}W
        </div>
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
      {props.sportType === "run" && props.distance !== undefined && props.distance !== 0 && (
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
      {props.sportType === "run" && props.speed && (
        <div>{props.speed?.toFixed(1)} Km/h</div>
      )}
      {props.sportType === "run" && props.speedStart && props.speedEnd && (
        <div>
          {props.speedStart?.toFixed(1)} Km/h - {props.speedEnd?.toFixed(1)}{" "}
          Km/h
        </div>
      )}
    </div>
  );
};

export default Label;
