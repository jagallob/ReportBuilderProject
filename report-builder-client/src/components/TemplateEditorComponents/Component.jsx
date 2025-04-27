import React from "react";
import { useDrag, useDrop } from "react-dnd";
import TextConfig from "./TextConfig";
import TableConfig from "./TableConfig";
import ChartConfig from "./ChartConfig";
import KpiConfig from "./KpiConfig";

const Component = ({
  component,
  sectionIndex,
  componentIndex,
  isSelected,
  onSelect,
  onUpdate,
  onMove,
  removeComponent,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "COMPONENT",
    item: {
      sectionIndex,
      componentIndex,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "COMPONENT",
    drop: (item) =>
      onMove(
        item.sectionIndex,
        item.componentIndex,
        sectionIndex,
        componentIndex
      ),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const componentTypes = [
    { type: "text", name: "Texto", icon: "📝" },
    { type: "table", name: "Tabla", icon: "📊" },
    { type: "chart", name: "Gráfico", icon: "📈" },
    { type: "kpi", name: "KPI", icon: "🔢" },
  ];

  const renderConfig = () => {
    switch (component.type) {
      case "text":
        return <TextConfig component={component} onUpdate={onUpdate} />;
      case "table":
        return <TableConfig component={component} onUpdate={onUpdate} />;
      case "chart":
        return <ChartConfig component={component} onUpdate={onUpdate} />;
      case "kpi":
        return <KpiConfig component={component} onUpdate={onUpdate} />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`p-3 border rounded ${
        isDragging ? "opacity-50" : "opacity-100"
      } ${
        isOver ? "bg-blue-100 border-blue-300" : "bg-white border-gray-300"
      } ${isSelected ? "ring-2 ring-blue-500" : ""}`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <span className="mr-2">
            {componentTypes.find((t) => t.type === component.type)?.icon}
          </span>
          <select
            value={component.type}
            onChange={(e) => onUpdate("type", e.target.value)}
            className="p-1 border rounded"
            onClick={(e) => e.stopPropagation()}
          >
            {componentTypes.map((type) => (
              <option key={type.type} value={type.type}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeComponent(sectionIndex, componentIndex);
          }}
          className="text-red-500 hover:text-red-700"
        >
          Eliminar
        </button>
      </div>

      {renderConfig()}
    </div>
  );
};

export default Component;
