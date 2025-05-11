import { useEffect, useState } from "react";

const TextConfig = ({ component, onUpdate, sectionData }) => {
  const [excelColumns, setExcelColumns] = useState([]);

  useEffect(() => {
    if (sectionData?.excelData?.headers) {
      setExcelColumns(sectionData.excelData.headers);
    }
  }, [sectionData]);

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
          </div>

          {excelColumns.length > 1 && (
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
        </div>
      )}

      {!component.autoGenerate && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Contenido manual
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
