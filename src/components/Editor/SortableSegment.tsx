import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableSegmentProps {
  id: string;
  children: React.ReactNode;
}

function isNonDraggableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return !!target.closest('input, textarea, select, button, .resize-handle');
}

const SortableSegment: React.FC<SortableSegmentProps> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 20 : undefined,
    position: 'relative',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="sortable-segment"
      {...attributes}
      {...listeners}
      onPointerDown={(event) => {
        if (isNonDraggableTarget(event.target)) return;
        listeners?.onPointerDown?.(event);
      }}
    >
      {children}
    </div>
  );
};

export default SortableSegment;
