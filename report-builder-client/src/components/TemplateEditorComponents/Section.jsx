import React from "react";
import { useDrop } from "react-dnd";
import Component from "./Component";
import ExcelDataPreview from "./ExcelDataPreview";
import EventsList from "./EventsList";

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
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ["COMPONENT_TYPE", "COMPONENT"],
    drop: (item, monitor) => {
      if (monitor.getItemType() === "COMPONENT_TYPE") {
        addComponent(index, item.type);
      } else {
        moveComponent(item.sectionIndex, item.componentIndex, index, 0);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`mb-4 p-4 rounded-lg border-2 ${
        isOver ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white"
      } ${
        selectedItem?.type === "section" && selectedItem.index === index
          ? "ring-2 ring-blue-500"
          : ""
      }`}
      onClick={() => setSelectedItem({ type: "section", index })}
    >
      <div className="flex justify-between items-center mb-3">
        <input
          type="text"
          value={section.title}
          onChange={(e) =>
            updateTemplate(`sections.${index}.title`, e.target.value)
          }
          className="text-lg font-semibold w-full p-2 border rounded"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeSection(index);
          }}
          className="ml-2 text-red-500 hover:text-red-700"
        >
          Eliminar
        </button>
      </div>

      {section.excelData && (
        <ExcelDataPreview
          excelData={section.excelData}
          handleFileUpload={(e) => handleFileUpload(index, e)}
        />
      )}

      {section.events && (
        <EventsList
          events={section.events}
          removeEvent={(eventIndex) => removeEvent(index, eventIndex)}
        />
      )}

      <div className="space-y-2">
        {section.components.map((component, compIndex) => (
          <Component
            key={component.componentId}
            component={component}
            sectionIndex={index}
            componentIndex={compIndex}
            isSelected={
              selectedItem?.type === "component" &&
              selectedItem.sectionIndex === index &&
              selectedItem.componentIndex === compIndex
            }
            onSelect={() =>
              setSelectedItem({
                type: "component",
                sectionIndex: index,
                componentIndex: compIndex,
              })
            }
            onUpdate={(path, value) =>
              updateTemplate(
                `sections.${index}.components.${compIndex}.${path}`,
                value
              )
            }
            onMove={moveComponent}
            removeComponent={removeComponent}
          />
        ))}
      </div>
    </div>
  );
};

export default Section;
