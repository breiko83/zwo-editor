import { useState, useEffect, useRef, useCallback } from 'react';
import { BarType, Instruction } from '../../../types/workout';

export interface WorkoutSnapshot {
  bars: BarType[];
  instructions: Instruction[];
  name: string;
  description: string;
  author: string;
  tags: string[];
}

interface WorkoutHistoryProps extends WorkoutSnapshot {
  restore: (snapshot: WorkoutSnapshot) => void;
}

// Maximum number of undo steps kept in memory
export const HISTORY_LIMIT = 100;
// Changes that follow each other within this window (e.g. while dragging to
// resize a segment) are grouped into a single undo step
export const HISTORY_COALESCE_MS = 500;

const sameSnapshot = (a: WorkoutSnapshot, b: WorkoutSnapshot) =>
  a.bars === b.bars &&
  a.instructions === b.instructions &&
  a.name === b.name &&
  a.description === b.description &&
  a.author === b.author &&
  a.tags === b.tags;

/**
 * Custom hook tracking workout changes to provide undo / redo.
 * Snapshots are compared by reference, so state must be updated immutably.
 */
export const useWorkoutHistory = ({
  bars,
  instructions,
  name,
  description,
  author,
  tags,
  restore,
}: WorkoutHistoryProps) => {
  const current: WorkoutSnapshot = { bars, instructions, name, description, author, tags };

  const past = useRef<WorkoutSnapshot[]>([]);
  const future = useRef<WorkoutSnapshot[]>([]);
  const previous = useRef<WorkoutSnapshot>(current);
  const lastChangeAt = useRef(0);
  // Snapshot being restored by undo / redo, so it's not recorded as a new change
  const pendingRestore = useRef<WorkoutSnapshot | null>(null);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  // Incremented on every undo / redo, used to remount components holding local state
  const [revision, setRevision] = useState(0);

  const updateFlags = () => {
    setCanUndo(past.current.length > 0);
    setCanRedo(future.current.length > 0);
  };

  useEffect(() => {
    const snapshot: WorkoutSnapshot = { bars, instructions, name, description, author, tags };

    if (pendingRestore.current) {
      previous.current = snapshot;
      if (sameSnapshot(snapshot, pendingRestore.current)) {
        pendingRestore.current = null;
      }
      return;
    }

    if (sameSnapshot(snapshot, previous.current)) return;

    const now = Date.now();
    if (now - lastChangeAt.current > HISTORY_COALESCE_MS) {
      past.current = [...past.current, previous.current].slice(-HISTORY_LIMIT);
    }
    lastChangeAt.current = now;
    future.current = [];
    previous.current = snapshot;
    updateFlags();
  }, [bars, instructions, name, description, author, tags]);

  const applySnapshot = (snapshot: WorkoutSnapshot) => {
    // a restored state always starts a new undo step
    lastChangeAt.current = 0;
    if (!sameSnapshot(snapshot, previous.current)) {
      pendingRestore.current = snapshot;
      restore(snapshot);
    }
    setRevision((r) => r + 1);
    updateFlags();
  };

  const undo = useCallback(() => {
    const snapshot = past.current[past.current.length - 1];
    if (!snapshot) return;
    past.current = past.current.slice(0, -1);
    future.current = [...future.current, previous.current];
    applySnapshot(snapshot);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restore]);

  const redo = useCallback(() => {
    const snapshot = future.current[future.current.length - 1];
    if (!snapshot) return;
    future.current = future.current.slice(0, -1);
    past.current = [...past.current, previous.current];
    applySnapshot(snapshot);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restore]);

  return { undo, redo, canUndo, canRedo, revision };
};
