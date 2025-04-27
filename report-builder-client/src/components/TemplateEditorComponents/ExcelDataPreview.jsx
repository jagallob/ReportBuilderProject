import React from "react";

const ExcelDataPreview = ({ excelData }) => {
  if (!excelData || excelData.length === 0) return null;

  return (
    <div className="mb-3 p-2 bg-blue-50 rounded">
      <div className="text-sm font-medium text-blue-700 mb-1">
        Datos de Excel cargados ({excelData.length} filas)
      </div>
      <div className="overflow-x-auto max-h-32">
        <table className="text-xs border-collapse w-full">
          <thead>
            <tr className="bg-blue-100">
              {excelData[0].map((cell, i) => (
                <th key={i} className="border border-blue-200 p-1">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {excelData.slice(1, 4).map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} className="border border-blue-200 p-1">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {excelData.length > 4 && (
          <div className="text-xs text-gray-500 text-center mt-1">
            {excelData.length - 4} filas más...
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelDataPreview;
