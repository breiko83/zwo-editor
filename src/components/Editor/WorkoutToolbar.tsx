import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFile,
  faDownload,
  faUpload,
  faUndo,
  faRedo,
} from '@fortawesome/free-solid-svg-icons';

interface WorkoutToolbarProps {
  onNew: () => void;
  onDownload: () => void;
  onUpload: (file: File) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const WorkoutToolbar: React.FC<WorkoutToolbarProps> = ({
  onNew,
  onDownload,
  onUpload,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}) => {
  const isMac =
    typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
  const modifier = isMac ? '⌘' : 'Ctrl+';

  return (
    <>
      {onUndo && (
        <button
          className="btn"
          onClick={onUndo}
          disabled={!canUndo}
          title={`Undo (${modifier}Z)`}
        >
          <FontAwesomeIcon icon={faUndo} fixedWidth /> Undo
        </button>
      )}
      {onRedo && (
        <button
          className="btn"
          onClick={onRedo}
          disabled={!canRedo}
          title={`Redo (${isMac ? '⌘⇧Z' : 'Ctrl+Y'})`}
        >
          <FontAwesomeIcon icon={faRedo} fixedWidth /> Redo
        </button>
      )}
      <button
        className="btn"
        onClick={() => {
          if (window.confirm('Are you sure you want to create a new workout?'))
            onNew();
        }}
        title="Create a new workout"
      >
        <FontAwesomeIcon icon={faFile} fixedWidth /> New
      </button>

      <button
        className="btn"
        onClick={onDownload}
        title="Download workout file"
      >
        <FontAwesomeIcon icon={faDownload} fixedWidth /> Download
      </button>

      <input
        accept=".xml,.zwo"
        id="contained-button-file"
        type="file"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            onUpload(e.target.files[0]);
          }
        }}
      />
      <button
        className="btn"
        onClick={() => document.getElementById('contained-button-file')!.click()}
        title="Import workout file"
      >
        <FontAwesomeIcon icon={faUpload} fixedWidth /> Import
      </button>
    </>
  );
};

export default WorkoutToolbar;
