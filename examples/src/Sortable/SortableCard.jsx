import { useRef } from "react";

import { useDrag, useDrop } from "react-dnd";
import { ItemTypes } from "./ItemTypes";

import "./Sortable.css";

const dropTargetAboveStyle = {
  position: "absolute",
  top: -8,
  left: -8,
  right: -8,
  border: "2px solid #00ff00",
};

const dropTargetBelowStyle = {
  position: "absolute",
  bottom: -8,
  left: -8,
  right: -8,
  border: "2px solid #00ff00",
};

export function SortableCard({ id, text, index, moveCard }) {
  const ref = useRef(null);

  const [{ isOver, isAbove, isBelow }, drop] = useDrop({
    accept: ItemTypes.CARD,
    collect(monitor) {
      const dragIndex = monitor.getItem()?.index ?? -1;
      return {
        isOver: monitor.isOver(),
        isAbove: dragIndex > index,
        isBelow: dragIndex < index,
      };
    },
    drop(item) {
      moveCard(item.index, index);
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: () => {
      return { id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  return (
    <div ref={ref} className="card" style={{ opacity }} tabIndex={0}>
      {isOver && isAbove ? <div style={dropTargetAboveStyle} /> : null}
      {text}
      {isOver && isBelow ? <div style={dropTargetBelowStyle} /> : null}
    </div>
  );
}
