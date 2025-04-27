import React from "react";
import ExcelUploadButton from "./ExcelUploadButton";

const ConfigurationPanel = ({
  selectedItem,
  template,
  updateTemplate,
  setIsModalOpen,
  removeEvent,
}) => {
  return (
    <div className="w-80 bg-white p-4 border-l border-gray-200 overflow-y-auto">
      <h2 className="font-semibold text-lg mb-4">Configuración</h2>

      {selectedItem.type === "section" && (
        <div className="space-y-4">
          <h3 className="font-medium text-blue-600">
            Sección: {template.sections[selectedItem.index].title}
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título
            </label>
            <input
              type="text"
              value={template.sections[selectedItem.index].title}
              onChange={(e) =>
                updateTemplate(
                  `sections.${selectedItem.index}.title`,
                  e.target.value
                )
              }
              className="w-full p-2 border rounded text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={template.sections[selectedItem.index].type}
              onChange={(e) =>
                updateTemplate(
                  `sections.${selectedItem.index}.type`,
                  e.target.value
                )
              }
              className="w-full p-2 border rounded text-sm"
            >
              <option value="text">Texto</option>
              <option value="composite">Compuesto</option>
            </select>
          </div>

          <ExcelUploadButton sectionIndex={selectedItem.index} />

          <div className="mt-4">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">
                Sucesos
              </label>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
              >
                + Agregar Suceso
              </button>
            </div>
            {template.sections[selectedItem.index].events?.length > 0 ? (
              <div className="mt-2 space-y-2">
                {template.sections[selectedItem.index].events.map(
                  (event, eventIndex) => (
                    <div
                      key={event.id || eventIndex}
                      className="p-2 bg-yellow-50 border border-yellow-200 rounded"
                    >
                      <div className="flex justify-between">
                        <div className="font-medium">{event.title}</div>
                        <button
                          onClick={() =>
                            removeEvent(selectedItem.index, eventIndex)
                          }
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          ×
                        </button>
                      </div>
                      <div className="text-sm text-gray-600">{event.date}</div>
                      <div className="text-xs mt-1">{event.description}</div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="mt-2 text-sm text-gray-500">
                No hay sucesos en esta sección
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurationPanel;
