import { createFocusManager } from "./util/FocusManager";
import getNodeClientOffset from "./util/getNodeClientOffset";
import stopEvent from "./util/stopEvent";

const NavigationKeys = {
  UP: "ArrowUp",
  DOWN: "ArrowDown",
  DROP: "Shift",
  CANCEL: "Escape",
};

export class DropTargetNavigator {
  constructor(sourceNode, targetNodes, manager, announcer) {
    this.manager = manager;
    this.targetNodes = targetNodes;
    this.announcer = announcer;
    this.currentHoveredNode = sourceNode;
    this.focusManager = createFocusManager({
      getFocusableElements: () => this.getViableTargets(targetNodes),
    });
    this.actions = manager.getActions();
    this.monitor = manager.getMonitor();
    this.handleDraggedElementKeyDown =
      this.handleDraggedElementKeyDown.bind(this);
    window.addEventListener("keydown", this.handleDraggedElementKeyDown, {
      capture: true,
    });
  }

  disconnect() {
    window.removeEventListener("keydown", this.handleDraggedElementKeyDown, {
      capture: true,
    });
  }

  handleDraggedElementKeyDown = (event) => {
    switch (event.key) {
      case NavigationKeys.UP:
        stopEvent(event);
        this.hoverNode(this.getPreviousDropTarget());
        return;
      case NavigationKeys.DOWN:
        stopEvent(event);
        this.hoverNode(this.getNextDropTarget());
        return;
    }
  };

  hoverNode(node) {
    const targetId = Array.from(this.targetNodes.entries()).find(
      ([_key, value]) => node === value
    )?.[0];
    if (targetId == null) return;
    this.actions.hover([targetId], { clientOffset: getNodeClientOffset(node) });
    this.currentHoveredNode = node;
    this.announcer.announceHover(node, targetId);
    node?.focus();
  }

  getNextDropTarget() {
    return this.focusManager.getNextFocusableElement({
      wrap: false,
      from: this.currentHoveredNode ?? undefined,
    });
  }

  getPreviousDropTarget() {
    return this.focusManager.getPreviousFocusableElement({
      wrap: false,
      from: this.currentHoveredNode ?? undefined,
    });
  }

  getViableTargets(nodes) {
    const allowedTargets = this.getAllowedTargets(nodes);
    return allowedTargets.sort((a, b) => {
      if (a === b) return 0;
      const position = a.compareDocumentPosition(b);
      if (
        position &
        (Node.DOCUMENT_POSITION_FOLLOWING |
          (position & Node.DOCUMENT_POSITION_CONTAINED_BY))
      )
        return -1;
      else if (
        position &
        (Node.DOCUMENT_POSITION_PRECEDING |
          (position & Node.DOCUMENT_POSITION_CONTAINS))
      )
        return 1;
      else return 0;
    });
  }

  getAllowedTargets(nodes) {
    const sourceType = this.monitor.getItemType();
    if (sourceType == null) return Array.from(nodes.values());
    return Array.from(nodes).reduce((acc, [id, node]) => {
      if (this.manager.getMonitor().canDropOnTarget(id)) acc.push(node);
      return acc;
    }, []);
  }
}
