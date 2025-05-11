// textAnalysisUtils.js
export const analyzeData = (excelData, config = {}) => {
  // Default to empty arrays if data is missing
  const rows = excelData?.rows || [];
  const headers = excelData?.headers || [];

  // Get column indexes for analysis
  const dataColumnName = config?.dataColumn || "";
  const categoryColumnName = config?.categoryColumn || "";

  const dataColumnIndex = headers.indexOf(dataColumnName);
  const categoryColumnIndex = headers.indexOf(categoryColumnName);

  // If we don't have valid column selections, return empty analysis
  if (dataColumnIndex === -1) {
    return {
      avg: 0,
      max: 0,
      min: 0,
      total: 0,
      count: 0,
      trend: "neutral",
      percentageChange: 0,
      maxMonth: "N/A",
      minMonth: "N/A",
    };
  }

  // Extract numeric values for analysis
  const values = rows
    .map((row) => parseFloat(row[dataColumnIndex]))
    .filter((val) => !isNaN(val));

  // If we have no valid numeric values, return empty analysis
  if (values.length === 0) {
    return {
      avg: 0,
      max: 0,
      min: 0,
      total: 0,
      count: 0,
      trend: "neutral",
      percentageChange: 0,
      maxMonth: "N/A",
      minMonth: "N/A",
    };
  }

  // Basic calculations
  const total = values.reduce((sum, val) => sum + val, 0);
  const avg = total / values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);

  // Find categories (months, products, etc. if applicable)
  let maxMonth = "N/A";
  let minMonth = "N/A";

  if (categoryColumnIndex !== -1) {
    // Find index of max and min values
    const maxIndex = values.indexOf(max);
    const minIndex = values.indexOf(min);

    // Get corresponding categories
    if (maxIndex !== -1 && rows[maxIndex]) {
      maxMonth = rows[maxIndex][categoryColumnIndex];
    }

    if (minIndex !== -1 && rows[minIndex]) {
      minMonth = rows[minIndex][categoryColumnIndex];
    }
  }

  // Calculate trend (simple method)
  let trend = "neutral";
  if (values.length > 1) {
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstHalfAvg =
      firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondHalfAvg =
      secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    if (secondHalfAvg > firstHalfAvg) {
      trend = "ascendente";
    } else if (secondHalfAvg < firstHalfAvg) {
      trend = "descendente";
    }
  }

  // Calculate percentage change
  const percentageChange =
    values.length > 1
      ? (((values[values.length - 1] - values[0]) / values[0]) * 100).toFixed(2)
      : 0;

  return {
    avg,
    max,
    min,
    total,
    count: values.length,
    trend,
    percentageChange,
    maxMonth,
    minMonth,
  };
};

// Procesar variables como {columna} en el texto
export const processTemplateVariables = (template, analysis, excelData) => {
  if (!template) return "";

  // Reemplazar variables de análisis
  let processed = template.replace(/\{(\w+)\}/g, (_, key) => {
    // Buscar en el objeto analysis primero
    if (analysis[key] !== undefined) {
      return typeof analysis[key] === "number"
        ? analysis[key].toFixed(2)
        : analysis[key];
    }

    // Buscar en las columnas de Excel
    if (excelData?.headers) {
      const colIndex = excelData.headers.indexOf(key);
      if (colIndex !== -1) {
        const values = excelData.rows.map((row) => row[colIndex]);
        return values.join(", ");
      }
    }

    return `{${key}}`;
  });

  return processed;
};
