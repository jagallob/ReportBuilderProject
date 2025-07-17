export const generateNarrativeFromAnalysis = async (analysisResult, config) => {
  try {
    const response = await fetch("/api/narrative/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        analysis: analysisResult,
        config: config,
        templateId: config.analysisType || "default",
      }),
    });

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const result = await response.json();

    // CORRECCIÓN: Mapear las propiedades del backend (PascalCase) a frontend (camelCase)
    const mappedResult = {
      title: result.Title || result.title || "Análisis de Datos",
      content: result.Content || result.content || "",
      keyPoints: result.KeyPoints || result.keyPoints || [],
      sections: result.Sections || result.sections || {},
      generatedAt:
        result.GeneratedAt || result.generatedAt || new Date().toISOString(),
    };

    // Validar que la respuesta tenga la estructura esperada
    if (!mappedResult.title || !mappedResult.content) {
      console.warn("Respuesta incompleta del servidor:", result);
      // Proporcionar valores por defecto si faltan
      if (!mappedResult.title) mappedResult.title = "Análisis de Datos";
      if (!mappedResult.content)
        mappedResult.content = "No se pudo generar contenido";
    }

    console.log("Narrativa procesada correctamente:", mappedResult);
    return mappedResult;
  } catch (error) {
    console.error("Error generando narrativa:", error);
    throw error;
  }
};
