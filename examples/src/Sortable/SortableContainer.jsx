import { useState, useCallback } from "react";
import { SortableCard } from "./SortableCard";

const style = {
  width: 400,
};

export default function SortableContainer() {
  const [cards, setCards] = useState([
    { id: 1, text: "Write a cool JS library" },
    { id: 2, text: "Make it generic enough" },
    { id: 3, text: "Write README" },
    { id: 4, text: "Create some examples" },
    {
      id: 5,
      text: "Spam in Twitter and IRC to promote it (note that this element is taller than the others)",
    },
    { id: 6, text: "???" },
    { id: 7, text: "PROFIT" },
  ]);

  const moveCard = useCallback(
    (dragIndex, hoverIndex) => {
      const dragCard = cards[dragIndex];
      setCards((currState) => {
        const newcards = [...currState];
        newcards.splice(dragIndex, 1); // removing what you are dragging.
        newcards.splice(hoverIndex, 0, dragCard); // inserting it into hoverIndex.
        return newcards;
      });
    },
    [cards]
  );

  return (
    <div style={style}>
      {cards.map((card, index) => (
        <SortableCard
          key={card.id}
          index={index}
          id={card.id}
          text={card.text}
          moveCard={moveCard}
        />
      ))}
    </div>
  );
}
