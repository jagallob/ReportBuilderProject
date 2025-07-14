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
    <div className="prose max-w-none whitespace-pre-line">
      {content || "Sin contenido de texto"}
    </div>
  );
};

export default TextRenderer;
