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
  DragOverEvent,
  defaultDropAnimation,
  DropAnimation,
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
  id: string;
}

const SortableItem: React.FC<SortableItemProps> = ({ id }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

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

const dropAnimationConfig: DropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.5,
};

const App: React.FC = () => {
  const [items1, setItems1] = useState<UniqueIdentifier[]>(['Item 1', 'Item 2', 'Item 3']);
  const [items2, setItems2] = useState<UniqueIdentifier[]>(['Item 4', 'Item 5', 'Item 6']);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [activeContainer, setActiveContainer] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findContainer = (id: UniqueIdentifier) => {
    if (items1.includes(id)) {
      return 'items1';
    } else if (items2.includes(id)) {
      return 'items2';
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as UniqueIdentifier);
    setActiveContainer(findContainer(event.active.id as UniqueIdentifier));
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      setOverId(null);
      return;
    }
    setOverId(over.id as UniqueIdentifier);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      setOverId(null);
      setActiveContainer(null);
      return;
    }

    const activeContainer = findContainer(active.id as UniqueIdentifier);
    const overContainer = findContainer(over.id as UniqueIdentifier);

    if (!activeContainer || !overContainer) {
      setActiveId(null);
      setOverId(null);
      setActiveContainer(null);
      return;
    }

    if (activeContainer === overContainer) {
      if (active.id !== over.id) {
        if (activeContainer === 'items1') {
          setItems1((prevItems) => {
            const activeIndex = prevItems.indexOf(active.id as UniqueIdentifier);
            const overIndex = prevItems.indexOf(over.id as UniqueIdentifier);
            return arrayMove(prevItems, activeIndex, overIndex);
          });
        } else {
          setItems2((prevItems) => {
            const activeIndex = prevItems.indexOf(active.id as UniqueIdentifier);
            const overIndex = prevItems.indexOf(over.id as UniqueIdentifier);
            return arrayMove(prevItems, activeIndex, overIndex);
          });
        }
      }
    } else {
      if (activeContainer === 'items1') {
        setItems1((prevItems) => prevItems.filter((item) => item !== active.id));
        const overIndex = over.id ? items2.indexOf(over.id as UniqueIdentifier) : items2.length;
        setItems2((prevItems) => [
          ...prevItems.slice(0, overIndex),
          active.id,
          ...prevItems.slice(overIndex),
        ]);
      } else {
        setItems2((prevItems) => prevItems.filter((item) => item !== active.id));
        const overIndex = over.id ? items1.indexOf(over.id as UniqueIdentifier) : items1.length;
        setItems1((prevItems) => [
          ...prevItems.slice(0, overIndex),
          active.id,
          ...prevItems.slice(overIndex),
        ]);
      }
    }

    setActiveId(null);
    setOverId(null);
    setActiveContainer(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
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
      <DragOverlay dropAnimation={dropAnimationConfig}>
        {activeId ? <SortableItem id={activeId} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default App;
