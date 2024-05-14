import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  UniqueIdentifier,
  useDroppable,
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

const SortableItem: React.FC<{ id: UniqueIdentifier }> = ({ id }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`sortable-item ${isDragging ? 'dragging' : ''}`}
      {...attributes}
      {...listeners}
    >
      {id}
    </div>
  );
};

interface DroppableContainerProps {
  id: string;
  items: UniqueIdentifier[];
  children: React.ReactNode;
  isOver: boolean;
  setNodeRef: (element: HTMLElement | null) => void;
}

const DroppableContainer: React.FC<DroppableContainerProps> = ({ id, items, children, isOver, setNodeRef }) => {
  const style = {
    backgroundColor: isOver ? 'lightblue' : undefined,
  };

  return (
    <div ref={setNodeRef} className="sortable-list" style={style}>
      <SortableContext items={items} strategy={rectSortingStrategy}>
        {children}
        {items.length === 0 && <div className="placeholder">Drop items here</div>}
      </SortableContext>
    </div>
  );
};

const App: React.FC = () => {
  const [items1, setItems1] = useState<UniqueIdentifier[]>(['Item 1', 'Item 2', 'Item 3']);
  const [items2, setItems2] = useState<UniqueIdentifier[]>(['Item 4', 'Item 5', 'Item 6']);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [isOver1, setIsOver1] = useState(false);
  const [isOver2, setIsOver2] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findContainer = (id: UniqueIdentifier) => {
    if (items1.includes(id)) return 'items1';
    if (items2.includes(id)) return 'items2';
    return null;
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id);
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    const activeContainer = findContainer(active.id);
    let overContainer = findContainer(over?.id || '');

    if (over?.id === 'items1' || over?.id === 'items2') {
      overContainer = over.id;
    }

    if (!overContainer || !activeContainer || activeContainer === overContainer) {
      return;
    }

    if (overContainer === 'items1') {
      setIsOver1(true);
      setIsOver2(false);
    } else if (overContainer === 'items2') {
      setIsOver1(false);
      setIsOver2(true);
    }

    const activeItems = activeContainer === 'items1' ? items1 : items2;
    const overItems = overContainer === 'items1' ? items1 : items2;

    const activeIndex = activeItems.indexOf(active.id);
    const overIndex = over?.id ? overItems.indexOf(over.id) : overItems.length;

    if (activeIndex !== -1) {
      activeItems.splice(activeIndex, 1);
      overItems.splice(overIndex, 0, active.id);

      if (activeContainer === 'items1') {
        setItems1([...activeItems]);
        setItems2([...overItems]);
      } else {
        setItems2([...activeItems]);
        setItems1([...overItems]);
      }
    }
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    setIsOver1(false);
    setIsOver2(false);

    if (!over) return;

    const activeContainer = findContainer(active.id);
    let overContainer = findContainer(over.id);

    if (over?.id === 'items1' || over?.id === 'items2') {
      overContainer = over.id;
    }

    if (activeContainer && overContainer) {
      if (activeContainer === overContainer) {
        const setItems = activeContainer === 'items1' ? setItems1 : setItems2;
        setItems((items) => arrayMove(items, items.indexOf(active.id), items.indexOf(over.id)));
      } else {
        const setActiveItems = activeContainer === 'items1' ? setItems1 : setItems2;
        const setOverItems = overContainer === 'items1' ? setItems1 : setItems2;

        setActiveItems((items) => items.filter((item) => item !== active.id));
        setOverItems((items) => {
          const newIndex = over.id ? items.indexOf(over.id) : items.length;
          return [...items.slice(0, newIndex), active.id, ...items.slice(newIndex)];
        });
      }
    } else if (over?.id === 'items1' || over?.id === 'items2') {
      const newContainer = over.id === 'items1' ? 'items1' : 'items2';
      const setItems = newContainer === 'items1' ? setItems1 : setItems2;
      const newItems = newContainer === 'items1' ? [...items1, active.id] : [...items2, active.id];
      setItems(newItems);
    }
  };

  const activeItem = activeId
    ? items1.find((item) => item === activeId) || items2.find((item) => item === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="container">
        <DroppableContainer id="items1" items={items1} isOver={isOver1} setNodeRef={useDroppable({ id: 'items1' }).setNodeRef}>
          {items1.map((id) => (
            <SortableItem key={id} id={id} />
          ))}
        </DroppableContainer>

        <DroppableContainer id="items2" items={items2} isOver={isOver2} setNodeRef={useDroppable({ id: 'items2' }).setNodeRef}>
          {items2.map((id) => (
            <SortableItem key={id} id={id} />
          ))}
        </DroppableContainer>
      </div>
      <DragOverlay>
        {activeItem ? (
          <SortableItem id={activeItem} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default App;
