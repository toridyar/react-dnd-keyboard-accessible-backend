function getNodeDescription(node) {
  if (node == null) return undefined;

  return (
    node.getAttribute("data-dnd-name") ??
    node.getAttribute("aria-label") ??
    node.innerText
  );
}

export const DEFAULT_ANNOUNCEMENT_MESSAGES = {
  pickedUpItem: (itemId, node) => {
    const label = getNodeDescription(node) ?? itemId;

    return `Picked up ${label}`;
  },
  droppedItem: (itemId, node) => {
    const label = getNodeDescription(node) ?? itemId;

    return `Dropped ${label}`;
  },
  hoveredTarget: (targetId, node) => {
    const label = getNodeDescription(node) ?? targetId;

    return `Over ${label}`;
  },
  canceledDrag: (itemId, node) => {
    const label = getNodeDescription(node) ?? itemId;

    return `Stopped dragging ${label}`;
  },
};

export function getDefaultAnnouncementMessages() {
  return DEFAULT_ANNOUNCEMENT_MESSAGES;
}
