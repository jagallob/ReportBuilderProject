export const TableRenderer = ({ component, excelData }) => {
  // Buscar datos en múltiples ubicaciones posibles
  const data =
    component.dataSource?.excelData ||
    excelData ||
    (component.dataSource?.sourceType === "excel" && component.excelData);

  if (!data?.headers || !data.data) {
    return <div className="p-4 text-gray-500">No hay datos disponibles</div>;
  }

  // Filtrar columnas según selección
  const visibleColumns = component.dataSource?.selectedColumns || data.headers;
  const columnIndexes = visibleColumns.map((col) => data.headers.indexOf(col));

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border">
        <thead>
          <tr>
            {visibleColumns.map((header, index) => (
              <th key={index} className="px-4 py-2 border bg-gray-100">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              {columnIndexes.map((colIndex, i) => (
                <td key={i} className="px-4 py-2 border">
                  {colIndex >= 0 ? row[colIndex] : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
