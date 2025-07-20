/**
 * Envía un objeto de solicitud de análisis al backend.
 * @param {Object} requestPayload - El objeto que contiene los datos y la configuración. Debe coincidir con el DTO `AnalysisRequest` del backend.
 * @returns {Promise<object>} - Una promesa que resuelve con el resultado del análisis estructurado.
 */
export const analyzeData = async (data, config) => {
  try {
    const response = await fetch("/api/analytics/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: data,
        config: {
          analysisType: config?.analysisType || "comprehensive",
          language: config?.language || "es",
          tone: config?.tone || "professional",
          includeNarrative: config?.includeNarrative !== false,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error analizando datos:", error);
    throw error;
  }
};

export const getInsights = async (reportId) => {
  try {
    const response = await fetch(`/api/analytics/insights/${reportId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error obteniendo insights:", error);
    throw error;
  }
};

export const getTrends = async (areaId, startDate, endDate) => {
  try {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    const response = await fetch(`/api/analytics/trends/${areaId}?${params}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error obteniendo tendencias:", error);
    throw error;
  }
};

export const comparePeriods = async (
  areaId,
  period1Start,
  period1End,
  period2Start,
  period2End
) => {
  try {
    const params = new URLSearchParams({
      period1Start: period1Start.toISOString(),
      period1End: period1End.toISOString(),
      period2Start: period2Start.toISOString(),
      period2End: period2End.toISOString(),
    });

    const response = await fetch(`/api/analytics/compare/${areaId}?${params}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error comparando períodos:", error);
    throw error;
  }
};
