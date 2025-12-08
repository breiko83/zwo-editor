import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faArrowRight,
  faTrash,
  faCopy,
  faPen,
  faComment,
  faBicycle,
  faRunning,
} from '@fortawesome/free-solid-svg-icons';
import ReactTooltip from 'react-tooltip';
import { Colors, Zones } from '../Constants';
import { ReactComponent as SteadyLogo } from '../../assets/steady.svg';
import { ReactComponent as WarmupLogo } from '../../assets/warmup.svg';
import { ReactComponent as WarmdownLogo } from '../../assets/warmdown.svg';
import { ReactComponent as IntervalLogo } from '../../assets/interval.svg';
import { BarType, Instruction, SportType, DurationType } from '../../types/workout';
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
  addTrapeze: (startPower: number, endPower: number) => void;
  addInterval: () => void;
  addFreeRide: () => void;
  addInstruction: () => void;
  
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
  setActionId,
  moveLeft,
  moveRight,
  removeBar,
  duplicateBar,
  getPace,
  setPace,
  addBar,
  toggleTextEditor,
  addTrapeze,
  addInterval,
  addFreeRide,
  addInstruction,
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
            {bars.map((bar, index) => {
              const key = bar.id || `bar-${index}`;
              if (bar.type === 'bar') {
                return <React.Fragment key={key}>{renderBar(bar)}</React.Fragment>;
              } else if (bar.type === 'trapeze') {
                return <React.Fragment key={key}>{renderTrapeze(bar)}</React.Fragment>;
              } else if (bar.type === 'freeRide') {
                return <React.Fragment key={key}>{renderFreeRide(bar)}</React.Fragment>;
              } else if (bar.type === 'interval') {
                return <React.Fragment key={key}>{renderInterval(bar)}</React.Fragment>;
              }
              return null;
            })}
          </div>

          <div className="slider">
            {instructions.map((instruction, index) => (
              <React.Fragment key={instruction.id || `instruction-${index}`}>{renderComment(instruction, index)}</React.Fragment>
            ))}
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
        <ReactTooltip effect="solid" />
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
          {sportType === 'bike' && (
            <>
              <button
                className="btn btn-square"
                onClick={() => toggleTextEditor()}
                style={{ backgroundColor: 'palevioletred' }}
                data-tip="New! Workout text editor!"
                title="Text Editor"
              >
                <FontAwesomeIcon icon={faPen} fixedWidth />
              </button>
              <div style={{ 
                display: 'flex', 
                gap: '5px', 
                padding: '5px', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '8px',
                border: '1px solid #e0e0e0'
              }}>
                <button
                  className="btn btn-square"
                  onClick={() => addBar(0.5)}
                  style={{ backgroundColor: Colors.GRAY, fontWeight: 'bold', fontSize: '14px' }}
                  title="Zone 1"
                >
                  Z1
                </button>
                <button
                  className="btn btn-square"
                  onClick={() => addBar(Zones.Z2.min)}
                  style={{ backgroundColor: Colors.BLUE, fontWeight: 'bold', fontSize: '14px' }}
                  title="Zone 2"
                >
                  Z2
                </button>
                <button
                  className="btn btn-square"
                  onClick={() => addBar(Zones.Z3.min)}
                  style={{ backgroundColor: Colors.GREEN, fontWeight: 'bold', fontSize: '14px' }}
                  title="Zone 3"
                >
                  Z3
                </button>
                <button
                  className="btn btn-square"
                  onClick={() => addBar(Zones.Z4.min)}
                  style={{ backgroundColor: Colors.YELLOW, fontWeight: 'bold', fontSize: '14px' }}
                  title="Zone 4"
                >
                  Z4
                </button>
                <button
                  className="btn btn-square"
                  onClick={() => addBar(Zones.Z5.min)}
                  style={{ backgroundColor: Colors.ORANGE, fontWeight: 'bold', fontSize: '14px' }}
                  title="Zone 5"
                >
                  Z5
                </button>
                <button
                  className="btn btn-square"
                  onClick={() => addBar(Zones.Z6.min)}
                  style={{ backgroundColor: Colors.RED, fontWeight: 'bold', fontSize: '14px' }}
                  title="Zone 6"
                >
                  Z6
                </button>
              </div>
            </>
          )}
          
          {sportType === 'run' && (
            <button
              className="btn"
              onClick={() => addBar(1, 300, 0, 0, 1000)}
              style={{ 
                backgroundColor: Colors.WHITE, 
                padding: '10px 15px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              title="Steady Pace"
            >
              <SteadyLogo className="btn-icon" /> Steady Pace
            </button>
          )}

          <button
            className="btn"
            onClick={() => addTrapeze(0.25, 0.75)}
            style={{ 
              backgroundColor: Colors.WHITE,
              padding: '10px 15px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            title="Warm up"
          >
            <WarmupLogo className="btn-icon" /> Warm up
          </button>
          <button
            className="btn"
            onClick={() => addTrapeze(0.75, 0.25)}
            style={{ 
              backgroundColor: Colors.WHITE,
              padding: '10px 15px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            title="Cool down"
          >
            <WarmdownLogo className="btn-icon" /> Cool down
          </button>
          <button
            className="btn"
            onClick={() => addInterval()}
            style={{ 
              backgroundColor: Colors.WHITE,
              padding: '10px 15px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            title="Interval"
          >
            <IntervalLogo className="btn-icon" /> Interval
          </button>
          <button
            className="btn"
            onClick={() => addFreeRide()}
            style={{ 
              backgroundColor: Colors.WHITE,
              padding: '10px 15px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            title={`Free ${sportType === 'bike' ? 'Ride' : 'Run'}`}
          >
            <FontAwesomeIcon
              icon={sportType === 'bike' ? faBicycle : faRunning}
              size="lg"
              fixedWidth
            />
            Free {sportType === 'bike' ? 'Ride' : 'Run'}
          </button>
          <button
            className="btn"
            onClick={() => addInstruction()}
            style={{ 
              backgroundColor: Colors.WHITE,
              padding: '10px 15px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            title="Text Event"
          >
            <FontAwesomeIcon icon={faComment} size="lg" fixedWidth /> Text Event
          </button>
        </div>
      </div>
    </>
  );
};

export default WorkoutCanvas;
