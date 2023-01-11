export function createFocusManager({ getFocusableElements }) {
  function getNextFocusableElement(options) {
    const currentTarget = options?.from || document.activeElement;
    if (currentTarget == null) {
      return null;
    }
    const elements = getFocusableElements();
    const nextNode = elements.find((element) => {
      return !!(
        currentTarget.compareDocumentPosition(element) &
        (Node.DOCUMENT_POSITION_FOLLOWING | Node.DOCUMENT_POSITION_CONTAINED_BY)
      );
    });
    if (nextNode == null && options?.wrap) {
      return elements[0] ?? null;
    }
    return nextNode;
  }

  function getPreviousFocusableElement(options) {
    const currentTarget = options?.from || document.activeElement;
    if (currentTarget == null) {
      return null;
    }
    const elements = getFocusableElements();
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      if (
        currentTarget.compareDocumentPosition(element) &
        (Node.DOCUMENT_POSITION_PRECEDING | Node.DOCUMENT_POSITION_CONTAINED_BY)
      ) {
        return element;
      }
    }
    if (options?.wrap) {
      return elements[elements.length - 1] ?? null;
    }
    return null;
  }

  function getFirstFocusableElement() {
    const elements = getFocusableElements();
    return elements[0] ?? null;
  }

  function getLastFocusableElement() {
    const elements = getFocusableElements();
    return elements[elements.length - 1] ?? null;
  }

  return {
    getNextFocusableElement,
    getPreviousFocusableElement,
    getFirstFocusableElement,
    getLastFocusableElement,
  };
}
