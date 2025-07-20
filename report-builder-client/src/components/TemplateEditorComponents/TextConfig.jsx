import { useEffect, useState } from "react";
import {
  SparklesIcon,
  DocumentTextIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import { analyzeData } from "../../services/analysisService";
import { generateNarrativeFromAnalysis } from "../../services/narrativeService";
import { getDefaultAIConfig, isFeatureEnabled } from "../../utils/featureFlags";
import AIConfigPanel from "../AI/AIConfigPanel";

const TextConfig = ({ component = {}, onUpdate, sectionData = {} }) => {
  const [excelColumns, setExcelColumns] = useState([]);
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
  const [error, setError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [hasAutoAnalyzed, setHasAutoAnalyzed] = useState(false);
  const [analysisInProgress, setAnalysisInProgress] = useState(false);
  const [aiConfig, setAiConfig] = useState(getDefaultAIConfig());

  // Efecto para manejar columnas de Excel
  useEffect(() => {
    if (!sectionData || !sectionData.excelData) {
      setExcelColumns([]);
      return;
    }

    if (
      sectionData?.excelData?.headers &&
      Array.isArray(sectionData.excelData.headers)
    ) {
      setExcelColumns(sectionData.excelData.headers);
    }
  }, [sectionData]);

  // Efecto para análisis automático - Versión corregida
  useEffect(() => {
    // Si ya hay un análisis automático ejecutado, no ejecutar otro
    if (component?.hasAutoAnalyzed === true || component?.analysisResult) {
      setHasAutoAnalyzed(true);
      if (component?.analysisResult && !analysisResults) {
        setAnalysisResults(component.analysisResult);
      }
      return;
    }

    // Solo proceder si el componente está inicializado y tiene datos
    if (
      component &&
      component.autoAnalyzeAI === true &&
      hasDataForAnalysis() &&
      !isAnalyzing &&
      !hasAutoAnalyzed &&
      !analysisResults
    ) {
      console.log("🤖 Iniciando análisis automático...");
      handleAIAnalysis();
    }
  }, [component?.autoAnalyzeAI, sectionData?.excelData?.data]);

  // Resetear el flag cuando cambian los datos
  useEffect(() => {
    if (sectionData?.excelData?.data) {
      setHasAutoAnalyzed(false);
      setAnalysisResults(null);
    }
  }, [sectionData?.excelData?.data]);

  const hasDataForAnalysis = () => {
    const hasExcelData = sectionData?.excelData?.data?.length > 0;
    const hasPowerBIData = sectionData?.powerBIData?.length > 0;
    const hasApiData = sectionData?.apiData?.length > 0;

    return hasExcelData || hasPowerBIData || hasApiData;
  };

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
      if (aiConfig.includeNarrative) {
        try {
          const narrativeResult = await generateNarrativeFromAnalysis(
            baseAnalysis,
            aiConfig,
            dataToAnalyze.data
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
      }

      setAnalysisResults(finalResults);

      // Guardar los resultados en el componente para persistencia
      onUpdate("analysisResult", finalResults);
      onUpdate("hasAutoAnalyzed", true);

      // Aplicar automáticamente los resultados
      if (
        component &&
        (component.autoAnalyzeAI === true ||
          component.autoAnalyzeAI === undefined)
      ) {
        applyAIResults(finalResults);
      }
    } catch (error) {
      console.error("❌ Error en análisis AI:", error);
      setError(error.message);
      setHasAutoAnalyzed(false);
    } finally {
      setIsAnalyzing(false);
      setAnalysisInProgress(false);
    }
  };

  // Aplicar resultados de AI - SIMPLIFICADO
  const applyAIResults = (results) => {
    if (!results) {
      console.warn("❌ No hay resultados para aplicar");
      return;
    }

    const updates = {};

    // Aplicar narrativa
    if (results.narrative && results.narrative.content) {
      let cleanContent = results.narrative.content;

      console.log(
        "🔍 Contenido original:",
        cleanContent.substring(0, 200) + "..."
      );

      // Limpiar contenido JSON si es necesario
      if (cleanContent) {
        try {
          // Caso 1: Array con objeto que contiene JSON como string
          if (
            cleanContent.startsWith("[{") &&
            cleanContent.includes('"text"')
          ) {
            const jsonArray = JSON.parse(cleanContent);
            if (jsonArray.length > 0 && jsonArray[0].text) {
              let textContent = jsonArray[0].text;

              // Si el text contiene JSON dentro de markdown
              if (textContent.includes("```json")) {
                const jsonMatch = textContent.match(
                  /```json\s*(\{[\s\S]*?\})\s*```/
                );
                if (jsonMatch) {
                  const jsonContent = JSON.parse(jsonMatch[1]);
                  cleanContent =
                    jsonContent.content || jsonContent.text || textContent;
                  console.log(
                    "✅ Caso 1 - Array con JSON en markdown procesado"
                  );
                }
              } else if (
                textContent.startsWith("{") &&
                textContent.endsWith("}")
              ) {
                // Si el text es JSON directo
                const jsonContent = JSON.parse(textContent);
                cleanContent =
                  jsonContent.content || jsonContent.text || textContent;
                console.log("✅ Caso 1.2 - Array con JSON directo procesado");
              } else {
                // Si el text es texto plano
                cleanContent = textContent;
                console.log("✅ Caso 1.3 - Array con texto plano procesado");
              }
            }
          }
          // Caso 2: JSON dentro de markdown
          else if (cleanContent.includes("```json")) {
            const jsonMatch = cleanContent.match(
              /```json\s*(\{[\s\S]*?\})\s*```/
            );
            if (jsonMatch) {
              const jsonContent = JSON.parse(jsonMatch[1]);
              cleanContent =
                jsonContent.content || jsonContent.text || cleanContent;
              console.log("✅ Caso 2 - JSON en markdown procesado");
            }
          }
          // Caso 3: JSON directo
          else if (cleanContent.startsWith("{") && cleanContent.endsWith("}")) {
            const jsonContent = JSON.parse(cleanContent);
            cleanContent =
              jsonContent.content || jsonContent.text || cleanContent;
            console.log("✅ Caso 3 - JSON directo procesado");
          }
          // Caso 4: Array de objetos JSON (formato antiguo)
          else if (
            cleanContent.startsWith("[{") &&
            cleanContent.endsWith("}]")
          ) {
            const jsonArray = JSON.parse(cleanContent);
            if (jsonArray.length > 0 && jsonArray[0].text) {
              cleanContent = jsonArray[0].text;
              console.log("✅ Caso 4 - Array JSON procesado");
            }
          }
        } catch (error) {
          console.warn("⚠️ Error parseando contenido JSON:", error);
          console.log(
            "🔍 Contenido que causó error:",
            cleanContent.substring(0, 200) + "..."
          );
        }
      }

      console.log(
        "🔍 Contenido limpio:",
        cleanContent.substring(0, 200) + "..."
      );
      updates.content = cleanContent;
      console.log(
        "📝 Narrativa aplicada:",
        cleanContent.substring(0, 100) + "..."
      );
    }

    // Metadatos
    updates.aiMetadata = {
      lastAnalysis: new Date().toISOString(),
      analysisConfig: aiConfig,
      confidence: results.confidence || 0.8,
      suggestions: results.suggestions || [],
      metadata: results.metadata,
    };

    // Aplicar todas las actualizaciones de una vez
    Object.entries(updates).forEach(([key, value]) => {
      onUpdate(key, value);
    });

    console.log("✅ Análisis AI completado y aplicado");
  };

  // Aplicar resultado específico - SIMPLIFICADO
  const applySpecificResult = (type, data) => {
    if (!data) {
      console.warn(`❌ No hay datos para aplicar en tipo: ${type}`);
      return;
    }

    switch (type) {
      case "narrative":
        if (data.content) {
          onUpdate("content", data.content);
          console.log("📝 Narrativa aplicada manualmente");
        }
        break;
      default:
        console.warn("❌ Tipo de resultado no reconocido:", type);
    }
  };

  // Manejador para análisis manual
  const handleManualAnalysis = () => {
    setHasAutoAnalyzed(false); // Permitir re-análisis
    setAnalysisResults(null);
    handleAIAnalysis();
  };

  // Debug del estado del componente - Solo en desarrollo
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log("🔍 Estado:", {
        content: component.content
          ? `${component.content.length} chars`
          : "vacío",
        analyzing: isAnalyzing,
        hasData: hasDataForAnalysis(),
        features: {
          narrative: isFeatureEnabled("NARRATIVE"),
          charts: isFeatureEnabled("CHARTS"),
          kpis: isFeatureEnabled("KPIS"),
          trends: isFeatureEnabled("TRENDS"),
        },
      });
    }
  }, [component.content, isAnalyzing]);

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

        {/* Checkbox para análisis automático - Versión corregida */}
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

        {/* Panel de Configuración de AI */}
        <div className="mb-4">
          <AIConfigPanel
            config={aiConfig}
            onConfigChange={setAiConfig}
            hasData={hasDataForAnalysis()}
          />
        </div>

        {/* Botones de control */}
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

          <button
            type="button"
            onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
            className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
            title="Configuración avanzada"
          >
            <CogIcon className="h-4 w-4" />
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

      {/* Resultados del análisis AI - SIMPLIFICADO */}
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
                    className="text-sm bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 flex-shrink-0"
                  >
                    Aplicar
                  </button>
                </div>

                <div className="text-sm text-gray-700 max-h-32 overflow-y-auto bg-gray-50 p-2 rounded">
                  {analysisResults.narrative.content}
                </div>

                {/* Puntos clave */}
                {analysisResults.narrative.keyPoints &&
                  analysisResults.narrative.keyPoints.length > 0 && (
                    <div className="mt-3 pt-2 border-t">
                      <h6 className="text-xs font-bold text-gray-600 uppercase mb-1">
                        Puntos Clave
                      </h6>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {analysisResults.narrative.keyPoints.map(
                          (point, index) => (
                            <li key={index}>{point}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {/* Secciones */}
                {analysisResults.narrative.sections &&
                  Object.keys(analysisResults.narrative.sections).length >
                    0 && (
                    <div className="mt-3 pt-2 border-t">
                      <h6 className="text-xs font-bold text-gray-600 uppercase mb-1">
                        Secciones
                      </h6>
                      <div className="space-y-2">
                        {Object.entries(analysisResults.narrative.sections).map(
                          ([sectionName, sectionContent], index) => (
                            <div key={index} className="text-sm">
                              <strong className="text-gray-800">
                                {sectionName}:
                              </strong>
                              <div className="text-gray-600 mt-1">
                                {sectionContent}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* Sugerencias */}
            {analysisResults.suggestions &&
              analysisResults.suggestions.length > 0 && (
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <h5 className="font-medium text-blue-900 mb-2">
                    Sugerencias de AI
                  </h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {analysisResults.suggestions.map((suggestion, index) => (
                      <li key={index}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Metadatos del análisis */}
            {analysisResults.metadata && (
              <div className="bg-gray-50 p-3 rounded border">
                <h5 className="font-medium text-gray-900 mb-2">
                  Información del Análisis
                </h5>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Tipo: {analysisResults.metadata.analysisType}</div>
                  <div>Idioma: {analysisResults.metadata.language}</div>
                  <div>Tono: {analysisResults.metadata.tone}</div>
                  <div>
                    Confianza: {(analysisResults.confidence * 100).toFixed(1)}%
                  </div>
                  <div>
                    Generado:{" "}
                    {new Date(
                      analysisResults.metadata.timestamp
                    ).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sección de contenido actual */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <DocumentTextIcon className="h-5 w-5" />
          Contenido Actual del Componente
        </h4>

        <div className="bg-white p-3 rounded border">
          <div className="flex justify-between items-start mb-2">
            <h5 className="font-medium text-gray-900">Contenido</h5>
            <span className="text-xs text-gray-500">
              {component.content
                ? `${component.content.length} caracteres`
                : "Vacío"}
            </span>
          </div>

          <div className="text-sm text-gray-700 max-h-32 overflow-y-auto bg-gray-50 p-2 rounded">
            {component.content || "No hay contenido"}
          </div>

          {component.content && (
            <div className="mt-2 text-xs text-green-600">
              ✅ Contenido aplicado correctamente
            </div>
          )}

          {analysisResults?.narrative?.content && !component.content && (
            <div className="mt-2">
              <button
                onClick={() =>
                  applySpecificResult("narrative", analysisResults.narrative)
                }
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                Aplicar Narrativa Generada
              </button>
              <p className="text-xs text-gray-500 mt-1">
                La narrativa se generó pero no se aplicó automáticamente
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sección de configuración tradicional */}
      <div className="border-t pt-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            <input
              type="checkbox"
              checked={component.autoGenerate || false}
              onChange={(e) => onUpdate("autoGenerate", e.target.checked)}
              className="mr-2"
            />
            Generar narrativa automática (método tradicional)
          </label>
          <p className="text-xs text-gray-500">
            Cuando está activado, se generará un texto analítico básico basado
            en los datos.
          </p>
        </div>

        {component.autoGenerate && (
          <div className="space-y-3 mt-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Tipo de análisis
              </label>
              <select
                value={component.analysisConfig?.templateType || "default"}
                onChange={(e) =>
                  onUpdate("analysisConfig.templateType", e.target.value)
                }
                className="w-full p-2 border rounded"
              >
                <option value="default">General</option>
                <option value="sales">Ventas</option>
                <option value="financial">Financiero</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>

            {component.analysisConfig?.templateType === "custom" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Plantilla personalizada
                </label>
                <textarea
                  value={component.analysisConfig?.customTemplate || ""}
                  onChange={(e) =>
                    onUpdate("analysisConfig.customTemplate", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                  rows={4}
                  placeholder="Ej: Las ventas en {month} fueron {value} unidades..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Usa {"{columna}"} para datos y {"{avg}"}, {"{max}"}, etc. para
                  análisis.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                Columna a analizar
              </label>
              {excelColumns.length > 0 ? (
                <select
                  value={component.analysisConfig?.dataColumn || ""}
                  onChange={(e) =>
                    onUpdate("analysisConfig.dataColumn", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="">Seleccionar columna</option>
                  {excelColumns.map((col, idx) => (
                    <option key={idx} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full p-2 border rounded bg-gray-50 text-gray-500">
                  No hay datos de Excel cargados. Por favor, carga un archivo
                  Excel primero.
                </div>
              )}
            </div>

            {excelColumns.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Columna de categoría (opcional)
                </label>
                <select
                  value={component.analysisConfig?.categoryColumn || ""}
                  onChange={(e) =>
                    onUpdate("analysisConfig.categoryColumn", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="">No usar</option>
                  {excelColumns.map((col, idx) => (
                    <option key={idx} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Se usará para identificar meses, productos, etc.
                </p>
              </div>
            )}
          </div>
        )}

        {!component.autoGenerate && (
          <div className="mt-3">
            <label className="block text-sm font-medium mb-1">
              Contenido manual o generado
            </label>
            <textarea
              value={component.content || ""}
              onChange={(e) => onUpdate("content", e.target.value)}
              className="w-full p-2 border rounded"
              rows={6}
              placeholder="Escribe tu contenido o usa {columna} para datos de Excel"
            />
            {excelColumns.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Tip: Usa {"{columna}"} para insertar datos directamente desde
                Excel.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TextConfig;
