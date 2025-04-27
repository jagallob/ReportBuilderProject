import React from "react";

const KpiConfig = ({ component, onUpdate }) => {
  return (
    <div className="mt-2">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-500">Valor</label>
          <input
            type="text"
            value={component.value || ""}
            onChange={(e) => onUpdate("value", e.target.value)}
            className="w-full p-1 border rounded text-sm"
            placeholder="0"
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
          <option value="api">API</option>
        </select>
      </div>
    </div>
  );
};

export default KpiConfig;
