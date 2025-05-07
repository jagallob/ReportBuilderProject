import React, { useState, useEffect } from "react";

const ChartConfig = ({ component, onUpdate }) => {
  const [excelColumns, setExcelColumns] = useState([]);
  const [dataMapping, setDataMapping] = useState({
    xAxisField: "",
    yAxisField: "",
  });

  // Cuando cambia el componente, actualizamos el mapeo local
  useEffect(() => {
    if (component.dataSource?.excelData?.headers) {
      setExcelColumns(component.dataSource.excelData.headers);

      // Inicializar el mapeo si no existe
      if (!component.dataSource.mappings) {
        onUpdate("dataSource.mappings", {
          xAxisField: component.dataSource.excelData.headers[0] || "",
          yAxisField: component.dataSource.excelData.headers[1] || "",
        });
      } else {
        setDataMapping(component.dataSource.mappings);
      }
    }
  }, [component.dataSource?.excelData]);

  const handleMappingChange = (field, value) => {
    const newMapping = { ...dataMapping, [field]: value };
    setDataMapping(newMapping);
    onUpdate("dataSource.mappings", newMapping);
  };

  return (
    <div className="space-y-2 mt-2">
      <select
        value={component.chartType || "bar"}
        onChange={(e) => onUpdate("chartType", e.target.value)}
        className="w-full p-1 border rounded"
        onClick={(e) => e.stopPropagation()}
      >
        <option value="bar">Barras</option>
        <option value="line">Líneas</option>
        <option value="pie">Circular</option>
        <option value="area">Área</option>
        <option value="scatter">Dispersión</option>
      </select>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-500">Fuente de datos</label>
          <select
            value={component.dataSource?.sourceType || "manual"}
            onChange={(e) => onUpdate("dataSource.sourceType", e.target.value)}
            className="w-full p-1 border rounded text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="manual">Manual</option>
            <option value="excel">Excel</option>
            <option value="api">API</option>
          </select>
        </div>
        {component.dataSource?.sourceType === "api" && (
          <div>
            <label className="block text-xs text-gray-500">URL API</label>
            <input
              type="text"
              value={component.dataSource?.apiUrl || ""}
              onChange={(e) => onUpdate("dataSource.apiUrl", e.target.value)}
              className="w-full p-1 border rounded text-sm"
              placeholder="https://..."
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>

      {/* Mapeo de datos Excel */}
      {component.dataSource?.sourceType === "excel" &&
        excelColumns.length > 0 && (
          <div className="mt-2 p-2 bg-gray-50 border rounded">
            <h4 className="text-xs font-medium mb-1">Mapeo de datos</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500">
                  Eje X (Categorías)
                </label>
                <select
                  value={dataMapping.xAxisField || ""}
                  onChange={(e) =>
                    handleMappingChange("xAxisField", e.target.value)
                  }
                  className="w-full p-1 border rounded text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="">Seleccionar columna</option>
                  {excelColumns.map((column, idx) => (
                    <option key={idx} value={column}>
                      {column}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500">
                  Eje Y (Valores)
                </label>
                <select
                  value={dataMapping.yAxisField || ""}
                  onChange={(e) =>
                    handleMappingChange("yAxisField", e.target.value)
                  }
                  className="w-full p-1 border rounded text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="">Seleccionar columna</option>
                  {excelColumns.map((column, idx) => (
                    <option key={idx} value={column}>
                      {column}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

      {/* Si no hay datos Excel cargados pero la fuente es Excel */}
      {component.dataSource?.sourceType === "excel" &&
        excelColumns.length === 0 && (
          <div className="mt-2 p-2 bg-gray-100 border rounded text-xs text-gray-500">
            No hay datos de Excel disponibles. Por favor, carga un archivo Excel
            en la sección para poder mapear los datos.
          </div>
        )}
    </div>
  );
};

export default ChartConfig;
