import React, {useState} from 'react';
import {
  CancelDrop,
  closestCenter,
  closestCorners,
  pointerWithin,
  rectIntersection,
} from '@dnd-kit/core';
import {rectSortingStrategy} from '@dnd-kit/sortable';

import {MultipleContainers, TRASH_ID} from './MultipleContainers';

import {ConfirmModal} from '../../components';
import {MultipleContainersCopy} from './MultipleContainersCopy';
import CopyWithPlaceholder from './CopyWithPlaceholder';
// import {CopyWithPlaceholder} from './CopyWithPlaceholder';

export default {
  title: 'Presets/Sortable/Multiple Containers',
};

export const BasicSetup = () => <MultipleContainers />;

export const ManyItems = () => (
  <MultipleContainers
    containerStyle={{
      maxHeight: '80vh',
    }}
    itemCount={15}
    scrollable
  />
);

export const Vertical = () => <MultipleContainers itemCount={5} vertical />;

export const DynamicPlaceholder = () => {
  const [customDragOverlayHeight, setCustomDragOverlayHeight] = useState(50);
  const [
    activateCustomDragOverlayHeight,
    setActivateCustomDragOverlayHeight,
  ] = useState(false);
  const [trackDragOverlayHeight, setTrackDragOverlayHeight] = useState(false);
  const [
    customPlaceholderPerContainer,
    setCustomPlaceholderPerContainer,
  ] = useState(false);
  console.log(
    'TOGGLES',
    customDragOverlayHeight,
    activateCustomDragOverlayHeight,
    trackDragOverlayHeight,
    customPlaceholderPerContainer
  );
  const props = {
    customDragOverlayHeight,
    activateCustomDragOverlayHeight,
    trackDragOverlayHeight,
    customPlaceholderPerContainer,
  };
  return (
    <>
      <MultipleContainersCopy placeholder {...props} />
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h3>Toggles</h3>
        <label>
          <input
            type="checkbox"
            checked={trackDragOverlayHeight}
            onChange={(event) =>
              setTrackDragOverlayHeight(event?.target.checked)
            }
          />
          Track DragOverlay height on Placeholder
        </label>
        <label>
          <input
            type="checkbox"
            checked={customPlaceholderPerContainer}
            onChange={(event) =>
              setCustomPlaceholderPerContainer(event?.target.checked)
            }
          />
          Use fully custom Placeholder per Container
        </label>
        <label>
          <input
            type="number"
            value={customDragOverlayHeight}
            onChange={(event) =>
              setCustomDragOverlayHeight(parseInt(event.target.value))
            }
          />
          Custom DragOverlay Height
        </label>
        <label>
          <input
            type="checkbox"
            value="closestCenter"
            checked={activateCustomDragOverlayHeight}
            onChange={(event) =>
              setActivateCustomDragOverlayHeight(event?.target.checked)
            }
          />
          UseCustom DragOverlay Height
        </label>
      </div>
    </>
  );
};

// export const DynamicPlaceholder = () => <CopyWithPlaceholder />;

export const TrashableItems = ({confirmDrop}: {confirmDrop: boolean}) => {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const resolveRef = React.useRef<(value: boolean) => void>();

  const cancelDrop: CancelDrop = async ({active, over}) => {
    if (over?.id !== TRASH_ID) {
      return true;
    }

    setActiveId(active.id);

    const confirmed = await new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });

    setActiveId(null);

    return confirmed === false;
  };

  return (
    <>
      <MultipleContainers
        cancelDrop={confirmDrop ? cancelDrop : undefined}
        trashable
      />
      {activeId && (
        <ConfirmModal
          onConfirm={() => resolveRef.current?.(true)}
          onDeny={() => resolveRef.current?.(false)}
        >
          Are you sure you want to delete "{activeId}"?
        </ConfirmModal>
      )}
    </>
  );
};

TrashableItems.argTypes = {
  confirmDrop: {
    name: 'Request user confirmation before deletion',
    defaultValue: false,
    control: {type: 'boolean'},
  },
};

export const Grid = () => (
  <MultipleContainers
    columns={2}
    strategy={rectSortingStrategy}
    wrapperStyle={() => ({
      width: 150,
      height: 150,
    })}
  />
);

export const VerticalGrid = () => (
  <MultipleContainers
    columns={2}
    itemCount={5}
    strategy={rectSortingStrategy}
    wrapperStyle={() => ({
      width: 150,
      height: 150,
    })}
    vertical
  />
);
