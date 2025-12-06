import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFile,
  faSave,
  faTrash,
  faDownload,
  faUpload,
  faShareAlt,
  faList,
} from '@fortawesome/free-solid-svg-icons';

interface WorkoutToolbarProps {
  onNew: () => void;
  onSave: () => void;
  onDelete: () => void;
  onDownload: () => void;
  onUpload: (file: File) => void;
  onShare: () => void;
  onWorkouts: () => void;
}

const WorkoutToolbar: React.FC<WorkoutToolbarProps> = ({
  onNew,
  onSave,
  onDelete,
  onDownload,
  onUpload,
  onShare,
  onWorkouts,
}) => {
  return (
    <div className="action-buttons">
      <button
        className="btn"
        onClick={() => {
          if (window.confirm('Are you sure you want to create a new workout?'))
            onNew();
        }}
      >
        <FontAwesomeIcon icon={faFile} size="lg" fixedWidth /> New
      </button>
      
      <button className="btn" onClick={onSave}>
        <FontAwesomeIcon icon={faSave} size="lg" fixedWidth /> Save
      </button>
      
      <button
        className="btn"
        onClick={() => {
          if (window.confirm('Are you sure you want to delete this workout?'))
            onDelete();
        }}
      >
        <FontAwesomeIcon icon={faTrash} size="lg" fixedWidth /> Delete
      </button>
      
      <button className="btn" onClick={onDownload}>
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
      >
        <FontAwesomeIcon icon={faUpload} size="lg" fixedWidth /> Upload
      </button>
      
      <button className="btn" onClick={onWorkouts}>
        <FontAwesomeIcon icon={faList} size="lg" fixedWidth /> Workouts
      </button>
      
      <button className="btn" onClick={onShare}>
        <FontAwesomeIcon icon={faShareAlt} size="lg" fixedWidth /> Share
      </button>
    </div>
  );
};

export default WorkoutToolbar;
