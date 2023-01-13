# react-dnd-keyboard-accessible-backend

An additional backend to make [`react-dnd`](https://react-dnd.github.io/react-dnd/about) accessible by supporting keyboard inputs. This is starting with
['react-dnd-accessible-backend'](https://github.com/discord/react-dnd-accessible-backend) and has been updated to use latest version of react-dnd (16.0.x).

## Installation

This package is available on npm as `react-dnd-keyboard-accessible-backend`.

```shell
npm install react-dnd-keyboard-accessible-backend
```

## Basic Usage

Same as `react-dnd-accessible-backend`, `react-dnd-keyboard-accessible-backend` is also not a _replacement_ backend for `react-dnd`, but rather an
_additional_ one. This means you will most likely need to compose backends together to get all of
the functionality you would like (mouse dragging, keyboards, pointer dragging on mobile, etc).

One of the easiest ways to do this is with
[`react-dnd-multi-backend`](https://www.npmjs.com/package/react-dnd-multi-backend) and it's
Transition system. Using that library, just add another backend entry and create a Transition for
the keyboard trigger, like so:

```javascript
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { TouchTransition, PointerTransition } from "dnd-multi-backend";
import { DndProvider, createTransition } from "react-dnd-multi-backend";

import KeyboardBackend, {
  isKeyboardDragTrigger,
} from "react-dnd-keyboard-accessible-backend";

const KeyboardTransition = createTransition("keydown", (event) => {
  return isKeyboardDragTrigger(event);
});

const DND_OPTIONS = {
  backends: [
    {
      id: "html5",
      backend: HTML5Backend,
      transition: PointerTransition,
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
      transition: KeyboardTransition,
    },
  ],
};

function App() {
  return <DndProvider options={DND_OPTIONS}>...</DndProvider>;
}
```

At the moment, the keybinds used for drag and drop are hard-coded as:

- `Spacebar` to pick up a draggable item
- up and down arrow keys to move between drop targets
- `Enter` to drop the dragged item on a drop target
- `Escape` while dragging to cancel the drag operation

## Options

`react-dnd-keyboard-accessible-backend` provides a few options for customizing styles and behavior for use in
your app. If you're using `react-dnd-multi-backend`, these can get passed in as an `options` field
on the backend configuration object, or otherwise as the third argment when calling the backend
directly as a factory function (like `KeyboardBackend(manager, context, options)`.

These options are:

### `getAnnouncementMessages?: () => AnnouncementMessages`

This function is called any time a drag and drop action is performed by the keyboard backend and is
useful for providing translations or more descriptive messages for screenreader users as they
interact with draggable items.

If this option is not provided, a
[default set of messages in English](https://github.com/toridyar/react-dnd-keyboard-accessible-backend/blob/main/src/util/AnnouncementMessages.js)
will be used. Providing a separate function requires that you specify a replacement for _all_
messages that can be announced. These (currently) are `pickedUpItem`, `droppedItem`, `hoveredTarget`
and `canceledDrag`.

Each message getter is defined as a function that takes in an `itemId` and the HTML `node` that is
relevant to the operation.

```typescript
// A very naive example of how to provide custom announcement messages.
function getCustomAnnouncementMessages() {
  return {
    pickedUpItem: (itemId: string, node: HTMLElement | null) => `Picked up ${itemId}`,
    droppedItem: (itemId: string, node: HTMLElement | null) => `Dropped ${itemId}`,
    hoveredTarget: (itemId: string, node: HTMLElement | null) => `Hovered over ${itemId}`,
    canceledDrag: (itemId: string, node: HTMLElement | null) => "Drag cancelled"
  };
}

{
  options: {
    getAnnouncementMessages: getCustomAnnouncementMessages,
  },
}
```

### `isDragTrigger?: (event: KeyboardEvent, isFirstEvent: boolean) => boolean`

This function is used to determine if a keyboard event that occurs on a draggable element should
trigger the start of a drag operation. Overriding this option lets you customize the keybind used to
start dragging or perform other checks before the drag is allowed to start.

If this option is not provided, it will default to using the `isKeyboardDragTrigger` that is
exported as part of this package, which triggers when `ctrl/command+d` is pressed.

Ths `isFirstEvent` parameter indicates whether this is the first event the backend is receiving
after being setup.

```typescript
{
  options: {
    // This will start a drag whenever the users presses
    // `m` while focused on a draggable element.
    isDragTrigger: (event) => event.key === "m"
  },
}
```

**NOTE:** In most cases when `react-dnd-multi-backend`, you'll want to use the same trigger function
in this option for the trigger in `createTransition`. Otherwise the backend may not be set up when
you expect to start a drag. This is also where the `isFirstEvent` property can come in handy, since
`react-dnd-multi-backend` will sometimes fire cloned events that don't have keyboard properties on
them.

### `announcerClassName`

Screenreader announcements are performed by injecting an element into the DOM with an `aria-live`
attribute that gets picked up by the screenreader. By default, this element is visually hidden and
kept out of the way, but if you wish to style it in some other way, you can provide a custom class
name with this option. The examples page in this repository does this to show the messages on the
page for testing.

```typescript
{
  options: {
    announcerClassName: styles.dndAnnouncer,
  },
}
```

### `previewerClassName`

Similar to the `announcerClassName` this option provides a custom class name to use for the drag
previewer, which is a container that gets populated by a clone of the currently-dragged element and
positions itself in the appropriate place on screen for the currently-hovered drop target.

```typescript
{
  options: {
    previewerClassName: styles.dndDragPreview,
  },
}
```

**NOTE:** It is important that this div does _not_ have any styles that affect its spatial
positioning on screen, as this is controlled internally by the backend. What it _can_ be used for
are things like adding a drop shadow or highlight to the drag preview, changing opacities, borders,
scaling, and other stylistic options.
