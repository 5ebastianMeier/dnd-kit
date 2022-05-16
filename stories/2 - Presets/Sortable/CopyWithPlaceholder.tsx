import React, {useCallback, useEffect, useRef, useState} from 'react';
import {createPortal, unstable_batchedUpdates} from 'react-dom';
import {
  CancelDrop,
  closestCenter,
  pointerWithin,
  rectIntersection,
  CollisionDetection,
  DndContext,
  DragOverlay,
  DropAnimation,
  defaultDropAnimation,
  getFirstCollision,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  Modifiers,
  useDroppable,
  UniqueIdentifier,
  useSensors,
  useSensor,
  MeasuringStrategy,
  KeyboardCoordinateGetter,
} from '@dnd-kit/core';
import {
  AnimateLayoutChanges,
  SortableContext,
  useSortable,
  arrayMove,
  defaultAnimateLayoutChanges,
  verticalListSortingStrategy,
  SortingStrategy,
  horizontalListSortingStrategy,
  useSortablePlaceholder,
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {coordinateGetter as multipleContainersCoordinateGetter} from './multipleContainersKeyboardCoordinates';

import {Item, Container, ContainerProps} from '../../components';

import {createRange} from '../../utilities';

export default {
  title: 'Presets/Sortable/Multiple Containers',
};

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  args.isSorting || args.wasDragging ? defaultAnimateLayoutChanges(args) : true;

function DroppableContainer({
  children,
  columns = 1,
  disabled,
  id,
  items,
  style,
  ...props
}: ContainerProps & {
  disabled?: boolean;
  id: string;
  items: string[];
  style?: React.CSSProperties;
}) {
  const {
    active,
    attributes,
    isDragging,
    listeners,
    over,
    setNodeRef,
    transition,
    transform,
  } = useSortable({
    id,
    data: {
      type: 'container',
      children: items,
    },
    animateLayoutChanges,
  });
  const isOverContainer = over
    ? (id === over.id && active?.data.current?.type !== 'container') ||
      items.includes(over.id)
    : false;

  return (
    <Container
      ref={disabled ? undefined : setNodeRef}
      style={{
        ...style,
        transition,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : undefined,
      }}
      hover={isOverContainer}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
      columns={columns}
      {...props}
    >
      {children}
    </Container>
  );
}

function PlaceholderItem({
  children,
  columns = 1,
  disabled,
  id,
  items,
  style,
  ...props
}: ContainerProps & {
  disabled?: boolean;
  id: string;
  items: string[];
  style?: React.CSSProperties;
}) {
  const {
    active,
    attributes,
    isDragging,
    listeners,
    over,
    setNodeRef,
    transition,
    transform,
  } = useSortablePlaceholder({});
  const isOverContainer = over
    ? (id === over.id && active?.data.current?.type !== 'container') ||
      items.includes(over.id)
    : false;

  return (
    <Container
      ref={disabled ? undefined : setNodeRef}
      style={{
        ...style,
        transition,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : undefined,
      }}
      hover={isOverContainer}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
      columns={columns}
      {...props}
    >
      {children}
    </Container>
  );
}

const dropAnimation: DropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.5,
};

type Items = Record<string, string[]>;

interface Props {
  adjustScale?: boolean;
  cancelDrop?: CancelDrop;
  columns?: number;
  containerStyle?: React.CSSProperties;
  coordinateGetter?: KeyboardCoordinateGetter;
  getItemStyles?(args: {
    value: UniqueIdentifier;
    index: number;
    overIndex: number;
    isDragging: boolean;
    isSorting: boolean;
    isDragOverlay: boolean;
  }): React.CSSProperties;
  wrapperStyle?(args: {index: number}): React.CSSProperties;
  itemCount?: number;
  items?: Items;
  handle?: boolean;
  renderItem?: any;
  strategy?: SortingStrategy;
  modifiers?: Modifiers;
  minimal?: boolean;
  trashable?: boolean;
  scrollable?: boolean;
  vertical?: boolean;
  dynamicPlaceholder?: boolean;
}

