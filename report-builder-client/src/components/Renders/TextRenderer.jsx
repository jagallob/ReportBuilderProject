export const TextRenderer = ({ component }) => {
  return (
    <div className="prose max-w-none">
      {component.content || "Sin contenido de texto"}
    </div>
  );
};
