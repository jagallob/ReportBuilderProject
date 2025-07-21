import { useEffect, useState } from "react";

export const TextRenderer = ({ component, excelData }) => {
  const [content, setContent] = useState("");

  useEffect(() => {
    // Contenido manual si está definido
    let baseContent = component.content || "";

    // Debug: Log del contenido del componente
    if (import.meta.env.DEV) {
      console.log("🔍 TextRenderer - Componente:", {
        content: baseContent ? `${baseContent.length} chars` : "vacío",
        hasAnalysisResult: !!component.analysisResult,
        hasAiMetadata: !!component.aiMetadata,
        hasAiAnalysisResults: !!component.aiAnalysisResults,
        aiAnalysisResults: component.aiAnalysisResults,
        type: component.type,
      });
    }

    // Verificar si hay resultados de AI generados
    const hasAIResults = component.aiAnalysisResults?.narrative?.content;

    if (hasAIResults) {
      // Usar la narrativa generada por AI
      console.log(
        "✅ TextRenderer - Usando narrativa AI:",
        hasAIResults.substring(0, 100) + "..."
      );
      setContent(component.aiAnalysisResults.narrative.content);
      return;
    }

    // Si no hay narrativa AI, usar el contenido del componente
    console.log("🔍 TextRenderer - Usando contenido del componente:", {
      contentLength: baseContent.length,
      contentPreview: baseContent.substring(0, 100) + "...",
    });
    setContent(baseContent);
  }, [component, excelData]);

  // Renderizar el contenido
  return (
    <div className="text-renderer">
      {content ? (
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <div className="text-gray-500 italic text-center py-8">
          No hay contenido para mostrar
        </div>
      )}
    </div>
  );
};

export default TextRenderer;
