import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faArrowRight,
  faTrash,
  faCopy,
  faPen,
} from '@fortawesome/free-solid-svg-icons';
import ReactTooltip from 'react-tooltip';
import { Colors, Zones } from '../Constants';
import { BarType, Instruction, SportType, DurationType } from './Editor';
import TimeAxis from './TimeAxis';
import DistanceAxis from './DistanceAxis';
import ZoneAxis from './ZoneAxis';
import './Editor.css';

interface WorkoutCanvasProps {
  bars: BarType[];
  instructions: Instruction[];
  actionId: string | undefined;
  sportType: SportType;
  durationType: DurationType;
  segmentsWidth: number;
  canvasRef: React.RefObject<HTMLDivElement>;
  segmentsRef: React.RefObject<HTMLDivElement>;
  textEditorIsVisible: boolean;
  
  // Actions
  setActionId: (id: string | undefined) => void;
  moveLeft: (id: string) => void;
  moveRight: (id: string) => void;
  removeBar: (id: string) => void;
  duplicateBar: (id: string) => void;
  getPace: (id: string) => number;
  setPace: (pace: string, id: string) => void;
  addBar: (power?: number, duration?: number, cadence?: number, pace?: number, length?: number) => void;
  toggleTextEditor: () => void;
  
  // Render functions
  renderBar: (bar: BarType) => JSX.Element | false;
  renderTrapeze: (bar: BarType) => JSX.Element | false;
  renderFreeRide: (bar: BarType) => JSX.Element | false;
  renderInterval: (bar: BarType) => JSX.Element | false;
  renderComment: (instruction: Instruction, index: number) => JSX.Element | false;
}

const WorkoutCanvas: React.FC<WorkoutCanvasProps> = ({
  bars,
  instructions,
  actionId,
  sportType,
  durationType,
  segmentsWidth,
  canvasRef,
  segmentsRef,
  textEditorIsVisible,
  setActionId,
  moveLeft,
  moveRight,
  removeBar,
  duplicateBar,
  getPace,
  setPace,
  addBar,
  toggleTextEditor,
  renderBar,
  renderTrapeze,
  renderFreeRide,
  renderInterval,
  renderComment,
}) => {
  return (
    <>
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
            {sportType === 'run' && (
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
              if (bar.type === 'bar') {
                return renderBar(bar);
              } else if (bar.type === 'trapeze') {
                return renderTrapeze(bar);
              } else if (bar.type === 'freeRide') {
                return renderFreeRide(bar);
              } else if (bar.type === 'interval') {
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

          {durationType === 'time' ? (
            <TimeAxis width={segmentsWidth} />
          ) : (
            <DistanceAxis width={segmentsWidth} />
          )}
        </div>

        <ZoneAxis />
      </div>
      
      <div className="cta">
        {sportType === 'bike' ? (
          <div>
            <ReactTooltip effect="solid" />
            <button
              className="btn btn-square"
              onClick={() => toggleTextEditor()}
              style={{ backgroundColor: 'palevioletred' }}
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
          >
            + Add bar
          </button>
        )}
      </div>
    </>
  );
};

export default WorkoutCanvas;
