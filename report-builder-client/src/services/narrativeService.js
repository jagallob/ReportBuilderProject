/**
 * Envía el resultado de un análisis y la configuración de AI al backend para generar una narrativa.
 * @param {Object} analysisResult - El objeto JSON devuelto por analysisService.
 * @param {Object} config - El objeto de configuración de AI desde TextConfig.
 * @returns {Promise<object>} - Una promesa que resuelve con la narrativa generada.
 */
export const generateNarrativeFromAnalysis = async (analysisResult, config) => {
  // El cuerpo de la solicitud debe coincidir con `NarrativeRequest` en C#
  const requestBody = {
    analysis: analysisResult,
    config: config,
    templateId: config.analysisType || "default", // Usamos el tipo de análisis como ID de plantilla
  };

  try {
    const response = await fetch("/api/narrative/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(
        `Error del servidor al generar la narrativa: ${
          errorData.message || response.status
        }`
      );
    }

    return response.json();
  } catch (error) {
    console.error("Error de red en narrativeService:", error);
    throw error;
  }
};
