import React from "react";
import ExcelUploadButton from "./ExcelUploadButton";
import TextConfig from "./TextConfig";
import TableConfig from "./TableConfig";
import ChartConfig from "./ChartConfig";
import KpiConfig from "./KpiConfig";
import ImageConfig from "./ImageConfig";
import AIConfigPanel from "../AI/AIConfigPanel";
import AIAnalysisPanel from "../AI/AIAnalysisPanel";
import { getDefaultAIConfig } from "../../utils/featureFlags";

const ConfigurationPanel = ({
  selectedItem,
  updateTemplate,
  handleFileUpload,
  currentSection, // Ahora recibimos currentSection directamente
  addEventToSection, // Agregar función para eventos
  setShowSelectEventsModal, // Agregar función para modal de eventos
  setSelectedItem, // Agregar función para cambiar la selección
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

    // Verificar si hay datos para análisis
    const hasDataForAnalysis = () => {
      return (
        currentSection?.excelData?.data?.length > 0 &&
        currentSection.excelData.data.length > 0
      );
    };

    switch (component.type) {
      case "text":
        return (
          <div className="space-y-6">
            {/* Configuración de AI - Panel Lateral */}
            <AIConfigPanel
              config={component.aiConfig || getDefaultAIConfig()}
              onConfigChange={(newConfig) => {
                onComponentUpdate("aiConfig", newConfig);
              }}
              hasData={hasDataForAnalysis()}
              showAdvanced={true}
            />

            {/* Panel de Análisis AI */}
            <AIAnalysisPanel
              component={component}
              onUpdate={onComponentUpdate}
              sectionData={currentSection}
            />

            {/* Configuración tradicional del componente */}
            <TextConfig component={component} onUpdate={onComponentUpdate} />
          </div>
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
        return (
          <KpiConfig
            component={component}
            onUpdate={onComponentUpdate}
            sectionData={currentSection}
          />
        );
      case "image":
        return (
          <ImageConfig
            component={component}
            onUpdate={onComponentUpdate}
          />
        );
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

            {/* Mostrar componentes de la sección para selección rápida */}
            {currentSection.components &&
              currentSection.components.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Componentes en esta sección:
                  </h4>
                  <div className="space-y-2">
                    {currentSection.components.map((component, idx) => (
                      <button
                        key={component.componentId || idx}
                        onClick={() => {
                          // Cambiar selección al componente
                          if (setSelectedItem) {
                            setSelectedItem({
                              type: "component",
                              sectionIndex: selectedItem.index,
                              componentIndex: idx,
                            });
                          }
                        }}
                        className="w-full text-left p-2 border rounded hover:bg-blue-50 text-sm"
                      >
                        📝 {component.type} -{" "}
                        {component.content
                          ? `${component.content.substring(0, 30)}...`
                          : "Sin contenido"}
                      </button>
                    ))}
                  </div>
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

      {/* Botones de Sucesos - SIEMPRE VISIBLES */}
      <div className="border-t pt-4 mt-4">
        <h3 className="font-medium text-gray-900 mb-3">Gestión de Sucesos</h3>
        <div className="space-y-2">
          <button
            onClick={() =>
              addEventToSection(selectedItem.sectionIndex || selectedItem.index)
            }
            className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            + Agregar Suceso Manual
          </button>
          <button
            onClick={() => setShowSelectEventsModal(true)}
            className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            + Agregar Sucesos Existentes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationPanel;
