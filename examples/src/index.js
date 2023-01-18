import * as React from "react";
import { render } from "react-dom";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { TouchTransition } from "dnd-multi-backend";
import {
  DndProvider,
  createTransition,
  MouseTransition,
} from "react-dnd-multi-backend";

import KeyboardBackend, {
  isKeyboardDragTrigger,
} from "react-dnd-keyboard-accessible-backend";

import SortableContainer from "./Sortable/SortableContainer";

const KeyboardTransition = createTransition("keydown", (event) => {
  return isKeyboardDragTrigger(event);
});

const DND_OPTIONS = {
  backends: [
    {
      id: "html5",
      backend: HTML5Backend,
      transition: MouseTransition,
    },
    {
      id: "touch",
      backend: TouchBackend,
      options: { enableMouseEvents: true },
      transition: TouchTransition,
    },
    {
      id: "keyboard",
      backend: KeyboardBackend,
      context: { window, document },
      options: {
        announcerClassName: "announcer",
      },
      transition: KeyboardTransition,
    },
  ],
};

function Index() {
  return (
    <DndProvider options={DND_OPTIONS}>
      <h1>Keyboard Drag and Drop Example</h1>

      <p>
        You can use this example with a mouse and dragging around and tab
        between the items and move them with a keyboard.
      </p>

      <p>
        To pick up an item with the keyboard, use{" "}
        <span style={{ fontFamily: "monospace" }}>Spacebar</span>
        while focused on it, then press the up and down arrows to move between
        targets, and the enter key to drop the item where it is currently
        hovered. You can also cancel dragging at any time by pressing{" "}
        <span style={{ fontFamily: "monospace" }}>Escape</span>.
      </p>

      <p>
        Below this example, you can see the screenreader announcements happen in
        real time as you move around. Note that these announcements only happen
        when using a keyboard to drag and drop. By default these are visually
        hidden, but they have been made visible for this example.
      </p>
      <SortableContainer />
    </DndProvider>
  );
}

render(<Index />, document.getElementById("root"));
