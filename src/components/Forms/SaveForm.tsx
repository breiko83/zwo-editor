import React from "react";
import Checkbox from "../Editor/Checkbox";

const DEFAULT_TAGS = ["Recovery", "Intervals", "FTP", "TT"]

interface SaveFormProps {
  name: string;
  description: string;
  author: string;
  tags: string[];
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onAuthorChange: (value: string) => void;
  onTagsChange: (value: string[]) => void;
  onSave: () => void;
  onDismiss: () => void;
  onLogout: () => void;
}

export default function SaveForm(props: SaveFormProps) {
  return (
    <div>
      <h2>Save Workout</h2>
      <div className="form-control">
        <label htmlFor="name">Workout Title</label>
        <input type="text" name="name" placeholder="Workout title" value={props.name} onChange={(e) => props.onNameChange(e.target.value)} />
      </div>
      <div className="form-control">
        <label htmlFor="description">Workout description</label>
        <textarea name="description" placeholder="Workout description" value={props.description} onChange={(e) => props.onDescriptionChange(e.target.value)}></textarea>
      </div>
      <div className="form-control">
        <label htmlFor="author">Workout Author</label>
        <input type="text" name="author" placeholder="Workout Author" value={props.author} onChange={(e) => props.onAuthorChange(e.target.value)} />
      </div>
      <div className="form-control">
        <label htmlFor="author">Workout Tags</label>
        {DEFAULT_TAGS.map(tagName => (
          <Checkbox
            key={tagName}
            label={tagName}
            isSelected={props.tags.includes(tagName)}
            onCheckboxChange={() => props.onTagsChange(addOrRemoveTag(props.tags, tagName))}
          />
        ))}
      </div>
      <div className="form-control">
        <button className="btn btn-primary" onClick={props.onSave}>Save</button>
        <button className="btn" onClick={props.onDismiss}>Dismiss</button>
        <button onClick={props.onLogout}>Logout</button>
      </div>
    </div>
  )
}

function addOrRemoveTag(tags: string[], tagName: string): string[] {
  if (tags.includes(tagName)) {
    return tags.filter(item => item !== tagName)
  } else {
    return [...tags, tagName]
  }
}
