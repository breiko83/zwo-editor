import React from "react";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import IconButton from "./IconButton";

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
      <IconButton label="Upload" icon={faUpload} onClick={() => document.getElementById("contained-button-file")!.click()} />
    </>
  );
};

export default UploadButton;
