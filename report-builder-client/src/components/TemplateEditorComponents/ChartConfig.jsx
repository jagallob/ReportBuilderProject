import React from "react";
import ExcelUploadButton from "./ExcelUploadButton";

const ChartConfig = ({ component, onUpdate }) => {
  return (
    <div className="space-y-2 mt-2">
      <select
        value={component.chartType || "bar"}
        onChange={(e) => onUpdate("chartType", e.target.value)}
        className="w-full p-1 border rounded"
      >
        <option value="bar">Barras</option>
        <option value="line">Líneas</option>
        <option value="pie">Circular</option>
      </select>
      <div className="grid grid-cols-2 gap-2">
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

        {/* Si es Excel, mostrar botón para subir archivo */}
        {component.dataSource?.sourceType === "excel" && (
          <div className="col-span-2">
            <label className="block text-xs text-gray-500 mb-1">
              Subir Excel
            </label>
            <ExcelUploadButton
              onUpload={(data) => onUpdate("dataSource.excelData", data)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartConfig;
