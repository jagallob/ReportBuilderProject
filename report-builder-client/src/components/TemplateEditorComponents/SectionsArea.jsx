import React from "react";
import Section from "./Section";

const SectionsArea = ({
  template,
  selectedItem,
  setSelectedItem,
  addSection,
  removeSection,
  addComponent,
  moveComponent,
  removeComponent,
  handleFileUpload,
  onSave,
  onCancel,
  initialTemplate,
}) => {
  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {initialTemplate?.id ? "Editar Plantilla" : "Nueva Plantilla"}
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(template)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Guardar Plantilla
          </button>
        </div>
      </div>

      {template.sections.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">
            No hay secciones en esta plantilla
          </p>
          <button
            onClick={addSection}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Crear primera sección
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {template.sections.map((section, index) => (
            <Section
              key={section.sectionId}
              section={section}
              index={index}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              removeSection={removeSection}
              addComponent={addComponent}
              moveComponent={moveComponent}
              removeComponent={removeComponent}
              handleFileUpload={handleFileUpload}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SectionsArea;
