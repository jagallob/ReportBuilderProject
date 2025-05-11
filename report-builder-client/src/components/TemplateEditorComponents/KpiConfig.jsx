import React, { useState, useEffect } from "react";

const KpiConfig = ({ component, onUpdate, sectionData }) => {
  const [excelColumns, setExcelColumns] = useState([]);

  useEffect(() => {
    // Buscar datos en el componente o en la sección
    const excelData =
      component.dataSource?.excelData ||
      (component.dataSource?.sourceType === "excel" && sectionData?.excelData);

    if (excelData?.headers) {
      setExcelColumns(excelData.headers);

      // Inicializar mapeo si no existe
      if (!component.dataSource.mappings) {
        onUpdate("dataSource.mappings", {
          dataField: excelData.headers[0] || "",
          rowIndex: 0,
        });
      }
    }
  }, [component.dataSource, sectionData?.excelData]);

  const stopPropagation = (e) => e.stopPropagation();

  return (
    <div className="space-y-3 mt-2">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-500">Valor</label>
          <input
            type="text"
            value={component.value || ""}
            onChange={(e) => onUpdate("value", e.target.value)}
            className="w-full p-1 border rounded text-sm"
            placeholder="0"
            disabled={component.dataSource?.sourceType === "excel"}
            onClick={stopPropagation}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Unidad</label>
          <input
            type="text"
            value={component.unit || ""}
            onChange={(e) => onUpdate("unit", e.target.value)}
            className="w-full p-1 border rounded text-sm"
            placeholder="%"
            onClick={stopPropagation}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500">Título (opcional)</label>
        <input
          type="text"
          value={component.title || ""}
          onChange={(e) => onUpdate("title", e.target.value)}
          className="w-full p-1 border rounded text-sm"
          onClick={stopPropagation}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500">Fuente de datos</label>
        <select
          value={component.dataSource?.sourceType || "manual"}
          onChange={(e) => onUpdate("dataSource.sourceType", e.target.value)}
          className="w-full p-1 border rounded text-sm"
          onClick={stopPropagation}
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
            onClick={stopPropagation}
          />
        </div>
      )}

      {component.dataSource?.sourceType === "excel" &&
        excelColumns.length > 0 && (
          <div className="mt-2 p-2 bg-gray-50 border rounded">
            <h4 className="text-xs font-medium mb-1">Seleccionar dato</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500">Columna</label>
                <select
                  value={component.dataSource.mappings?.dataField || ""}
                  onChange={(e) =>
                    onUpdate("dataSource.mappings.dataField", e.target.value)
                  }
                  className="w-full p-1 border rounded text-xs"
                  onClick={stopPropagation}
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
                <label className="block text-xs text-gray-500">Fila</label>
                <input
                  type="number"
                  min="0"
                  value={component.dataSource.mappings?.rowIndex || 0}
                  onChange={(e) =>
                    onUpdate(
                      "dataSource.mappings.rowIndex",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full p-1 border rounded text-xs"
                  onClick={stopPropagation}
                />
              </div>
            </div>
          </div>
        )}

      <div>
        <label className="block text-xs text-gray-500">Formato</label>
        <select
          value={component.format || "number"}
          onChange={(e) => onUpdate("format", e.target.value)}
          className="w-full p-1 border rounded text-sm"
          onClick={stopPropagation}
        >
          <option value="number">Número</option>
          <option value="currency">Moneda</option>
          <option value="percent">Porcentaje</option>
        </select>
      </div>

      {component.dataSource?.sourceType === "excel" &&
        excelColumns.length === 0 && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
            No hay datos de Excel disponibles. Carga un archivo Excel en la
            sección.
          </div>
        )}
    </div>
  );
};

export default KpiConfig;
