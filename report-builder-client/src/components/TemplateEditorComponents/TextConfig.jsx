import React from "react";

const TextConfig = ({ component, onUpdate }) => {
  return (
    <textarea
      value={component.content || ""}
      onChange={(e) => onUpdate("content", e.target.value)}
      className="w-full p-2 border rounded mt-2"
      placeholder="Escribe el contenido aquí..."
      rows={3}
    />
  );
};

export default TextConfig;
