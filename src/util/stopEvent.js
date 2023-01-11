export default function stopEvent(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
}
