import React from "react";
import { useDrop } from "react-dnd";
import Component from "./Component";

const Section = ({
  section,
  index,
  selectedItem,
  setSelectedItem,
  removeSection,
  addComponent,
  moveComponent,
  removeComponent,
  handleFileUpload,
  updateTemplate,
  removeEvent,
}) => {
  const isSelected =
    selectedItem &&
    selectedItem.type === "section" &&
    selectedItem.index === index;

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "COMPONENT_TYPE",
    drop: (item) => {
      addComponent(index, item.type);
      return { dropped: true };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const getSectionStyle = () => {
    let style = "p-4 border rounded mb-4 ";

    if (isSelected) {
      style += "ring-2 ring-blue-500 ";
    } else {
      style += "border-gray-300 ";
    }

    if (isOver) {
      style += "bg-blue-50";
    } else {
      style += "bg-white";
    }

    return style;
  };

  return (
    <div
      ref={drop}
      className={getSectionStyle()}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedItem({ type: "section", index });
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">{section.title}</h3>
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedItem({ type: "section", index });
            }}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            Editar
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeSection(index);
            }}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            Eliminar
          </button>
        </div>
      </div>

      {!section.excelData && (
        <div className="mb-4">
          <input
            type="file"
            id={`excel-upload-${index}`}
            accept=".xlsx,.xls,.csv"
            style={{ display: "none" }}
            onChange={(e) => handleFileUpload(index, e)}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              document.getElementById(`excel-upload-${index}`).click();
            }}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
          >
            Cargar datos Excel
          </button>
        </div>
      )}

      {section.excelData && (
        <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded">
          <div className="flex justify-between items-center">
            <span className="font-medium text-green-600">
              Datos Excel cargados
            </span>
            <span className="text-sm text-green-700">
              {section.excelData.headers.length} columnas,{" "}
              {section.excelData.data.length} filas
            </span>
          </div>
        </div>
      )}

      {section.components.length > 0 ? (
        <div className="space-y-3">
          {section.components.map((component, componentIndex) => (
            <Component
              key={component.componentId}
              component={component}
              sectionIndex={index}
              componentIndex={componentIndex}
              isSelected={
                selectedItem &&
                selectedItem.type === "component" &&
                selectedItem.sectionIndex === index &&
                selectedItem.componentIndex === componentIndex
              }
              onSelect={(e) => {
                e.stopPropagation();
                setSelectedItem({
                  type: "component",
                  sectionIndex: index,
                  componentIndex,
                });
              }}
              onUpdate={(path, value) => {
                updateTemplate(`components.${componentIndex}.${path}`, value);
              }}
              onMove={moveComponent}
              removeComponent={removeComponent}
              sectionData={section} // <-- Pass sectionData to Component
            />
          ))}
        </div>
      ) : (
        <div className="p-4 border border-dashed border-gray-300 rounded text-center text-gray-500">
          Arrastra componentes aquí o
          <div className="flex justify-center gap-2 mt-2">
            {["text", "table", "chart", "kpi"].map((type) => (
              <button
                key={type}
                onClick={(e) => {
                  e.stopPropagation();
                  addComponent(index, type);
                }}
                className="px-2 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
              >
                + {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {section.events && section.events.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Sucesos</h4>
          <div className="grid grid-cols-1 gap-2">
            {section.events.map((event, eventIndex) => (
              <div
                key={event.id || eventIndex}
                className="p-2 bg-yellow-50 border border-yellow-200 rounded"
              >
                <div className="flex justify-between">
                  <span className="font-medium">{event.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeEvent(eventIndex);
                    }}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    ×
                  </button>
                </div>
                <span className="text-sm text-gray-600">{event.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Section;
