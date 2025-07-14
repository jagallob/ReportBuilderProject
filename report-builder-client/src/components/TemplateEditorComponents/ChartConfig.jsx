import { useState, useEffect } from "react";

const ChartConfig = ({ component, onUpdate, sectionData }) => {
  const [excelColumns, setExcelColumns] = useState([]);
  const [dataMapping, setDataMapping] = useState({
    xAxisField: "",
    yAxisField: "",
    seriesField: "",
  });

  // Efecto para manejar cambios en los datos
  useEffect(() => {
    // Buscar datos en el componente o en la sección
    const excelData =
      component.dataSource?.excelData ||
      (component.dataSource?.sourceType === "excel" && sectionData?.excelData);

    if (excelData?.headers) {
      setExcelColumns(excelData.headers);

      // Inicializar mapeos si no existen
      if (!component.dataSource.mappings) {
        const initialMappings = {
          xAxisField: excelData.headers[0] || "",
          yAxisField: excelData.headers[1] || "",
          seriesField: excelData.headers[2] || "",
        };
        onUpdate("dataSource.mappings", initialMappings);
        setDataMapping(initialMappings);
      } else {
        setDataMapping(component.dataSource.mappings);
      }
    }
  }, [component.dataSource, sectionData]);

  const handleMappingChange = (field, value) => {
    const newMapping = { ...dataMapping, [field]: value };
    setDataMapping(newMapping);
    onUpdate("dataSource.mappings", newMapping);
  };

  const handleChartOptionChange = (option, value) => {
    onUpdate(option, value);
  };

  return (
    <div className="space-y-3 mt-2">
      {/* Selector de tipo de gráfico */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">
          Tipo de gráfico
        </label>
        <select
          value={component.chartType || "bar"}
          onChange={(e) => handleChartOptionChange("chartType", e.target.value)}
          className="w-full p-1 border rounded text-sm"
        >
          <option value="bar">Barras</option>
          <option value="line">Líneas</option>
          <option value="pie">Circular</option>
          <option value="area">Área</option>
          <option value="scatter">Dispersión</option>
          <option value="radar">Radar</option>
        </select>
      </div>

      {/* Configuración de fuente de datos */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Fuente de datos
          </label>
          <select
            value={component.dataSource?.sourceType || "manual"}
            onChange={(e) =>
              handleChartOptionChange("dataSource.sourceType", e.target.value)
            }
            className="w-full p-1 border rounded text-sm"
          >
            <option value="manual">Manual</option>
            <option value="excel">Excel</option>
            <option value="api">API</option>
            <option value="database">Base de datos</option>
          </select>
        </div>

        {component.dataSource?.sourceType === "api" && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">URL API</label>
            <input
              type="text"
              value={component.dataSource?.apiUrl || ""}
              onChange={(e) =>
                handleChartOptionChange("dataSource.apiUrl", e.target.value)
              }
              className="w-full p-1 border rounded text-sm"
              placeholder="https://..."
            />
          </div>
        )}
      </div>

      {/* Mapeo de datos Excel */}
      {component.dataSource?.sourceType === "excel" &&
        excelColumns.length > 0 && (
          <div className="mt-2 p-2 bg-gray-50 border rounded">
            <h4 className="text-xs font-medium mb-2">Mapeo de datos</h4>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Eje X (Categorías)
                </label>
                <select
                  value={dataMapping.xAxisField || ""}
                  onChange={(e) =>
                    handleMappingChange("xAxisField", e.target.value)
                  }
                  className="w-full p-1 border rounded text-sm"
                >
                  <option value="">Seleccionar columna</option>
                  {excelColumns.map((column, idx) => (
                    <option key={`x-${idx}`} value={column}>
                      {column}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Eje Y (Valores)
                </label>
                <select
                  value={dataMapping.yAxisField || ""}
                  onChange={(e) =>
                    handleMappingChange("yAxisField", e.target.value)
                  }
                  className="w-full p-1 border rounded text-sm"
                >
                  <option value="">Seleccionar columna</option>
                  {excelColumns.map((column, idx) => (
                    <option key={`y-${idx}`} value={column}>
                      {column}
                    </option>
                  ))}
                </select>
              </div>

              {component.chartType !== "pie" && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Serie (Agrupación)
                  </label>
                  <select
                    value={dataMapping.seriesField || ""}
                    onChange={(e) =>
                      handleMappingChange("seriesField", e.target.value)
                    }
                    className="w-full p-1 border rounded text-sm"
                  >
                    <option value="">No agrupar</option>
                    {excelColumns.map((column, idx) => (
                      <option key={`s-${idx}`} value={column}>
                        {column}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Configuración adicional del gráfico */}
      <div className="p-2 bg-blue-50 border border-blue-200 rounded">
        <h4 className="text-xs font-medium mb-2">Opciones de visualización</h4>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center space-x-2 text-xs">
            <input
              type="checkbox"
              checked={component.showLegend !== false}
              onChange={(e) =>
                handleChartOptionChange("showLegend", e.target.checked)
              }
            />
            <span>Mostrar leyenda</span>
          </label>

          <label className="flex items-center space-x-2 text-xs">
            <input
              type="checkbox"
              checked={component.showTooltip !== false}
              onChange={(e) =>
                handleChartOptionChange("showTooltip", e.target.checked)
              }
            />
            <span>Mostrar tooltips</span>
          </label>

          <label className="flex items-center space-x-2 text-xs">
            <input
              type="checkbox"
              checked={component.stackBars || false}
              onChange={(e) =>
                handleChartOptionChange("stackBars", e.target.checked)
              }
              disabled={component.chartType !== "bar"}
            />
            <span>Barras apiladas</span>
          </label>

          <label className="flex items-center space-x-2 text-xs">
            <input
              type="checkbox"
              checked={component.fillArea || false}
              onChange={(e) =>
                handleChartOptionChange("fillArea", e.target.checked)
              }
              disabled={!["area", "line"].includes(component.chartType)}
            />
            <span>Rellenar área</span>
          </label>
        </div>
      </div>

      {/* Mensaje si no hay datos Excel */}
      {component.dataSource?.sourceType === "excel" &&
        excelColumns.length === 0 && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
            <p>No hay datos de Excel disponibles.</p>
            <p>
              Por favor, carga un archivo Excel en la sección para poder mapear
              los datos.
            </p>
          </div>
        )}
    </div>
  );
};

export default ChartConfig;
