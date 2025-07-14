import React from "react";
import ExcelUploadButton from "./ExcelUploadButton";
import TextConfig from "./TextConfig";
import TableConfig from "./TableConfig";
import ChartConfig from "./ChartConfig";
import KpiConfig from "./KpiConfig";

const ConfigurationPanel = ({
  selectedItem,
  updateTemplate,
  handleFileUpload,
  currentSection, // Ahora recibimos currentSection directamente
}) => {
  // Early return si no hay nada seleccionado
  if (!selectedItem) return null;

  // Función para renderizar el panel de configuración del componente específico
  const renderComponentConfig = () => {
    // Aseguramos que el componente exista antes de intentar acceder a él
    if (!currentSection?.components?.[selectedItem.componentIndex]) {
      return <div>Selecciona un componente para configurar.</div>;
    }
    const component = currentSection.components[selectedItem.componentIndex];

    const onComponentUpdate = (path, value) => {
      updateTemplate(
        `sections.${selectedItem.sectionIndex}.components.${selectedItem.componentIndex}.${path}`,
        value
      );
    };

    switch (component.type) {
      case "text":
        return (
          <TextConfig
            component={component}
            onUpdate={onComponentUpdate}
            sectionData={currentSection}
          />
        );
      case "table":
        return (
          <TableConfig
            component={component}
            onUpdate={onComponentUpdate}
            sectionData={currentSection}
          />
        );
      case "chart":
        return (
          <ChartConfig
            component={component}
            onUpdate={onComponentUpdate}
            sectionData={currentSection}
          />
        );
      case "kpi":
        return <KpiConfig component={component} onUpdate={onComponentUpdate} />;
      default:
        return <div>Tipo de componente no soportado</div>;
    }
  };

  return (
    <div className="w-96 bg-white p-4 border-l border-gray-200 overflow-y-auto flex flex-col">
      <h2 className="font-semibold text-lg mb-4">Configuración</h2>

      <div className="flex-grow overflow-y-auto">
        {selectedItem.type === "section" && currentSection ? (
          // Panel de configuración para una SECCIÓN
          <div className="space-y-4">
            <h3 className="font-medium text-blue-600">
              Sección: {currentSection.title}
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título
              </label>
              <input
                type="text"
                value={currentSection.title}
                onChange={(e) =>
                  updateTemplate(
                    `sections.${selectedItem.index}.title`,
                    e.target.value
                  )
                }
                className="w-full p-2 border rounded text-sm"
              />
            </div>

            <ExcelUploadButton
              sectionIndex={selectedItem.index}
              handleFileUpload={handleFileUpload}
            />

            {currentSection.excelData && (
              <div className="p-2 bg-green-50 border border-green-200 rounded">
                <p className="text-sm font-medium text-green-700">
                  Datos cargados: {currentSection.excelData.headers.length}{" "}
                  columnas, {currentSection.excelData.data.length} filas
                </p>
              </div>
            )}
          </div>
        ) : (
          // Panel de configuración para un COMPONENTE
          currentSection && (
            <div className="space-y-4">
              <h3 className="font-medium text-blue-600">
                Componente:{" "}
                {currentSection.components?.[selectedItem.componentIndex]?.type}
              </h3>
              {renderComponentConfig()}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ConfigurationPanel;
