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
  items: UniqueIdentifier[];
  children: React.ReactNode;
  isOver: boolean;
  setNodeRef: (element: HTMLElement | null) => void;
}

const DroppableContainer: React.FC<DroppableContainerProps> = ({ items, children, isOver, setNodeRef }) => {
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const { setNodeRef: setNodeRef1, isOver: isOverContainer1 } = useDroppable({ id: 'items1' });
  const { setNodeRef: setNodeRef2, isOver: isOverContainer2 } = useDroppable({ id: 'items2' });

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
    const overContainer = over?.id && findContainer(over.id);

    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    const activeItems = activeContainer === 'items1' ? [...items1] : [...items2];
    const overItems = overContainer === 'items1' ? [...items1] : [...items2];

    const activeIndex = activeItems.indexOf(active.id);
    const overIndex = over.id ? overItems.indexOf(over.id) : overItems.length;

    if (activeIndex !== -1) {
      activeItems.splice(activeIndex, 1);
      overItems.splice(overIndex, 0, active.id);

      activeContainer === 'items1' ? setItems1(activeItems) : setItems2(activeItems);
      overContainer === 'items1' ? setItems1(overItems) : setItems2(overItems);
    }
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);

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
      setItems((items) => [...items, active.id]);
    }

    setActiveId(null);
  };

  const activeItem = activeId ? items1.concat(items2).find((item) => item === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="container">
        <DroppableContainer items={items1} isOver={isOverContainer1} setNodeRef={setNodeRef1}>
          {items1.map((id) => (
            <SortableItem key={id} id={id} />
          ))}
        </DroppableContainer>

        <DroppableContainer items={items2} isOver={isOverContainer2} setNodeRef={setNodeRef2}>
          {items2.map((id) => (
            <SortableItem key={id} id={id} />
          ))}
        </DroppableContainer>
      </div>
      <DragOverlay>
        {activeItem && <SortableItem id={activeItem} />}
      </DragOverlay>
    </DndContext>
  );
};

export default App;
