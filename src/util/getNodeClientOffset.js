export default function getNodeClientOffset(node) {
  if (node == null) return { x: 0, y: 0 };

  const el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  if (!el) return { x: 0, y: 0 };

  const { top, left } = el.getBoundingClientRect();
  return { x: left, y: top };
}
