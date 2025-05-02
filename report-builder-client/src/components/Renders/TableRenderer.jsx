export const TableRenderer = ({ component, excelData }) => {
  // Usar datos de Excel si están disponibles y la fuente es excel
  const useExcelData =
    component.dataSource?.sourceType === "excel" &&
    excelData &&
    excelData.length > 0;

  // Determinar filas y columnas
  const rows = useExcelData ? excelData.length - 1 : component.rows || 3;
  const columns = useExcelData ? excelData[0].length : component.columns || 2;

  return (
    <div className="overflow-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th
                key={i}
                className="border border-gray-300 px-4 py-2 text-left"
              >
                {useExcelData && excelData[0][i]
                  ? excelData[0][i]
                  : `Columna ${i + 1}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr
              key={rowIndex}
              className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="border border-gray-300 px-4 py-2">
                  {useExcelData &&
                  excelData[rowIndex + 1] &&
                  excelData[rowIndex + 1][colIndex]
                    ? excelData[rowIndex + 1][colIndex]
                    : `Celda ${rowIndex + 1},${colIndex + 1}`}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
