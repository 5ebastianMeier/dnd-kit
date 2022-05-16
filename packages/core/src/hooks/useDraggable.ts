import {createContext, useContext, useMemo} from 'react';
import {
  Transform,
  useNodeRef,
  useIsomorphicLayoutEffect,
  useLatestValue,
  useUniqueId,
} from '@dnd-kit/utilities';

import {InternalContext, Data} from '../store';
import {ActiveDraggableContext} from '../components/DndContext';
import {useSyntheticListeners, SyntheticListenerMap} from './utilities';

export interface UseDraggableArguments {
  id: string;
  data?: Data;
  disabled?: boolean;
  attributes?: {
    role?: string;
    roleDescription?: string;
    tabIndex?: number;
  };
  placeholder?: boolean;
  placeholderContainerId?: string;
}

export interface DraggableAttributes {
  role: string;
  tabIndex: number;
  'aria-pressed': boolean | undefined;
  'aria-roledescription': string;
  'aria-describedby': string;
}

export type DraggableSyntheticListeners = SyntheticListenerMap | undefined;

const NullContext = createContext<any>(null);

const defaultRole = 'button';

const ID_PREFIX = 'Droppable';

export function useDraggable({
  id,
  data,
  disabled = false,
  attributes,
  placeholder = false,
  placeholderContainerId,
}: UseDraggableArguments) {
  const key = useUniqueId(ID_PREFIX);
  const {
    activators,
    activatorEvent,
    active,
    activeNodeRect,
    ariaDescribedById,
    draggableNodes,
    // placeholders,
    over,
  } = useContext(InternalContext);
  const {role = defaultRole, roleDescription = 'draggable', tabIndex = 0} =
    attributes ?? {};
  // const isDragging = active?.id === id;
  const isDragging = placeholder
    ? over?.id === placeholderContainerId
    : active?.id === id;
  const transform: Transform | null = useContext(
    isDragging ? ActiveDraggableContext : NullContext
  );
  const [node, setNodeRef] = useNodeRef();
  const listeners = useSyntheticListeners(activators, id);
  const dataRef = useLatestValue(data);

  useIsomorphicLayoutEffect(
    () => {
      draggableNodes[id] = {id, key, node, data: dataRef};
      // if (placeholder && placeholderContainerId) {
      //   placeholders[placeholderContainerId] = {id, key, node, data: dataRef};
      // }

      return () => {
        const node = draggableNodes[id];

        if (node && node.key === key) {
          delete draggableNodes[id];
          // if (placeholder && placeholderContainerId) {
          //   delete placeholders[placeholderContainerId];
          // }
        }
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draggableNodes, id]
  );

  const memoizedAttributes: DraggableAttributes = useMemo(
    () => ({
      role,
      tabIndex,
      'aria-pressed': isDragging && role === defaultRole ? true : undefined,
      'aria-roledescription': roleDescription,
      'aria-describedby': ariaDescribedById.draggable,
    }),
    [role, tabIndex, isDragging, roleDescription, ariaDescribedById.draggable]
  );

  return {
    active,
    activatorEvent,
    activeNodeRect,
    attributes: memoizedAttributes,
    isDragging,
    // isPlaceholderActive: placeholder && over?.id === placeholderContainerId,
    listeners: disabled ? undefined : listeners,
    node,
    over,
    setNodeRef,
    transform,
  };
}
