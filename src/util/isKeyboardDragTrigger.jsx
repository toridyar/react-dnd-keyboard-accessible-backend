export default function isKeyboardDragTrigger(event) {
  return (
    event instanceof KeyboardEvent &&
    event.key.toLowerCase() === " " &&
    !(event.metaKey || event.ctrlKey || event.altKey)
  );
}
