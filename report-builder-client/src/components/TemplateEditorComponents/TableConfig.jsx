import React, { useState, useEffect } from "react";

const TableConfig = ({ component, onUpdate, sectionData }) => {
  const [excelColumns, setExcelColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);

  // Cuando cambia el componente o sus datos de Excel
  useEffect(() => {
    // Buscar datos en múltiples ubicaciones posibles
    const excelData =
      component.dataSource?.excelData || // 1. Datos directos en componente
      component.excelData || // 2. Datos heredados (para compatibilidad)
      (component.dataSource?.sourceType === "excel" && sectionData?.excelData); // 3. Datos de sección

    if (excelData?.headers) {
      setExcelColumns(excelData.headers);

      // Inicializar columnas seleccionadas
      const currentSelected = component.dataSource?.selectedColumns;
      const newSelected =
        currentSelected && currentSelected.length > 0
          ? currentSelected.filter((col) => excelData.headers.includes(col))
          : excelData.headers;

      if (!currentSelected || currentSelected.length === 0) {
        onUpdate("dataSource.selectedColumns", newSelected);
      }
      setSelectedColumns(newSelected);
    }
  }, [component.dataSource, component.excelData, sectionData]);

  const handleColumnToggle = (column) => {
    let newSelectedColumns;
    if (selectedColumns.includes(column)) {
      newSelectedColumns = selectedColumns.filter((col) => col !== column);
    } else {
      newSelectedColumns = [...selectedColumns, column];
    }

    setSelectedColumns(newSelectedColumns);
    onUpdate("dataSource.selectedColumns", newSelectedColumns);
  };

  const handleRowsChange = (e) => {
    const rows = parseInt(e.target.value) || 1;
    onUpdate("rows", Math.max(1, Math.min(20, rows)));
  };

  const handleColumnsChange = (e) => {
    const columns = parseInt(e.target.value) || 1;
    onUpdate("columns", Math.max(1, Math.min(10, columns)));
  };

  return (
    <div className="space-y-3 mt-2">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-500">Filas</label>
          <input
            type="number"
            min="1"
            max="20"
            value={component.rows || 3}
            onChange={handleRowsChange}
            className="w-full p-1 border rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Columnas</label>
          <input
            type="number"
            min="1"
            max="10"
            value={component.columns || 2}
            onChange={handleColumnsChange}
            className="w-full p-1 border rounded text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500">Fuente de datos</label>
        <select
          value={component.dataSource?.sourceType || "manual"}
          onChange={(e) => onUpdate("dataSource.sourceType", e.target.value)}
          className="w-full p-1 border rounded text-sm"
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
          />
        </div>
      )}

      {/* Selección de columnas Excel */}
      {component.dataSource?.sourceType === "excel" &&
        excelColumns.length > 0 && (
          <div className="mt-2 p-2 bg-gray-50 border rounded">
            <h4 className="text-xs font-medium mb-1">Columnas a mostrar</h4>
            <div className="max-h-40 overflow-y-auto">
              {excelColumns.map((column, idx) => (
                <div key={idx} className="flex items-center mb-1">
                  <input
                    type="checkbox"
                    id={`col-${idx}`}
                    checked={selectedColumns.includes(column)}
                    onChange={() => handleColumnToggle(column)}
                    className="mr-2"
                  />
                  <label htmlFor={`col-${idx}`} className="text-xs">
                    {column}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Si no hay datos Excel cargados pero la fuente es Excel
      {component.dataSource?.sourceType === "excel" &&
        excelColumns.length === 0 && (
          <div className="mt-2 p-2 bg-gray-100 border rounded text-xs text-gray-500">
            No hay datos de Excel disponibles. Por favor, carga un archivo Excel
            en la sección para poder configurar la tabla.
          </div>
        )} */}
    </div>
  );
};

export default TableConfig;
