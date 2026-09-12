import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFile,
  faDownload,
  faUpload,
} from '@fortawesome/free-solid-svg-icons';

interface WorkoutToolbarProps {
  onNew: () => void;
  onDownload: () => void;
  onUpload: (file: File) => void;
}

const WorkoutToolbar: React.FC<WorkoutToolbarProps> = ({
  onNew,
  onDownload,
  onUpload,
}) => {
  return (
    <>
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
