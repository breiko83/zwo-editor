import React from "react";

// Displays workut name, description & author

interface TitleProps {
  name: string;
  description: string;
  author: string;
}

const Title: React.FC<TitleProps> = ({ name, author, description }) => {
  return (
    <div className="title">
      <h1>{name}</h1>
      <div className="description">{description}</div>
      <p>{author ? `by ${author}` : ''}</p>
    </div>
  );
};

export default Title;
