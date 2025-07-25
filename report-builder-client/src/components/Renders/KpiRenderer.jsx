import { formatExcelValue } from "../../utils/textAnalysisUtils";

export const KpiRenderer = ({ component, excelData }) => {
  let value = component.value || 0;
  let unit = component.unit || "";
  let displayValue = value;

  // Si la fuente es Excel, buscar valor según configuración
  if (component.dataSource?.sourceType === "excel" && excelData) {
    const { dataField, rowIndex = 0 } = component.dataSource.mappings || {};

    if (dataField) {
      const colIndex = excelData.headers.indexOf(dataField);
      if (colIndex >= 0 && excelData.data[rowIndex]) {
        const excelValue = excelData.data[rowIndex][colIndex];
        // No intentar parsear a float aquí, dejar que el formateador decida.
        if (excelValue !== undefined && excelValue !== null) {
          displayValue = formatExcelValue(excelValue);
        }
      }
    }
  }

  // Formatear el valor según el tipo
  if (component.format === "currency" && typeof displayValue === "number") {
    displayValue = new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(displayValue);
  } else if (
    component.format === "percent" &&
    typeof displayValue === "number"
  ) {
    displayValue = `${displayValue}%`;
  }

  return (
    <div className="p-4 text-center">
      <div className="text-4xl font-bold text-blue-600">{displayValue}</div>
      <div className="text-sm text-gray-500">
        {component.title || ""} {unit}
      </div>
      {component.dataSource?.sourceType === "excel" && (
        <div className="text-xs text-gray-400 mt-1">
          Fuente: {component.dataSource.mappings?.dataField || "Datos Excel"}
        </div>
      )}
    </div>
  );
};
