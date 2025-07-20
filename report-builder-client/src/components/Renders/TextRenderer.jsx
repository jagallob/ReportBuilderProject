import { useEffect, useState } from "react";
import {
  analyzeData,
  processTemplateVariables,
} from "../../utils/textAnalysisUtils";

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
        type: component.type,
      });
    }

    // Generar narrativa automática si está configurado y hay datos Excel
    const shouldGenerate =
      component.autoGenerate &&
      excelData &&
      excelData.data &&
      excelData.data.length > 0 &&
      component.analysisConfig;

    let generatedContent = "";

    if (shouldGenerate) {
      generatedContent = generateNarrative(excelData, component.analysisConfig);
    }

    // También procesar variables en contenido manual si contiene referencias a columnas de Excel
    if (excelData && excelData.headers && baseContent.includes("{")) {
      const analysis = analyzeData(excelData, component.analysisConfig);
      baseContent = processTemplateVariables(baseContent, analysis, excelData);
    }

    // Combinar contenido manual y generado
    const finalContent = shouldGenerate
      ? `${baseContent}\n\n${generatedContent}`
      : baseContent;

    setContent(finalContent);
  }, [component, excelData]);

  // Función para generar narrativa basada en datos
  const generateNarrative = (excelData, config = {}) => {
    // Analizar los datos
    const analysis = analyzeData(excelData, config);

    // Plantillas de narrativa basadas en el análisis
    const templates = {
      default: `Los datos muestran que el valor promedio es ${analysis.avg.toFixed(
        2
      )}, 
                con un máximo de ${analysis.max} y un mínimo de ${analysis.min}.
                La tendencia general es ${analysis.trend}.`,

      sales: `En el período analizado, las ventas totales fueron ${analysis.total.toFixed(
        2
      )}
              con un promedio mensual de ${analysis.avg.toFixed(2)}.
              ${
                analysis.maxMonth !== "N/A"
                  ? `El período con mayor ventas fue ${analysis.maxMonth} (${analysis.max})`
                  : `El valor máximo fue ${analysis.max}`
              }
              ${
                analysis.minMonth !== "N/A"
                  ? `y el menor ${analysis.minMonth} (${analysis.min}).`
                  : `y el valor mínimo fue ${analysis.min}.`
              }`,

      financial: `El análisis financiero revela un ${
        analysis.trend === "ascendente" ? "crecimiento" : "descenso"
      }
                  del ${
                    analysis.percentageChange
                  }% respecto al período anterior.
                  Los valores oscilaron entre ${analysis.min} y ${
        analysis.max
      }.`,
    };

    // Seleccionar plantilla o usar la personalizada si existe
    let template = templates.default;

    if (config?.templateType && templates[config.templateType]) {
      template = templates[config.templateType];
    } else if (config?.customTemplate) {
      template = config.customTemplate;
      // Procesar la plantilla personalizada con los datos de análisis
      return processTemplateVariables(template, analysis, excelData);
    }

    return template;
  };

  return (
    <div className="prose max-w-none">
      {content ? (
        <div>
          <div className="whitespace-pre-line">{content}</div>

          {/* Mostrar puntos clave si están disponibles */}
          {component.analysisResult?.narrative?.keyPoints &&
            component.analysisResult.narrative.keyPoints.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Puntos Clave
                </h4>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {component.analysisResult.narrative.keyPoints.map(
                    (point, index) => (
                      <li key={index}>{point}</li>
                    )
                  )}
                </ul>
              </div>
            )}

          {/* Mostrar secciones si están disponibles */}
          {component.analysisResult?.narrative?.sections &&
            Object.keys(component.analysisResult.narrative.sections).length >
              0 && (
              <div className="mt-4 space-y-3">
                {Object.entries(
                  component.analysisResult.narrative.sections
                ).map(([sectionName, sectionContent], index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 border border-gray-200 rounded"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2 capitalize">
                      {sectionName}
                    </h4>
                    <div className="text-sm text-gray-700">
                      {sectionContent}
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      ) : (
        <div className="text-gray-500 italic">Sin contenido de texto</div>
      )}
    </div>
  );
};

export default TextRenderer;
