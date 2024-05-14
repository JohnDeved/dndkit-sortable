import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './App.css';

interface SortableItemProps {
  id: UniqueIdentifier;
}

const SortableItem: React.FC<SortableItemProps> = ({ id }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: '10px',
    margin: '5px 0',
    backgroundColor: isDragging ? 'lightgreen' : 'lightcoral',
    cursor: 'pointer',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {id}
    </div>
  );
};

const App: React.FC = () => {
  const [items1, setItems1] = useState<UniqueIdentifier[]>(['Item 1', 'Item 2', 'Item 3']);
  const [items2, setItems2] = useState<UniqueIdentifier[]>(['Item 4', 'Item 5', 'Item 6']);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      if (items1.includes(active.id)) {
        setItems1((prevItems) => arrayMove(prevItems, prevItems.indexOf(active.id), prevItems.indexOf(over.id)));
      } else {
        setItems2((prevItems) => arrayMove(prevItems, prevItems.indexOf(active.id), prevItems.indexOf(over.id)));
      }
    }

    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="container">
        <SortableContext items={items1} strategy={rectSortingStrategy}>
          <div className="sortable-list">
            {items1.map((id) => (
              <SortableItem key={id} id={id} />
            ))}
          </div>
        </SortableContext>

        <SortableContext items={items2} strategy={rectSortingStrategy}>
          <div className="sortable-list">
            {items2.map((id) => (
              <SortableItem key={id} id={id} />
            ))}
          </div>
        </SortableContext>
      </div>
      <DragOverlay>{activeId ? <SortableItem id={activeId} /> : null}</DragOverlay>
    </DndContext>
  );
};

export default App;