export const TRASH_ID = 'void';
const PLACEHOLDER_ID = 'placeholder';
const empty: UniqueIdentifier[] = [];

export function CopyWithPlaceholder({
  adjustScale = false,
  itemCount = 3,
  cancelDrop,
  columns,
  handle = false,
  items: initialItems,
  containerStyle,
  coordinateGetter = multipleContainersCoordinateGetter,
  getItemStyles = () => ({}),
  wrapperStyle = () => ({}),
  minimal = false,
  modifiers,
  renderItem,
  strategy = verticalListSortingStrategy,
  trashable = false,
  vertical = false,
  scrollable,
}: Props) {
  const [sourceItems, setSourceItems] = useState(['1', '2', '3']);
  const [targetItems, setTargetItems] = useState(['A', 'B', 'C']);
  const [activeId, setActiveId] = useState<string | null>(null);

  const getIndex = (id: string) => {
    return sourceItems.indexOf(id);
  };

  const firstContainerId = '111';
  const secondContainerId = '222';

  const {
    // attributes,
    items: enhancedSourceItems,
    // uniqueId: placeholderId,
    // setNodeRef,
    // transform,
  } = useSortablePlaceholder({
    id: firstContainerId,
    items: sourceItems,
  });

  const {
    // attributes,
    items: enhancedTargetItems,
    // uniqueId: placeholderId,
    // setNodeRef,
    // transform,
  } = useSortablePlaceholder({
    id: secondContainerId,
    items: targetItems,
  });

  console.log('enhanced source', enhancedSourceItems);
  console.log('enhanced target', enhancedTargetItems);

  return (
    <DndContext
      //   sensors={sensors}
      //   measuring={{
      //     droppable: {
      //       strategy: MeasuringStrategy.Always,
      //     },
      //   }}
      onDragStart={({active}) => {
        setActiveId(active.id);
        //   setClonedItems(items);
      }}
      onDragOver={({active, over}) => {
        //   const overId = over?.id;
        //   if (!overId || overId === TRASH_ID || active.id in items) {
        //     return;
        //   }
        //   const overContainer = findContainer(overId);
        //   const activeContainer = findContainer(active.id);
        //   if (!overContainer || !activeContainer) {
        //     return;
        //   }
        //   if (activeContainer !== overContainer) {
        //     setItems((items) => {
        //       const activeItems = items[activeContainer];
        //       const overItems = items[overContainer];
        //       const overIndex = overItems.indexOf(overId);
        //       const activeIndex = activeItems.indexOf(active.id);
        //       let newIndex: number;
        //       if (overId in items) {
        //         newIndex = overItems.length + 1;
        //       } else {
        //         const isBelowOverItem =
        //           over &&
        //           active.rect.current.translated &&
        //           active.rect.current.translated.top >
        //             over.rect.top + over.rect.height;
        //         const modifier = isBelowOverItem ? 1 : 0;
        //         newIndex =
        //           overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
        //       }
        //       recentlyMovedToNewContainer.current = true;
        //       return {
        //         ...items,
        //         [activeContainer]: items[activeContainer].filter(
        //           (item) => item !== active.id
        //         ),
        //         [overContainer]: [
        //           ...items[overContainer].slice(0, newIndex),
        //           items[activeContainer][activeIndex],
        //           ...items[overContainer].slice(
        //             newIndex,
        //             items[overContainer].length
        //           ),
        //         ],
        //       };
        //     });
        //   }
      }}
      onDragEnd={({active, over}) => {
        //   if (active.id in items && over?.id) {
        //     setContainers((containers) => {
        //       const activeIndex = containers.indexOf(active.id);
        //       const overIndex = containers.indexOf(over.id);

        //       return arrayMove(containers, activeIndex, overIndex);
        //     });
        //   }

        //   const activeContainer = findContainer(active.id);

        //   if (!activeContainer) {
        //     setActiveId(null);
        //     return;
        //   }

        const overId = over?.id;

        if (!overId) {
          setActiveId(null);
          return;
        }

        if (overId === PLACEHOLDER_ID) {
          //   const newContainerId = getNextContainerId();

          unstable_batchedUpdates(() => {
            //   setContainers((containers) => [...containers, newContainerId]);
            //   setItems((items) => ({
            //     ...items,
            //     [activeContainer]: items[activeContainer].filter(
            //       (id) => id !== activeId
            //     ),
            //     [newContainerId]: [active.id],
            //   }));
            setActiveId(null);
          });
          return;
        }

        //   const overContainer = findContainer(overId);

        //   if (overContainer) {
        //     const activeIndex = items[activeContainer].indexOf(active.id);
        //     const overIndex = items[overContainer].indexOf(overId);

        //     if (activeIndex !== overIndex) {
        //       setItems((items) => ({
        //         ...items,
        //         [overContainer]: arrayMove(
        //           items[overContainer],
        //           activeIndex,
        //           overIndex
        //         ),
        //       }));
        //     }
        //   }

        setActiveId(null);
      }}
      cancelDrop={cancelDrop}
      //   onDragCancel={onDragCancel}
      modifiers={modifiers}
    >
      <div
        style={{
          display: 'inline-grid',
          boxSizing: 'border-box',
          padding: 20,
          gridAutoFlow: vertical ? 'row' : 'column',
        }}
      >
        <SortableContext
          items={[...enhancedSourceItems, ...enhancedTargetItems]}
          strategy={
            vertical
              ? verticalListSortingStrategy
              : horizontalListSortingStrategy
          }
        >
          <DroppableContainer
            key={firstContainerId}
            id={firstContainerId}
            // label={minimal ? undefined : `Column ${containerId}`}
            items={enhancedSourceItems}
            scrollable={scrollable}
            style={containerStyle}
            unstyled={minimal}
            // onRemove={() => handleRemove(containerId)}
          >
            <SortableContext
              items={enhancedSourceItems}
              strategy={
                vertical
                  ? verticalListSortingStrategy
                  : horizontalListSortingStrategy
              }
            >
              {enhancedSourceItems.map((sortableItem, index) => {
                return (
                  <SortableItem
                    disabled={false}
                    key={sortableItem}
                    id={sortableItem}
                    index={index}
                    handle={handle}
                    style={getItemStyles}
                    wrapperStyle={wrapperStyle}
                    renderItem={renderItem}
                    containerId={firstContainerId}
                    getIndex={getIndex}
                  />
                );
              })}
              {/* <div
                ref={setNodeRef}
                {...attributes}
                style={{
                  transform: CSS.Transform.toString(transform),
                  // transition: transition,
                }}
              /> */}
            </SortableContext>
          </DroppableContainer>

          <DroppableContainer
            key={secondContainerId}
            id={secondContainerId}
            // label={minimal ? undefined : `Column ${containerId}`}
            items={enhancedTargetItems}
            scrollable={scrollable}
            style={containerStyle}
            unstyled={minimal}
            // onRemove={() => handleRemove(containerId)}
          >
            <SortableContext
              items={enhancedTargetItems}
              strategy={
                vertical
                  ? verticalListSortingStrategy
                  : horizontalListSortingStrategy
              }
            >
              {enhancedTargetItems.map((sortableItem, index) => {
                return (
                  <SortableItem
                    disabled={false}
                    key={sortableItem}
                    id={sortableItem}
                    index={index}
                    handle={handle}
                    style={getItemStyles}
                    wrapperStyle={wrapperStyle}
                    renderItem={renderItem}
                    containerId={secondContainerId}
                    getIndex={getIndex}
                  />
                );
              })}

              <SortablePlaceholder />
            </SortableContext>
          </DroppableContainer>
          {createPortal(
            <DragOverlay
              adjustScale={adjustScale}
              dropAnimation={dropAnimation}
            >
              {activeId ? renderSortableItemDragOverlay(activeId) : null}
            </DragOverlay>,
            document.body
          )}
        </SortableContext>
      </div>
    </DndContext>
  );

  function renderSortableItemDragOverlay(id: string) {
    return (
      <Item
        value={id}
        handle={handle}
        style={getItemStyles({
          overIndex: -1,
          index: getIndex(id),
          value: id,
          isSorting: true,
          isDragging: true,
          isDragOverlay: true,
        })}
        color={getColor(id)}
        wrapperStyle={wrapperStyle({index: 0})}
        renderItem={renderItem}
        dragOverlay
      />
    );
  }
}

