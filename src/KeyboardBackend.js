import DragAnnouncer from "./DragAnnouncer";
import { DropTargetNavigator } from "./DropTargetNavigator";
import getNodeClientOffset from "./util/getNodeClientOffset";
import isKeyboardDragTrigger from "./util/isKeyboardDragTrigger";
import stopEvent from "./util/stopEvent";

const Trigger = {
  DROP: ["Enter"],
  CANCEL_DRAG: ["Escape"],
};

function isTrigger(event, trigger) {
  return trigger.includes(event.key);
}

export class KeyboardBackend {
  constructor(manager, context, options = {}) {
    this._handlingFirstEvent = false;
    this.manager = manager;
    this.actions = manager.getActions();
    this.monitor = manager.getMonitor();
    this.context = context;
    this.options = options;
    this._isDragTrigger =
      "isDragTrigger" in options
        ? options.isDragTrigger
        : isKeyboardDragTrigger;
    this.sourceNodes = new Map();
    this.targetNodes = new Map();
    this.handleGlobalKeyDown = this.handleGlobalKeyDown.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    this._announcer = new DragAnnouncer(context.document, options);
  }

  setup() {
    if (KeyboardBackend.isSetUp) {
      throw new Error("Cannot have two Keyboard backends at the same time.");
    }
    KeyboardBackend.isSetUp = true;
    this._handlingFirstEvent = true;
    if ("window" in this.context) {
      this.context.window.addEventListener(
        "keydown",
        this.handleGlobalKeyDown,
        { capture: true }
      );
    }
    this._announcer.attach();
  }

  teardown() {
    KeyboardBackend.isSetUp = false;
    if ("window" in this.context) {
      this.context.window.removeEventListener(
        "keydown",
        this.handleGlobalKeyDown,
        {
          capture: true,
        }
      );
      this.endDrag();
      this._announcer.detach();
    }
  }

  handleGlobalKeyDown(event) {
    if (this.monitor.isDragging() && isTrigger(event, Trigger.CANCEL_DRAG)) {
      this.endDrag(event);
      const sourceId = String(this.monitor.getSourceId());
      const sourceNode = this.sourceNodes.get(sourceId);
      this._announcer.announceCancel(sourceNode ?? null, sourceId);
    }
  }

  setDndMode(enabled) {
    if ("options" in this && "onDndModeChanged" in this.options) {
      this.options.onDndModeChanged(enabled);
    }
  }

  profile() {
    return {
      sourcePreviewNodes: this.sourcePreviewNodes.size,
      sourcePreviewNodeOptions: this.sourcePreviewNodeOptions.size,
      sourceNodes: this.sourceNodes.size,
    };
  }

  connectDragSource(sourceId, node) {

    const handleDragStart = this.handleDragStart.bind(this, sourceId);
    this.sourceNodes.set(sourceId, node);

    node.addEventListener("keydown", handleDragStart);

    return () => {
      this.sourceNodes.delete(sourceId);
      node.removeEventListener("keydown", handleDragStart);
    };
  }

  connectDragPreview(sourceId, node, options) {
    this.sourcePreviewNodeOptions.set(sourceId, options);
    this.sourcePreviewNodes.set(sourceId, node);

    return () => {
      this.sourcePreviewNodes.delete(sourceId);
      this.sourcePreviewNodeOptions.delete(sourceId);
    };
  }

  connectDropTarget(targetId, node) {
    this.targetNodes.set(targetId, node);
    node.addEventListener("keydown", this.handleDrop);
    // Ensure that the target will be focusable by the navigator
    node.tabIndex = Math.max(-1, node.tabIndex);
    return () => {
      this.targetNodes.delete(targetId);
      node.removeEventListener("keydown", this.handleDrop);
    };
  }

  getSourceClientOffset = (sourceId) => {
    return getNodeClientOffset(this.sourceNodes.get(sourceId));
  };

  handleDragStart = (sourceId, event) => {
    if (!this._isDragTrigger(event, this._handlingFirstEvent)) return;
    this._handlingFirstEvent = false;
    if (!this.monitor.canDragSource(sourceId)) return;
    if (this.monitor.isDragging()) {
      this.actions.publishDragSource();
      return;
    }
    stopEvent(event);
    const sourceNode = this.sourceNodes.get(sourceId);
    if (sourceNode == null) return;
    this._navigator = new DropTargetNavigator(
      sourceNode,
      this.targetNodes,
      this.manager,
      this._announcer
    );
    this.actions.beginDrag([sourceId], {
      clientOffset: this.getSourceClientOffset(sourceId),
      getSourceClientOffset: this.getSourceClientOffset,
      publishSource: false,
    });

    this.setDndMode(true);
    this._announcer.announceDrag(sourceNode, sourceId);
  };

  handleDrop = (event) => {
    if (!isTrigger(event, Trigger.DROP)) return;
    const sourceId = String(this.monitor.getSourceId());
    const sourceNode = this.sourceNodes.get(sourceId);
    this._announcer.announceDrop(sourceNode ?? null, sourceId);
    this.actions.drop();
    this.endDrag(event);

    // Set focus on the node that was moved
    sourceNode.focus();
  };

  endDrag(event) {
    event != null && stopEvent(event);
    if ("_navigator" in this) {
      this._navigator.disconnect();
    }

    if (this.monitor.isDragging()) this.actions.endDrag();
    this.setDndMode(false);
  }
}

const createKeyboardBackendFactory = (DragDropManager, context, options) =>
  new KeyboardBackend(DragDropManager, context, options);

export default createKeyboardBackendFactory;
