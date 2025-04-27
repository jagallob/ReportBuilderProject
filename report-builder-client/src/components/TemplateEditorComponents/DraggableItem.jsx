import React from "react";
import { useDrag } from "react-dnd";

const DraggableItem = ({ type, icon, name }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "COMPONENT_TYPE",
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`flex items-center p-2 mb-2 rounded border cursor-move bg-white ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <span className="mr-2">{icon}</span>
      {name}
    </div>
  );
};

export default DraggableItem;
