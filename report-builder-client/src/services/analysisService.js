/**
 * Envía los datos del Excel y la configuración de AI al backend para su análisis.
 * @param {Array<Object>} data - Los datos extraídos del archivo Excel en formato JSON.
 * @param {Object} config - El objeto de configuración de AI desde TextConfig.
 * @returns {Promise<object>} - Una promesa que resuelve con el resultado del análisis estructurado.
 */
export const analyzeExcelData = async (data, config) => {
  // El cuerpo de la solicitud debe coincidir con lo que espera tu `AnalysisRequest` en C#
  const requestBody = {
    data: data,
    config: config,
  };

  try {
    const response = await fetch("/api/analytics/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      // Si la respuesta no es exitosa (ej. 400, 404, 500), lanzamos un error.
      // Esto será capturado por el bloque .catch() en el componente que llame a esta función.
      const errorData = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(
        `Error del servidor al analizar datos: ${
          errorData.message || response.status
        }`
      );
    }

    // Si todo va bien, devolvemos los datos del análisis en formato JSON.
    return response.json();
  } catch (error) {
    console.error("Error de red en analysisService:", error);
    // Re-lanzamos el error para que el componente que lo llama pueda manejarlo.
    throw error;
  }
};
