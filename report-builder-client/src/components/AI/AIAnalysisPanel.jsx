import React, { useState, useEffect } from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { analyzeData } from "../../services/analysisService";
import { generateNarrativeFromAnalysis } from "../../services/narrativeService";
import { getDefaultAIConfig } from "../../utils/featureFlags";

const AIAnalysisPanel = ({ component = {}, onUpdate, sectionData = {} }) => {
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAutoAnalyzed, setHasAutoAnalyzed] = useState(false);
  const [analysisInProgress, setAnalysisInProgress] = useState(false);
  const [error, setError] = useState(null);

  // Usar la configuración de AI del componente
  const aiConfig = component.aiConfig || getDefaultAIConfig();

  console.log("🔍 AIAnalysisPanel - Debugging:", {
    component: component,
    componentAiConfig: component.aiConfig,
    defaultConfig: getDefaultAIConfig(),
    finalAiConfig: aiConfig,
  });

  // Verificar si hay datos para análisis
  const hasDataForAnalysis = () => {
    return (
      sectionData?.excelData?.data?.length > 0 &&
      sectionData.excelData.data.length > 0
    );
  };

  // Función principal de análisis AI
  const handleAIAnalysis = async () => {
    if (isAnalyzing || hasAutoAnalyzed || analysisInProgress) {
      console.log("⚠️ Análisis ya en progreso o completado, saltando...");
      return;
    }

    if (!hasDataForAnalysis()) {
      console.log("⚠️ No hay datos para analizar");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisInProgress(true);
    setError(null);

    try {
      const dataToAnalyze = sectionData?.excelData;
      if (!dataToAnalyze?.data?.length) {
        throw new Error("No hay datos disponibles para el análisis.");
      }

      console.log("🔍 Analizando datos para narrativa...");

      // Usar los servicios originales que sabemos que funcionan
      const baseAnalysis = await analyzeData(dataToAnalyze.data, aiConfig);

      const finalResults = {
        narrative: null,
        suggestions: baseAnalysis.suggestions || [],
        confidence: baseAnalysis.confidence || 0.8,
        metadata: {
          analysisType: aiConfig.analysisType,
          language: aiConfig.language,
          tone: aiConfig.tone,
          timestamp: new Date().toISOString(),
        },
      };

      // Generar narrativa si está habilitada
      console.log("🔍 AIAnalysisPanel - Verificando includeNarrative:", {
        includeNarrative: aiConfig.includeNarrative,
        aiConfig: aiConfig,
      });

      if (aiConfig.includeNarrative) {
        try {
          const narrativeResult = await generateNarrativeFromAnalysis(
            baseAnalysis,
            aiConfig,
            dataToAnalyze.data
          );
          console.log(
            "🔍 AIAnalysisPanel - Resultado de narrativa:",
            narrativeResult
          );
          if (narrativeResult?.content) {
            finalResults.narrative = narrativeResult;
          }
        } catch (narrativeError) {
          console.error("❌ Error generando narrativa:", narrativeError);
          finalResults.narrative = {
            title: "Error generando narrativa",
            content: `No se pudo generar la narrativa automáticamente. Error: ${narrativeError.message}`,
            keyPoints: [],
          };
        }
      } else {
        console.log("⚠️ AIAnalysisPanel - includeNarrative está deshabilitado");
      }

      setAnalysisResults(finalResults);

      // Guardar los resultados en el componente para persistencia
      console.log("🔍 AIAnalysisPanel - Resultados finales:", {
        hasNarrative: !!finalResults.narrative,
        narrativeContent:
          finalResults.narrative?.content?.substring(0, 100) + "...",
        narrativeTitle: finalResults.narrative?.title,
        keyPoints: finalResults.narrative?.keyPoints?.length || 0,
      });
      onUpdate("aiAnalysisResults", finalResults);

      // Aplicar narrativa automáticamente si se generó
      if (finalResults.narrative?.content) {
        console.log("🔍 AIAnalysisPanel - Aplicando narrativa automáticamente");
        console.log(
          "🔍 AIAnalysisPanel - Contenido a aplicar:",
          finalResults.narrative.content.substring(0, 100) + "..."
        );
        onUpdate("content", finalResults.narrative.content);
        console.log("✅ AIAnalysisPanel - Narrativa aplicada al componente");
      }

      setHasAutoAnalyzed(true);

      console.log("✅ Análisis AI completado exitosamente");
    } catch (error) {
      console.error("❌ Error en análisis AI:", error);
      setError(error.message);
    } finally {
      setIsAnalyzing(false);
      setAnalysisInProgress(false);
    }
  };

  // Aplicar resultados de AI al componente
  const applyAIResults = (results) => {
    if (results?.narrative?.content) {
      console.log("🔍 AIAnalysisPanel - Aplicando narrativa:", {
        contentLength: results.narrative.content.length,
        contentPreview: results.narrative.content.substring(0, 100) + "...",
      });
      onUpdate("content", results.narrative.content);
      console.log("✅ Narrativa aplicada al componente");
    } else {
      console.log("⚠️ AIAnalysisPanel - No hay narrativa para aplicar");
    }
  };

  // Aplicar resultado específico
  const applySpecificResult = (type, data) => {
    switch (type) {
      case "narrative":
        if (data?.content) {
          console.log("🔍 AIAnalysisPanel - Aplicando narrativa específica:", {
            contentLength: data.content.length,
            contentPreview: data.content.substring(0, 100) + "...",
          });
          onUpdate("content", data.content);
          console.log("✅ Narrativa específica aplicada al componente");
        } else {
          console.log(
            "⚠️ AIAnalysisPanel - No hay contenido en narrativa específica"
          );
        }
        break;
      default:
        console.log("⚠️ Tipo de resultado no reconocido:", type);
    }
  };

  // Análisis manual
  const handleManualAnalysis = () => {
    setHasAutoAnalyzed(false);
    setAnalysisResults(null);
    handleAIAnalysis();
  };

  // Auto-análisis cuando se cargan nuevos datos
  useEffect(() => {
    if (
      component.autoAnalyzeAI &&
      hasDataForAnalysis() &&
      !hasAutoAnalyzed &&
      !analysisInProgress
    ) {
      console.log("🔄 Auto-análisis iniciado por nuevos datos");
      handleAIAnalysis();
    }
  }, [sectionData?.excelData, component.autoAnalyzeAI]);

  // Aplicar resultados automáticamente si están disponibles
  useEffect(() => {
    if (analysisResults?.narrative?.content && component.autoAnalyzeAI) {
      applyAIResults(analysisResults);
    }
  }, [analysisResults, component.autoAnalyzeAI]);

  return (
    <div className="space-y-6">
      {/* Sección de AI Analysis */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <SparklesIcon className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">
            Generación Inteligente de Narrativa
          </h3>
        </div>

        {/* Checkbox para análisis automático */}
        <div className="mb-4">
          <label className="flex items-center text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={component.autoAnalyzeAI ?? false}
              onChange={(e) => {
                onUpdate("autoAnalyzeAI", e.target.checked);
                setHasAutoAnalyzed(false);
                setAnalysisResults(null);
              }}
              className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Generar narrativa automáticamente con AI al cargar nuevos datos
          </label>
        </div>

        {/* Botón de control principal */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleManualAnalysis}
            disabled={!hasDataForAnalysis() || isAnalyzing}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generando...
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4" />
                Generar Narrativa con AI
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-600">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}
      </div>

      {/* Resultados del análisis AI */}
      {analysisResults && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
            <SparklesIcon className="h-5 w-5" />
            Narrativa Generada por AI
          </h4>

          <div className="space-y-3">
            {/* Narrativa */}
            {analysisResults.narrative && analysisResults.narrative.content && (
              <div className="bg-white p-3 rounded border">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-900">
                    {analysisResults.narrative.title || "Narrativa Generada"}
                  </h5>
                  <button
                    onClick={() =>
                      applySpecificResult(
                        "narrative",
                        analysisResults.narrative
                      )
                    }
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                  >
                    Aplicar
                  </button>
                </div>
                <div className="text-sm text-gray-700 max-h-32 overflow-y-auto">
                  {analysisResults.narrative.content}
                </div>
              </div>
            )}

            {/* Puntos clave */}
            {analysisResults.narrative?.keyPoints?.length > 0 && (
              <div className="bg-white p-3 rounded border">
                <h5 className="font-medium text-gray-900 mb-2">Puntos Clave</h5>
                <ul className="text-sm text-gray-700 space-y-1">
                  {analysisResults.narrative.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysisPanel;
