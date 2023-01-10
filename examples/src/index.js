import * as React from "react";
import { render } from "react-dom";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  DndProvider,
  MouseTransition,
  createTransition,
} from "react-dnd-multi-backend";

import KeyboardBackend, {
  isKeyboardDragTrigger,
} from "react-dnd-keyboard-accessible-backend";

import SortableContainer from "./Sortable/SortableContainer";

const KeyboardTransition = createTransition("keydown", (event) => {
  if (!isKeyboardDragTrigger(event)) return false;
  // This prevention keeps the first keyboard event from causing browser
  // bookmark shortcuts. This can't be done in the Backend because it only
  // receives a _cloned_ event _after_ this one has already propagated.
  event.preventDefault();
  return true;
});

// const MouseTransition = createTransition("mousedown", (event) => {
//   if (event.type.indexOf("touch") !== -1 || event.type.indexOf("mouse") === -1)
//     return false;
//   return true;
// });

const DND_OPTIONS = {
  backends: [
    {
      id: "html5",
      backend: HTML5Backend,
      transition: MouseTransition,
    },
    {
      id: "keyboard",
      backend: KeyboardBackend,
      context: { window, document },
      options: {
        announcerClassName: "announcer",
      },
      preview: true,
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
        <span style={{ fontFamily: "monospace" }}>ctrl+d</span> (or{" "}
        <span style={{ fontFamily: "monospace" }}>command+d</span> on macOS)
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
