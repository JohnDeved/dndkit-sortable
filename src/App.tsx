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

  const findContainer = (id: UniqueIdentifier) => {
    if (items1.includes(id)) {
      return 'items1';
    }
    if (items2.includes(id)) {
      return 'items2';
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);

    if (activeContainer === overContainer) {
      if (activeContainer === 'items1') {
        setItems1((items) => arrayMove(items, items.indexOf(active.id), items.indexOf(over.id)));
      } else {
        setItems2((items) => arrayMove(items, items.indexOf(active.id), items.indexOf(over.id)));
      }
    } else {
      if (activeContainer === 'items1') {
        setItems1((items) => items.filter((item) => item !== active.id));
        setItems2((items) => {
          const newIndex = over.id ? items.indexOf(over.id) : items.length;
          return [...items.slice(0, newIndex), active.id, ...items.slice(newIndex)];
        });
      } else {
        setItems2((items) => items.filter((item) => item !== active.id));
        setItems1((items) => {
          const newIndex = over.id ? items.indexOf(over.id) : items.length;
          return [...items.slice(0, newIndex), active.id, ...items.slice(newIndex)];
        });
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
