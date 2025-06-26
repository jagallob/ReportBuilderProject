import { useEffect, useState } from "react";
import NarrativeGenerator from "../AI/NarrativeGenerator";

const TextConfig = ({ component, onUpdate, sectionData }) => {
  const [excelColumns, setExcelColumns] = useState([]);
  const [showNarrativeGenerator, setShowNarrativeGenerator] = useState(false);

  useEffect(() => {
    console.log("sectionData recibido:", sectionData);
    console.log("Headers de Excel:", sectionData?.excelData?.headers);

    if (
      sectionData?.excelData?.headers &&
      Array.isArray(sectionData.excelData.headers)
    ) {
      console.log(
        "Headers de Excel encontrados:",
        sectionData.excelData.headers
      );
      setExcelColumns(sectionData.excelData.headers);
    } else {
      console.warn("No se encontraron headers de Excel en sectionData", {
        sectionData: sectionData,
      });
    }
  }, [sectionData]);

  console.log("Estado actual de excelColumns:", excelColumns);

  // Handler para recibir la narrativa generada y actualizar el contenido
  const handleNarrativeGenerated = (narrative) => {
    onUpdate("content", narrative);
    setShowNarrativeGenerator(false);
  };

  // Ejemplo de callback para insertar la narrativa en otro campo (como conclusiones)
  const handleNarrativeForConclusions = (narrative) => {
    onUpdate("conclusions", narrative); // 'conclusions' sería el campo de conclusiones en tu modelo/component
    setShowNarrativeGenerator(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          <input
            type="checkbox"
            checked={component.autoGenerate || false}
            onChange={(e) => onUpdate("autoGenerate", e.target.checked)}
            className="mr-2"
          />
          Generar narrativa automática
        </label>
        <p className="text-xs text-gray-500">
          Cuando está activado, se generará un texto analítico basado en los
          datos de Excel.
        </p>
      </div>

      {component.autoGenerate && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              Tipo de análisis
            </label>
            <select
              value={component.analysisConfig?.templateType || "default"}
              onChange={(e) =>
                onUpdate("analysisConfig.templateType", e.target.value)
              }
              className="w-full p-2 border rounded"
            >
              <option value="default">General</option>
              <option value="sales">Ventas</option>
              <option value="financial">Financiero</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          {component.analysisConfig?.templateType === "custom" && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Plantilla personalizada
              </label>
              <textarea
                value={component.analysisConfig?.customTemplate || ""}
                onChange={(e) =>
                  onUpdate("analysisConfig.customTemplate", e.target.value)
                }
                className="w-full p-2 border rounded"
                rows={4}
                placeholder="Ej: Las ventas en {month} fueron {value} unidades..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Usa {"{columna}"} para datos y {"{avg}"}, {"{max}"}, etc. para
                análisis.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              Columna a analizar
            </label>
            {excelColumns.length > 0 ? (
              <select
                value={component.analysisConfig?.dataColumn || ""}
                onChange={(e) =>
                  onUpdate("analysisConfig.dataColumn", e.target.value)
                }
                className="w-full p-2 border rounded"
              >
                <option value="">Seleccionar columna</option>
                {excelColumns.map((col, idx) => (
                  <option key={idx} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full p-2 border rounded bg-gray-50 text-gray-500">
                No hay datos de Excel cargados. Por favor, carga un archivo
                Excel primero.
              </div>
            )}
          </div>

          {excelColumns.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Columna de categoría (opcional)
              </label>
              <select
                value={component.analysisConfig?.categoryColumn || ""}
                onChange={(e) =>
                  onUpdate("analysisConfig.categoryColumn", e.target.value)
                }
                className="w-full p-2 border rounded"
              >
                <option value="">No usar</option>
                {excelColumns.map((col, idx) => (
                  <option key={idx} value={col}>
                    {col}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Se usará para identificar meses, productos, etc.
              </p>
            </div>
          )}

          {/* Botón para activar el generador de narrativa */}
          <div>
            <button
              type="button"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-2"
              onClick={() => setShowNarrativeGenerator((prev) => !prev)}
            >
              {showNarrativeGenerator
                ? "Ocultar generador automático"
                : "Generar narrativa automática"}
            </button>
            {showNarrativeGenerator && (
              <div className="mt-4 border rounded p-4 bg-blue-50">
                <NarrativeGenerator
                  excelData={sectionData?.excelData}
                  onNarrativeGenerated={handleNarrativeGenerated}
                />
                {/*
                <NarrativeGenerator
                  excelData={sectionData?.excelData}
                  onNarrativeGenerated={handleNarrativeForConclusions}
                />
                */}
              </div>
            )}
          </div>
        </div>
      )}

      {!component.autoGenerate && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Contenido manual o generado
          </label>
          <textarea
            value={component.content || ""}
            onChange={(e) => onUpdate("content", e.target.value)}
            className="w-full p-2 border rounded"
            rows={6}
            placeholder="Escribe tu contenido o usa {columna} para datos de Excel"
          />
          {excelColumns.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Tip: Usa {"{columna}"} para insertar datos directamente desde
              Excel.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TextConfig;
