import { useDrag, useDrop } from "react-dnd";
import TextConfig from "./TextConfig";
import TableConfig from "./TableConfig";
import ChartConfig from "./ChartConfig";
import KpiConfig from "./KpiConfig";
import ImageConfig from "./ImageConfig";
import ChartRenderer from "../Renders/ChartRenderer";
import ImageRenderer from "../Renders/ImageRenderer";

const Component = ({
  component,
  sectionIndex,
  componentIndex,
  isSelected,
  onSelect,
  onUpdate,
  onMove,
  removeComponent,
  excelData,
  sectionData, // <-- Accept sectionData as prop
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
    { type: "image", name: "Imagen", icon: "🖼️" },
  ];

  // Componente wrapper para mostrar la previsualización
  const renderPreview = () => {
    if (component.type === "chart") {
      // Mostrar el gráfico solo si la fuente es Excel y hay datos y mapeos
      if (
        component.dataSource?.sourceType === "excel" &&
        excelData?.data &&
        component.dataSource?.mappings?.xAxisField &&
        component.dataSource?.mappings?.yAxisField
      ) {
        return <ChartRenderer component={component} excelData={excelData} />;
      }
    } else if (component.type === "image") {
      // Mostrar la imagen si hay datos de imagen
      if (component.imageData) {
        return <ImageRenderer component={component} />;
      }
    }
    return null;
  };

  const preview = renderPreview();

  const renderConfig = () => {
    switch (component.type) {
      case "text":
        return (
          <div className="space-y-3">
            {/* Solo configuración básica del componente */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Contenido del texto
              </label>
              <textarea
                value={component.content || ""}
                onChange={(e) => onUpdate("content", e.target.value)}
                className="w-full p-2 border rounded text-sm"
                rows={3}
                placeholder="Escribe el contenido del texto..."
              />
            </div>

            {/* Mensaje informativo */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-700">
                💡 <strong>Configuración avanzada:</strong> Usa el panel lateral
                para configurar la generación de narrativa con AI.
              </p>
            </div>
          </div>
        );
      case "table":
        // MEJORA: Pasar sectionData para que pueda acceder a los datos de Excel
        return (
          <TableConfig
            component={component}
            onUpdate={onUpdate}
            sectionData={sectionData}
          />
        );
      case "chart":
        return (
          <>
            <ChartConfig
              component={component}
              onUpdate={onUpdate}
              excelData={excelData}
              sectionData={sectionData}
            />
            {preview && (
              <div className="mt-4 p-3 border rounded bg-gray-50">
                {" "}
                <h4 className="text-sm font-medium mb-2">Previsualización</h4>
                {preview}
              </div>
            )}
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
      case "image":
        return (
          <>
            <ImageConfig
              component={component}
              onUpdate={onUpdate}
            />
            {preview && (
              <div className="mt-4 p-3 border rounded bg-gray-50">
                <h4 className="text-sm font-medium mb-2">Previsualización</h4>
                {preview}
              </div>
            )}
          </>
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
      const data =
        component.dataSource?.excelData ||
        excelData ||
        (component.dataSource?.sourceType === "excel" && component.excelData);

      const mappings = component.dataSource.mappings || {};
      return !!(
        data?.data?.length > 0 &&
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
      {/* Mostrar advertencia si no hay datos cargados */}
      {!hasDataToShow() && component.type === "chart" && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
          <p>Para visualizar el gráfico, asegúrate de:</p>
          <ol className="list-decimal ml-4 mt-1">
            <li>Cargar un archivo Excel</li>
            <li>Seleccionar las columnas para los ejes X e Y</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default Component;
