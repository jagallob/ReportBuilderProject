import React from "react";

const TableConfig = ({ component, onUpdate }) => {
  return (
    <div className="mt-2">
      <label className="block text-xs text-gray-500 mb-1">
        Configuración de tabla
      </label>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-500">Filas</label>
          <input
            type="number"
            value={component.rows || 3}
            onChange={(e) => onUpdate("rows", parseInt(e.target.value))}
            className="w-full p-1 border rounded text-sm"
            min="1"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Columnas</label>
          <input
            type="number"
            value={component.columns || 2}
            onChange={(e) => onUpdate("columns", parseInt(e.target.value))}
            className="w-full p-1 border rounded text-sm"
            min="1"
          />
        </div>
      </div>
      <div className="mt-2">
        <label className="block text-xs text-gray-500">Fuente de datos</label>
        <select
          value={component.dataSource?.sourceType || "manual"}
          onChange={(e) => onUpdate("dataSource.sourceType", e.target.value)}
          className="w-full p-1 border rounded text-sm"
        >
          <option value="manual">Manual</option>
          <option value="excel">Excel</option>
        </select>
      </div>
    </div>
  );
};

export default TableConfig;
