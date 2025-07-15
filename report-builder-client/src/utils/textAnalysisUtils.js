// textAnalysisUtils.js

/**
 * Default result object for the analysis function.
 * Used to ensure a consistent return shape when data is invalid.
 */
const defaultAnalysisResult = {
  avg: 0,
  max: 0,
  min: 0,
  total: 0,
  count: 0,
  trend: "neutral",
  percentageChange: 0,
  maxCategory: "N/A",
  minCategory: "N/A",
};

/**
 * Analyzes a set of Excel data based on a given configuration.
 * @param {object} excelData - The data object, expected to have `headers` and `data` properties.
 * @param {object} config - Configuration for the analysis, including `dataColumn` and `categoryColumn`.
 * @returns {object} An object containing the analysis results.
 */
export const analyzeData = (excelData, config = {}) => {
  // CORRECCIÓN: Usar 'data' en lugar de 'rows' para consistencia con la app.
  const rows = excelData?.data || [];
  const headers = excelData?.headers || [];

  const dataColumnName = config?.dataColumn || "";
  const categoryColumnName = config?.categoryColumn || "";

  const dataColumnIndex = headers.indexOf(dataColumnName);
  const categoryColumnIndex = headers.indexOf(categoryColumnName);

  // MEJORA: Si la columna de datos no se encuentra, devolver valores por defecto.
  if (dataColumnIndex === -1) {
    return defaultAnalysisResult;
  }

  // Extraer valores numéricos, filtrando entradas no válidas.
  const values = rows
    .map((row) => {
      const rawValue = row[dataColumnIndex];

      // Si el valor es nulo o una cadena vacía, se ignora.
      if (rawValue == null || rawValue === "") {
        return NaN;
      }

      // MEJORA: Hacer el parseo de números más robusto.
      // Convierte a string y elimina caracteres no numéricos como '$', ',', '€', etc.
      // Se conserva el punto decimal y el signo negativo.
      const cleanedValue = String(rawValue).replace(/[^0-9.-]+/g, "");
      return parseFloat(cleanedValue);
    })
    .filter((val) => !isNaN(val));

  // Si no hay valores numéricos válidos, devolver valores por defecto.
  if (values.length === 0) {
    return defaultAnalysisResult;
  }

  // --- Cálculos ---
  const total = values.reduce((sum, val) => sum + val, 0);
  const avg = total / values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);

  // --- Búsqueda de Categoría (Más Robusta) ---
  let maxCategory = "N/A";
  let minCategory = "N/A";

  if (categoryColumnIndex !== -1) {
    // CORRECCIÓN: Usar findIndex en el array original para evitar errores con valores duplicados.
    const maxRowIndex = rows.findIndex(
      (row) => parseFloat(row[dataColumnIndex]) === max
    );
    if (maxRowIndex !== -1) {
      maxCategory = rows[maxRowIndex][categoryColumnIndex];
    }

    const minRowIndex = rows.findIndex(
      (row) => parseFloat(row[dataColumnIndex]) === min
    );
    if (minRowIndex !== -1) {
      minCategory = rows[minRowIndex][categoryColumnIndex];
    }
  }

  // --- Cálculo de Tendencia (Simple: primer vs. último valor) ---
  let trend = "neutral";
  if (values.length > 1) {
    const first = values[0];
    const last = values[values.length - 1];
    if (last > first) trend = "ascendente";
    if (last < first) trend = "descendente";
  }

  // --- Cambio Porcentual (con protección de división por cero) ---
  let percentageChange = 0;
  if (values.length > 1 && values[0] !== 0) {
    percentageChange =
      ((values[values.length - 1] - values[0]) / values[0]) * 100;
  }

  return {
    avg,
    max,
    min,
    total,
    count: values.length,
    trend,
    percentageChange,
    maxCategory,
    minCategory,
  };
};

/**
 * Convierte un número de serie de fecha de Excel a una fecha local.
 * @param {number} serial - El número de serie de la fecha.
 * @returns {Date} Un objeto de fecha de JavaScript.
 */
function excelSerialToDate(serial) {
  const utc_days = Math.floor(serial - 25569);
  const date = new Date(utc_days * 86400 * 1000);
  return date;
}

/**
 * Formatea un valor, convirtiéndolo a fecha si parece ser un número de serie de Excel.
 * @param {*} value - El valor a formatear.
 * @returns {string|number|*} El valor formateado o el original.
 */
export function formatExcelValue(value) {
  if (typeof value === "number" && value >= 25569 && value < 60000) {
    return excelSerialToDate(value).toLocaleDateString();
  }
  return value;
}

/**
 * Replaces placeholders in a template string with values from analysis or Excel data.
 * Placeholders are in the format {key}, e.g., {avg} or {Nombre de Cliente}.
 * @param {string} template - The template string.
 * @param {object} analysis - The result object from `analyzeData`.
 * @param {object} excelData - The Excel data object.
 * @returns {string} The processed string with placeholders replaced.
 */
export const processTemplateVariables = (template, analysis, excelData) => {
  if (!template) return "";

  // MEJORA: Regex para admitir espacios en los nombres de columna, ej: {Total Ventas}.
  return template.replace(/\{([\w\s]+)\}/g, (_, key) => {
    const trimmedKey = key.trim();

    // Compatibilidad con nombres antiguos como {maxMonth}.
    const analysisKey =
      trimmedKey === "maxMonth"
        ? "maxCategory"
        : trimmedKey === "minMonth"
        ? "minCategory"
        : trimmedKey;

    // 1. Buscar la clave en el objeto de análisis.
    if (analysis[analysisKey] !== undefined) {
      const value = analysis[analysisKey];
      // Formatear números a 2 decimales, excepto el contador.
      if (typeof value === "number" && analysisKey !== "count") {
        return value.toFixed(2);
      }
      return formatExcelValue(value);
    }

    // 2. Si no, buscar la clave como un encabezado de Excel.
    if (excelData?.headers && excelData?.data?.length > 0) {
      const colIndex = excelData.headers.indexOf(trimmedKey);
      if (colIndex !== -1) {
        // MEJORA: Devolver el valor de la primera fila, que es más útil que toda la columna.
        return formatExcelValue(excelData.data[0][colIndex]);
      }
    }

    // 3. Si no se encuentra la clave, devolver el placeholder original.
    return `{${key}}`;
  });
};
