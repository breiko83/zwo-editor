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
        onClick={onSave}
        style={{
          backgroundColor: 'white',
          padding: '10px 15px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        title="Save workout"
      >
        <FontAwesomeIcon icon={faSave} size="lg" fixedWidth /> Save
      </button>
      
      <button
        className="btn"
        onClick={() => {
          if (window.confirm('Are you sure you want to delete this workout?'))
            onDelete();
        }}
        style={{
          backgroundColor: 'white',
          padding: '10px 15px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        title="Delete workout"
      >
        <FontAwesomeIcon icon={faTrash} size="lg" fixedWidth /> Delete
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
        title="Upload workout file"
      >
        <FontAwesomeIcon icon={faUpload} size="lg" fixedWidth /> Upload
      </button>
      
      <button 
        className="btn" 
        onClick={onWorkouts}
        style={{
          backgroundColor: 'white',
          padding: '10px 15px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        title="View your workouts"
      >
        <FontAwesomeIcon icon={faList} size="lg" fixedWidth /> Workouts
      </button>
      
      <button 
        className="btn" 
        onClick={onShare}
        style={{
          backgroundColor: 'white',
          padding: '10px 15px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        title="Share workout"
      >
        <FontAwesomeIcon icon={faShareAlt} size="lg" fixedWidth /> Share
      </button>
    </div>
  );
};

export default WorkoutToolbar;
