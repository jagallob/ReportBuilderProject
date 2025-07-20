export const generateNarrativeFromAnalysis = async (
  analysisResult,
  config,
  excelData = null
) => {
  try {
    const response = await fetch("/api/narrative/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        analysis: analysisResult,
        config: config,
        templateId: config.analysisType || "default",
        excelData: excelData,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const result = await response.json();

    // Mapear las propiedades del backend (PascalCase) a frontend (camelCase)
    const mappedResult = {
      title: result.Title || result.title || "Análisis de Datos",
      content: result.Content || result.content || "",
      keyPoints: result.KeyPoints || result.keyPoints || [],
      sections: result.Sections || result.sections || {},
      generatedAt:
        result.GeneratedAt || result.generatedAt || new Date().toISOString(),
    };

    // Limpiar contenido JSON si es necesario
    if (mappedResult.content) {
      console.log(
        "🔍 Contenido original:",
        mappedResult.content.substring(0, 200) + "..."
      );

      try {
        // Caso 1: Array con objeto que contiene JSON como string
        if (
          mappedResult.content.startsWith("[{") &&
          mappedResult.content.includes('"text"')
        ) {
          const jsonArray = JSON.parse(mappedResult.content);
          if (jsonArray.length > 0 && jsonArray[0].text) {
            let textContent = jsonArray[0].text;

            // Si el text contiene JSON dentro de markdown
            if (textContent.includes("```json")) {
              const jsonMatch = textContent.match(
                /```json\s*(\{[\s\S]*?\})\s*```/
              );
              if (jsonMatch) {
                const jsonContent = JSON.parse(jsonMatch[1]);
                mappedResult.content =
                  jsonContent.content || jsonContent.text || textContent;
                console.log("✅ Caso 1 - Array con JSON en markdown procesado");
              }
            } else if (
              textContent.startsWith("{") &&
              textContent.endsWith("}")
            ) {
              // Si el text es JSON directo
              const jsonContent = JSON.parse(textContent);
              mappedResult.content =
                jsonContent.content || jsonContent.text || textContent;
              console.log("✅ Caso 1.2 - Array con JSON directo procesado");
            } else {
              // Si el text es texto plano
              mappedResult.content = textContent;
              console.log("✅ Caso 1.3 - Array con texto plano procesado");
            }
          }
        }
        // Caso 2: JSON dentro de markdown
        else if (mappedResult.content.includes("```json")) {
          const jsonMatch = mappedResult.content.match(
            /```json\s*(\{[\s\S]*?\})\s*```/
          );
          if (jsonMatch) {
            const jsonContent = JSON.parse(jsonMatch[1]);
            mappedResult.content =
              jsonContent.content || jsonContent.text || mappedResult.content;
            console.log("✅ Caso 2 - JSON en markdown procesado");
          }
        }
        // Caso 3: JSON directo
        else if (
          mappedResult.content.startsWith("{") &&
          mappedResult.content.endsWith("}")
        ) {
          const jsonContent = JSON.parse(mappedResult.content);
          mappedResult.content =
            jsonContent.content || jsonContent.text || mappedResult.content;
          console.log("✅ Caso 3 - JSON directo procesado");
        }
        // Caso 4: Array de objetos JSON (formato antiguo)
        else if (
          mappedResult.content.startsWith("[{") &&
          mappedResult.content.endsWith("}]")
        ) {
          const jsonArray = JSON.parse(mappedResult.content);
          if (jsonArray.length > 0 && jsonArray[0].text) {
            mappedResult.content = jsonArray[0].text;
            console.log("✅ Caso 4 - Array JSON procesado");
          }
        }
      } catch (error) {
        console.warn("⚠️ Error parseando contenido JSON:", error);
        console.log(
          "🔍 Contenido que causó error:",
          mappedResult.content.substring(0, 200) + "..."
        );
      }
    }

    // Validar que la respuesta tenga la estructura esperada
    if (!mappedResult.title || !mappedResult.content) {
      console.warn("Respuesta incompleta del servidor:", result);
      // Proporcionar valores por defecto si faltan
      if (!mappedResult.title) mappedResult.title = "Análisis de Datos";
      if (!mappedResult.content)
        mappedResult.content = "No se pudo generar contenido";
    }

    console.log("📝 Narrativa procesada correctamente");
    return mappedResult;
  } catch (error) {
    console.error("Error generando narrativa:", error);
    throw error;
  }
};
