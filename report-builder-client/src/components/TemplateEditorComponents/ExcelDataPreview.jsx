import React, { useState } from "react";

const ExcelDataPreview = ({ excelData, sectionIndex, handleFileUpload }) => {
  const [showPreview, setShowPreview] = useState(false);

  if (!excelData) return null;

  const { headers, rows } = excelData;

  // Limitar la visualización a 5 filas para prevenir sobrecarga
  const displayRows = rows.slice(0, 5);

  const togglePreview = (e) => {
    e.stopPropagation(); // Evitar selección de la sección
    setShowPreview(!showPreview);
  };

  return (
    <div
      className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-blue-700">
          Datos Excel cargados ({rows.length} filas)
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={togglePreview}
            className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded"
          >
            {showPreview ? "Ocultar" : "Mostrar datos"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const fileInput = document.createElement("input");
              fileInput.type = "file";
              fileInput.accept = ".xlsx, .xls";
              fileInput.onchange = (event) =>
                handleFileUpload(sectionIndex, event);
              fileInput.click();
            }}
            className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded"
          >
            Cambiar Excel
          </button>
        </div>
      </div>

      {showPreview && (
        <div className="mt-2 overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="bg-blue-100">
                {headers.map((header, index) => (
                  <th key={index} className="p-1 border border-blue-200">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={rowIndex % 2 === 0 ? "bg-white" : "bg-blue-50"}
                >
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="p-1 border border-blue-200">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > 5 && (
            <p className="mt-1 text-xs text-blue-600 italic">
              Mostrando 5 de {rows.length} filas
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ExcelDataPreview;
