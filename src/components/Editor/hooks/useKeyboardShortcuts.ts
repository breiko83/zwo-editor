import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  actionId: string | undefined;
  removeBar: (id: string) => void;
  addTimeToBar: (id: string) => void;
  removeTimeToBar: (id: string) => void;
  addPowerToBar: (id: string) => void;
  removePowerToBar: (id: string) => void;
  undo?: () => void;
  redo?: () => void;
}

/**
 * Custom hook for keyboard shortcuts
 */
export const useKeyboardShortcuts = ({
  actionId,
  removeBar,
  addTimeToBar,
  removeTimeToBar,
  addPowerToBar,
  removePowerToBar,
  undo,
  redo,
}: KeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignore key presses from input and textarea elements
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Undo: Ctrl/Cmd+Z - Redo: Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y
      if ((event.ctrlKey || event.metaKey) && !event.altKey) {
        const key = (event.key || '').toLowerCase();
        if (key === 'z' && !event.shiftKey && undo) {
          undo();
          event.preventDefault();
          return;
        }
        if (((key === 'z' && event.shiftKey) || key === 'y') && redo) {
          redo();
          event.preventDefault();
          return;
        }
      }

      if (!actionId) return;

      switch (event.keyCode) {
        case 8: // Backspace
          removeBar(actionId);
          event.preventDefault(); // Prevent navigation to previous page
          break;
        case 37: // Left arrow - reduce time
          removeTimeToBar(actionId);
          break;
        case 39: // Right arrow - add time
          addTimeToBar(actionId);
          break;
        case 38: // Up arrow - add power
          addPowerToBar(actionId);
          break;
        case 40: // Down arrow - remove power
          removePowerToBar(actionId);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [actionId, removeBar, addTimeToBar, removeTimeToBar, addPowerToBar, removePowerToBar, undo, redo]);
};
