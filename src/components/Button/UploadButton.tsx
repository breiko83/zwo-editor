import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";

interface UploadButtonProps {
  onUpload: (file: File) => void;
}

const UploadButton: React.FC<UploadButtonProps> = ({ onUpload }) => {
  return (
    <>
      <input
        accept=".xml,.zwo"
        id="contained-button-file"
        type="file"
        style={{ display: 'none' }}
        onChange={(e) => onUpload(e.target.files![0])}
      />
      <button className="btn" onClick={() => document.getElementById("contained-button-file")!.click()}>
        <FontAwesomeIcon icon={faUpload} size="lg" fixedWidth /> Upload
      </button>
    </>
  );
};

export default UploadButton;
