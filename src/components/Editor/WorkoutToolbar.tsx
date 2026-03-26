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
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
      <button
        className="btn"
        onClick={() => {
          if (window.confirm('Are you sure you want to create a new workout?'))
            onNew();
        }}
        style={{
          backgroundColor: 'white',
          padding: '10px 15px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        title="Create a new workout"
      >
        <FontAwesomeIcon icon={faFile} size="lg" fixedWidth /> New
      </button>

      <button
        className="btn"
        onClick={onDownload}
        style={{
          backgroundColor: 'white',
          padding: '10px 15px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        title="Download workout file"
      >
        <FontAwesomeIcon icon={faDownload} size="lg" fixedWidth /> Download
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
        style={{
          backgroundColor: 'white',
          padding: '10px 15px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        title="Import workout file"
      >
        <FontAwesomeIcon icon={faUpload} size="lg" fixedWidth /> Import
      </button>
    </div>
  );
};

export default WorkoutToolbar;
