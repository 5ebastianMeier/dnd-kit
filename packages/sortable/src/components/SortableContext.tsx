import React, {useEffect, useMemo, useRef} from 'react';
import {useDndContext, ClientRect, UniqueIdentifier} from '@dnd-kit/core';
import {useIsomorphicLayoutEffect, useUniqueId} from '@dnd-kit/utilities';

import type {SortingStrategy} from '../types';
import {getSortedRects} from '../utilities';
import {rectSortingStrategy} from '../strategies';

export interface Props {
  children: React.ReactNode;
  items: (UniqueIdentifier | {id: UniqueIdentifier})[];
  strategy?: SortingStrategy;
  id?: string;
}

const ID_PREFIX = 'Sortable';

interface ContextDescriptor {
  activeIndex: number;
  placeholderIndex: number;
  containerId: string;
  disableTransforms: boolean;
  items: UniqueIdentifier[];
  overIndex: number;
  useDragOverlay: boolean;
  sortedRects: ClientRect[];
  strategy: SortingStrategy;
}

export const Context = React.createContext<ContextDescriptor>({
  activeIndex: -1,
  placeholderIndex: -1,
  containerId: ID_PREFIX,
  disableTransforms: false,
  items: [],
  overIndex: -1,
  useDragOverlay: false,
  sortedRects: [],
  strategy: rectSortingStrategy,
});

export function SortableContext({
  children,
  id,
  items: userDefinedItems,
  strategy = rectSortingStrategy,
}: Props) {
  const {
    active,
    dragOverlay,
    droppableRects,
    over,
    measureDroppableContainers,
    measuringScheduled,
  } = useDndContext();
  const containerId = useUniqueId(ID_PREFIX, id);
  const useDragOverlay = Boolean(dragOverlay.rect !== null);
  const currentPlaceholderId = over?.placeholderId.current;
  const isPlaceholderActive = over?.placeholderContainerId.current === id;
  const isSourceSortable =
    over?.placeholderContainerId.current ===
    active?.data.current?.sortable.containerId;
  // const currentPlaceholderContainerId = over?.placeholderContainerId.current;
  const items = useMemo(() => {
    const userDefinedIds = userDefinedItems.map((item) =>
      typeof item === 'string' ? item : item.id
    );
    // if (
    //   currentPlaceholderId &&
    //   active &&
    //   currentPlaceholderContainerId ===
    //     active?.data.current?.sortable.containerId
    // ) {
    //   return [...userDefinedIds, currentPlaceholderId];
    // }
    if (!isSourceSortable && isPlaceholderActive && currentPlaceholderId) {
      return [...userDefinedIds, currentPlaceholderId];
    }
    return userDefinedIds;
  }, [
    currentPlaceholderId,
    isPlaceholderActive,
    isSourceSortable,
    userDefinedItems,
  ]);
  // const sortingId = currentPlaceholderId ?? active?.id ?? '';
  const activeIndex = active ? items.indexOf(active.id) : -1;
  const overIndex = over ? items.indexOf(over.id) : -1;
  // const itemsIncludingPlaceholder = useMemo(() => {
  //   if (!currentPlaceholderId) {
  //     return items;
  //   }
  //   return [...items, currentPlaceholderId];
  //   // return [
  //   //   ...items.slice(0, overIndex),
  //   //   currentPlaceholderId,
  //   //   ...items.slice(overIndex, items.length),
  //   // ];
  // }, [currentPlaceholderId, items]);
  const placeholderIndex = currentPlaceholderId
    ? items.indexOf(currentPlaceholderId)
    : -1;

  console.log('placeholder', currentPlaceholderId, placeholderIndex);
  const previousItemsRef = useRef(items);
  const itemsHaveChanged = !isEqual(items, previousItemsRef.current);
  const disableTransforms =
    (overIndex !== -1 &&
      activeIndex === -1 &&
      (placeholderIndex === -1 || isSourceSortable)) ||
    itemsHaveChanged;

  useIsomorphicLayoutEffect(() => {
    if (itemsHaveChanged && !measuringScheduled) {
      measureDroppableContainers(items);
      // measureDroppableContainers(itemsIncludingPlaceholder);
    }
  }, [itemsHaveChanged, items, measureDroppableContainers, measuringScheduled]);

  useEffect(() => {
    previousItemsRef.current = items;
  }, [items]);

  console.log('SortableContext', id, {
    activeIndex,
    overIndex,
    placeholderIndex,
    items,
    containerId,
  });

  const contextValue = useMemo(
    (): ContextDescriptor => ({
      activeIndex: isPlaceholderActive ? placeholderIndex : activeIndex,
      placeholderIndex,
      containerId,
      disableTransforms,
      items: items,
      // items: itemsIncludingPlaceholder,
      overIndex,
      useDragOverlay,
      sortedRects: getSortedRects(items, droppableRects),
      // sortedRects: getSortedRects(itemsIncludingPlaceholder, droppableRects),
      strategy,
    }),
    [
      isPlaceholderActive,
      activeIndex,
      placeholderIndex,
      containerId,
      disableTransforms,
      items,
      overIndex,
      droppableRects,
      useDragOverlay,
      strategy,
    ]
  );

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}

function isEqual(arr1: string[], arr2: string[]) {
  if (arr1 === arr2) return true;
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}
