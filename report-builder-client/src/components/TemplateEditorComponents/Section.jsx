import { useDrag, useDrop } from "react-dnd";
import TextConfig from "./TextConfig";
import TableConfig from "./TableConfig";
import ChartConfig from "./ChartConfig";
import KpiConfig from "./KpiConfig";
import ChartRenderer from "../Renders/ChartRenderer";

// Renombrar el componente original para evitar conflicto de nombres
const SectionComponent = ({
  component,
  sectionIndex,
  componentIndex,
  isSelected,
  onSelect,
  onUpdate,
  onMove,
  removeComponent,
  sectionData, // Ahora recibimos sectionData en lugar de solo excelData
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

  // Componente wrapper para mostrar la previsualización
  const renderPreview = () => {
    if (component.type === "chart") {
      return (
        <div className="mt-4 p-3 border rounded bg-gray-50">
          <h4 className="text-sm font-medium mb-2">Previsualización</h4>
          <ChartRenderer component={component} excelData={getExcelData()} />
        </div>
      );
    }
    return null;
  };

  // Función para obtener datos de Excel desde múltiples fuentes
  const getExcelData = () => {
    return (
      component.dataSource?.excelData ||
      sectionData?.excelData || { headers: [], rows: [] }
    );
  };

  // Función para obtener un objeto base según el tipo de componente
  const getBaseComponent = (type) => {
    switch (type) {
      case "text":
        return {
          type: "text",
          content: "",
        };
      case "table":
        return {
          type: "table",
          columns: [],
          dataSource: {
            sourceType: "manual",
            excelData: { headers: [], rows: [] },
          },
        };
      case "chart":
        return {
          type: "chart",
          chartType: "bar",
          dataSource: {
            sourceType: "manual",
            excelData: { headers: [], rows: [] },
            mappings: {},
          },
          options: {},
        };
      case "kpi":
        return {
          type: "kpi",
          value: 0,
          label: "",
        };
      default:
        return { type };
    }
  };

  const renderConfig = () => {
    const excelData = getExcelData();

    switch (component.type) {
      case "text":
        return (
          <TextConfig
            component={component}
            onUpdate={onUpdate}
            sectionData={sectionData} // Pasamos toda la sectionData
          />
        );
      case "table":
        return (
          <TableConfig
            component={component}
            onUpdate={onUpdate}
            sectionData={sectionData}
            isExcelLoaded={!!excelData?.headers?.length}
          />
        );
      case "chart":
        return (
          <>
            <ChartConfig
              component={component}
              onUpdate={onUpdate}
              excelData={excelData}
            />
            {renderPreview()}
          </>
        );
      case "kpi":
        return (
          <KpiConfig
            component={component}
            onUpdate={onUpdate}
            sectionData={sectionData}
          />
        );
      default:
        return null;
    }
  };

  // Helper para determinar si hay datos cargados para mostrar advertencia
  const hasDataToShow = () => {
    if (
      component.type === "chart" &&
      component.dataSource?.sourceType === "excel"
    ) {
      const data = getExcelData();
      const mappings = component.dataSource.mappings || {};
      return !!(
        data?.rows?.length &&
        mappings.xAxisField &&
        mappings.yAxisField
      );
    }
    return true;
  };

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`p-3 border rounded ${
        isDragging ? "opacity-50" : "opacity-100"
      } ${
        isOver ? "bg-blue-100 border-blue-300" : "bg-white border-gray-300"
      } ${isSelected ? "ring-2 ring-blue-500" : ""}`}
      onClick={(e) => {
        e.stopPropagation(); // Asegura que solo este click seleccione
        if (onSelect) onSelect();
      }}
      style={{ cursor: "pointer" }}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <span className="mr-2">
            {componentTypes.find((t) => t.type === component.type)?.icon}
          </span>
          <select
            value={component.type}
            onChange={(e) => {
              const newType = e.target.value;
              if (newType !== component.type) {
                const newComponent = getBaseComponent(newType);
                // Mantener el id si existe para evitar problemas de key
                if (component.componentId)
                  newComponent.componentId = component.componentId;
                if (onUpdate)
                  onUpdate("components." + componentIndex, newComponent);
                if (onSelect) onSelect();
              }
            }}
            className="p-1 border rounded"
            onClick={(e) => e.stopPropagation()} // Evita que el select cambie la selección
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

      {/* Mostrar advertencia si no hay datos cargados */}
      {!hasDataToShow() && component.type === "chart" && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
          <p>Para visualizar el gráfico, asegúrate de:</p>
          <ol className="list-decimal ml-4 mt-1">
            <li>Cargar un archivo Excel en la sección</li>
            <li>Seleccionar las columnas para los ejes X e Y</li>
          </ol>
        </div>
      )}
    </div>
  );
};

const Section = ({
  section,
  index,
  selectedItem,
  setSelectedItem,
  removeSection,
  addComponent,
  moveComponent,
  removeComponent,
  updateTemplate,
}) => {
  const hasComponents = section.components && section.components.length > 0;

  // Habilitar drop para arrastrar desde la paleta
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "COMPONENT_TYPE",
    drop: (item) => {
      // item.type es el tipo de componente arrastrado
      addComponent(index, item.type);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`mb-6 border rounded-lg p-4 bg-white shadow-sm transition-all ${
        isOver && canDrop ? "ring-2 ring-green-400 bg-green-50" : ""
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-blue-700">
          {section.title || `Sección ${index + 1}`}
        </h2>
        <button
          onClick={() => removeSection(index)}
          className="text-red-500 hover:text-red-700 text-sm"
        >
          Eliminar sección
        </button>
      </div>
      {/* Botón para agregar componentes si no hay ninguno */}
      {!hasComponents && (
        <div className="my-4 p-4 bg-gray-50 border border-gray-200 rounded flex flex-col items-center">
          <p className="mb-2 text-gray-500">
            Esta sección no tiene componentes.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => addComponent(index, "text")}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs"
            >
              + Texto
            </button>
            <button
              onClick={() => addComponent(index, "table")}
              className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs"
            >
              + Tabla
            </button>
            <button
              onClick={() => addComponent(index, "chart")}
              className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-xs"
            >
              + Gráfico
            </button>
            <button
              onClick={() => addComponent(index, "kpi")}
              className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-xs"
            >
              + KPI
            </button>
          </div>
        </div>
      )}
      {/* Renderizar cada componente existente */}
      {hasComponents &&
        section.components.map((component, componentIndex) => (
          <SectionComponent
            key={component.componentId || componentIndex}
            component={component}
            sectionIndex={index}
            componentIndex={componentIndex}
            isSelected={
              selectedItem?.type === "component" &&
              selectedItem.sectionIndex === index &&
              selectedItem.componentIndex === componentIndex
            }
            onSelect={() =>
              setSelectedItem({
                type: "component",
                sectionIndex: index,
                componentIndex,
              })
            }
            onUpdate={updateTemplate}
            onMove={moveComponent}
            removeComponent={removeComponent}
            sectionData={section}
          />
        ))}
    </div>
  );
};

export default Section;
