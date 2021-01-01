import React from "react";

// Component which captures key press events

interface KeyboardProps {
  className?: string;
  onBackspacePress: () => void;
  onDownPress: () => void;
  onUpPress: () => void;
  onLeftPress: () => void;
  onRightPress: () => void;
}

const Keyboard: React.FC<KeyboardProps> = (props) => {
  function handleKeyPress(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.target instanceof HTMLInputElement) {
      // Ignore key presses coming from input elements
      return;
    }

    switch (event.keyCode) {
      case 8:
        props.onBackspacePress();
        // Prevent navigation to previous page
        event.preventDefault()
        break;
      case 37:
        props.onLeftPress();
        break;
      case 39:
        props.onRightPress();
        break;
      case 38:
        props.onDownPress();
        break;
      case 40:
        props.onUpPress();
        break;
    }
  }

  return (
    // Adding tabIndex allows div element to receive keyboard events
    <div className={props.className} onKeyDown={handleKeyPress} tabIndex={0}>{props.children}</div>
  );
};

export default Keyboard;
