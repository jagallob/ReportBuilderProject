/**
 * Envía un objeto de solicitud de análisis al backend.
 * @param {Object} requestPayload - El objeto que contiene los datos y la configuración. Debe coincidir con el DTO `AnalysisRequest` del backend.
 * @returns {Promise<object>} - Una promesa que resuelve con el resultado del análisis estructurado.
 */
export const analyzeExcelData = async (requestPayload) => {
  try {
    const response = await fetch("/api/analytics/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Si tu API requiere autenticación, aquí es donde añadirías el token:
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(requestPayload),
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
