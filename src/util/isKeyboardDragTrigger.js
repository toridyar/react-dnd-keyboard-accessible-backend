export default function isKeyboardDragTrigger(event) {
  return (
    "key" in event &&
    // event instanceof KeyboardEvent &&
    event.key.toLowerCase() === " " &&
    !(event.metaKey || event.ctrlKey || event.altKey)
  );
}