function getColor(id: string) {
  switch (id[0]) {
    case 'A':
      return '#7193f1';
    case 'B':
      return '#ffda6c';
    case 'C':
      return '#00bcd4';
    case 'D':
      return '#ef769f';
  }

  return undefined;
}

function Trash({id}: {id: UniqueIdentifier}) {
  const {setNodeRef, isOver} = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        left: '50%',
        marginLeft: -150,
        bottom: 20,
        width: 300,
        height: 60,
        borderRadius: 5,
        border: '1px solid',
        borderColor: isOver ? 'red' : '#DDD',
      }}
    >
      Drop here to delete
    </div>
  );
}

interface SortableItemProps {
  containerId: string;
  id: string;
  index: number;
  handle: boolean;
  disabled?: boolean;
  style(args: any): React.CSSProperties;
  getIndex(id: string): number;
  renderItem(): React.ReactElement;
  wrapperStyle({index}: {index: number}): React.CSSProperties;
}

function SortableItem({
  disabled,
  id,
  index,
  handle,
  renderItem,
  style,
  containerId,
  getIndex,
  wrapperStyle,
}: SortableItemProps) {
  const {
    setNodeRef,
    listeners,
    isDragging,
    isSorting,
    over,
    overIndex,
    transform,
    transition,
  } = useSortable({
    id,
  });
  const mounted = useMountStatus();
  const mountedWhileDragging = isDragging && !mounted;

  return (
    <Item
      ref={disabled ? undefined : setNodeRef}
      value={id}
      dragging={isDragging}
      sorting={isSorting}
      handle={handle}
      index={index}
      wrapperStyle={wrapperStyle({index})}
      style={style({
        index,
        value: id,
        isDragging,
        isSorting,
        overIndex: over ? getIndex(over.id) : overIndex,
        containerId,
      })}
      color={getColor(id)}
      transition={transition}
      transform={transform}
      fadeIn={mountedWhileDragging}
      listeners={listeners}
      renderItem={renderItem}
    />
  );
}

function SortablePlaceholder({}: //   disabled,
//   index,
//   handle,
//   renderItem,
//   style,
//   containerId,
//   getIndex,
//   wrapperStyle,
SortableItemProps) {
  const {
    setNodeRef,
    listeners,
    isDragging,
    isSorting,
    over,
    overIndex,
    placeholderId,
    transform,
    transition,
  } = useSortablePlaceholder({});
  const mounted = useMountStatus();
  const mountedWhileDragging = isDragging && !mounted;

  return (
    <Item
      ref={disabled ? undefined : setNodeRef}
      value={placeholderId}
      dragging={isDragging}
      sorting={isSorting}
      handle={handle}
      index={index}
      wrapperStyle={wrapperStyle({index})}
      style={style({
        index,
        value: placeholderId,
        isDragging,
        isSorting,
        overIndex: over ? getIndex(over.id) : overIndex,
        containerId,
      })}
      color={getColor(placeholderId)}
      transition={transition}
      transform={transform}
      fadeIn={mountedWhileDragging}
      listeners={listeners}
      renderItem={renderItem}
    />
  );
}

function useMountStatus() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 500);

    return () => clearTimeout(timeout);
  }, []);

  return isMounted;
}
