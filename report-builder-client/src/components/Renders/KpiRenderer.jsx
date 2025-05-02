export const KpiRenderer = ({ component, excelData }) => {
  let value = component.value || 0;
  let unit = component.unit || "";

  // Si la fuente es Excel, buscar valor
  if (component.dataSource?.sourceType === "excel" && excelData?.[1]?.[1]) {
    const excelValue = parseFloat(excelData[1][1]);
    if (!isNaN(excelValue)) value = excelValue;
  }

  return (
    <div className="p-4 text-center">
      <div className="text-4xl font-bold text-blue-600">{value}</div>
      <div className="text-sm text-gray-500">{unit}</div>
    </div>
  );
};
