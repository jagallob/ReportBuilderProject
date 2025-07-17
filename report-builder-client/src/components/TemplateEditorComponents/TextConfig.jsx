import { useEffect, useState } from "react";
import {
  SparklesIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import { analyzeExcelData } from "../../services/analysisService";
import { generateNarrativeFromAnalysis } from "../../services/narrativeService";
import AIConfigPanel from "../AI/AIConfigPanel";

const TextConfig = ({ component, onUpdate, sectionData = {} }) => {
  const [excelColumns, setExcelColumns] = useState([]);
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
  const [error, setError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [hasAutoAnalyzed, setHasAutoAnalyzed] = useState(false); // Nuevo estado para evitar bucles
  const [aiConfig, setAiConfig] = useState({
    analysisType: "comprehensive",
    includeCharts: true,
    includeKPIs: true,
    includeTrends: true,
    includeNarrative: true,
    chartTypes: ["bar", "line", "pie"],
    kpiTypes: ["sum", "avg", "max", "min", "count"],
    language: "es",
    tone: "professional",
  });

  // Efecto para manejar columnas de Excel
  useEffect(() => {
    if (!sectionData || !sectionData.excelData) {
      console.log(
        "useEffect: No se encontró sectionData o sectionData.excelData."
      );
      setExcelColumns([]);
      return;
    }

    console.log("sectionData recibido:", sectionData);
    console.log("Datos de Excel (data array):", sectionData?.excelData?.data);
    console.log(
      "Número de filas de datos:",
      sectionData?.excelData?.data?.length
    );
    console.log("Headers de Excel:", sectionData?.excelData?.headers);

    if (
      sectionData?.excelData?.headers &&
      Array.isArray(sectionData.excelData.headers)
    ) {
      console.log(
        "Headers de Excel encontrados:",
        sectionData.excelData.headers
      );
      setExcelColumns(sectionData.excelData.headers);
    } else {
      console.warn("No se encontraron headers de Excel en sectionData", {
        sectionData: sectionData,
      });
    }
  }, [sectionData]);

  // Efecto para análisis automático - CORREGIDO para evitar bucles infinitos
  useEffect(() => {
    // Solo ejecutar si:
    // 1. El análisis automático está activado
    // 2. Hay datos para analizar
    // 3. No se está analizando actualmente
    // 4. No se ha ejecutado el análisis automático para estos datos
    // 5. No hay resultados previos o los datos han cambiado
    if (
      component.autoAnalyzeAI &&
      hasDataForAnalysis() &&
      !isAnalyzing &&
      !hasAutoAnalyzed &&
      !analysisResults
    ) {
      console.log("Activando análisis automático con AI...");
      setHasAutoAnalyzed(true); // Marcar que ya se ejecutó
      handleAIAnalysis();
    }
  }, [sectionData?.excelData, component.autoAnalyzeAI]); // Dependencias más específicas

  // Resetear el flag cuando cambian los datos
  useEffect(() => {
    if (sectionData?.excelData) {
      setHasAutoAnalyzed(false);
      setAnalysisResults(null); // Limpiar resultados previos
    }
  }, [sectionData?.excelData?.data]); // Solo cuando cambian los datos realmente

  // Manejador de análisis mejorado
  const handleAIAnalysis = async () => {
    if (isAnalyzing) {
      console.log("Análisis ya en progreso, ignorando solicitud duplicada");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const dataToAnalyze = sectionData?.excelData;
      if (
        !dataToAnalyze ||
        !dataToAnalyze.data ||
        dataToAnalyze.data.length === 0
      ) {
        throw new Error("No hay datos de Excel disponibles para el análisis.");
      }

      console.log("Iniciando análisis de datos...");

      const requestPayload = {
        Data: dataToAnalyze.data,
        Config: aiConfig,
      };

      const baseAnalysis = await analyzeExcelData(requestPayload);
      console.log("Análisis base recibido:", baseAnalysis);

      // Preparar resultados finales con mejor manejo de datos
      const finalResults = {
        narrative: null,
        charts: baseAnalysis.charts || baseAnalysis.Charts || [],
        kpis: mapKPIs(baseAnalysis),
        trends: mapTrends(baseAnalysis),
        suggestions: mapSuggestions(baseAnalysis),
        confidence: getConfidence(baseAnalysis),
      };

      // Generar narrativa si se solicita
      if (aiConfig.includeNarrative) {
        console.log("Generando narrativa a partir del análisis...");
        try {
          const narrativeResult = await generateNarrativeFromAnalysis(
            baseAnalysis,
            aiConfig
          );

          if (narrativeResult && narrativeResult.content) {
            finalResults.narrative = narrativeResult;
            console.log("Narrativa generada exitosamente:", narrativeResult);
          }
        } catch (narrativeError) {
          console.error("Error generando narrativa:", narrativeError);
          finalResults.narrative = {
            title: "Error generando narrativa",
            content: `No se pudo generar la narrativa automáticamente. Error: ${narrativeError.message}`,
            keyPoints: [],
          };
        }
      }

      setAnalysisResults(finalResults);

      // Aplicar resultados automáticamente solo si no es análisis manual
      if (component.autoAnalyzeAI) {
        applyAIResults(finalResults);
        console.log("Resultados de AI aplicados automáticamente.");
      }
    } catch (error) {
      console.error("Error en análisis AI:", error);
      setError(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Funciones auxiliares para mapear datos - NUEVAS
  const mapKPIs = (analysis) => {
    const metrics = analysis.metrics || analysis.Metrics;
    if (!metrics) return [];

    return Object.entries(metrics).map(([key, value]) => ({
      name: key,
      value: String(value),
    }));
  };

  const mapTrends = (analysis) => {
    const trends = analysis.trends || analysis.Trends;
    if (!trends || !Array.isArray(trends)) return [];

    return trends.map(
      (t) =>
        `${t.metric || t.Metric} tiene una tendencia ${
          t.direction || t.Direction
        }`
    );
  };

  const mapSuggestions = (analysis) => {
    const insights = analysis.insights || analysis.Insights;
    if (!insights || !Array.isArray(insights)) return [];

    return insights.map((i) => i.description || i.Description);
  };

  const getConfidence = (analysis) => {
    const insights = analysis.insights || analysis.Insights;
    if (!insights || !Array.isArray(insights) || insights.length === 0)
      return 0.8;

    return insights[0].confidence || insights[0].Confidence || 0.8;
  };

  // Aplicar resultados de AI - MEJORADO
  const applyAIResults = (results) => {
    console.log("Aplicando todos los resultados de AI:", results);

    const updates = {};

    // Aplicar narrativa
    if (results.narrative && results.narrative.content) {
      updates.content = results.narrative.content;
      console.log(
        "Narrativa preparada para aplicar:",
        results.narrative.content
      );
    }

    // Aplicar otros resultados
    if (results.charts && results.charts.length > 0) {
      updates.generatedCharts = results.charts;
      console.log("Gráficos preparados para aplicar:", results.charts);
    }

    if (results.kpis && results.kpis.length > 0) {
      updates.generatedKPIs = results.kpis;
      console.log("KPIs preparados para aplicar:", results.kpis);
    }

    if (results.trends && results.trends.length > 0) {
      updates.generatedTrends = results.trends;
      console.log("Tendencias preparadas para aplicar:", results.trends);
    }

    // Metadatos
    updates.aiMetadata = {
      lastAnalysis: new Date().toISOString(),
      analysisConfig: aiConfig,
      confidence: results.confidence || 0.8,
      suggestions: results.suggestions || [],
    };

    // Aplicar todas las actualizaciones de una vez
    Object.entries(updates).forEach(([key, value]) => {
      onUpdate(key, value);
    });

    console.log("Todas las actualizaciones aplicadas:", updates);
  };

  // Aplicar resultado específico - MEJORADO
  const applySpecificResult = (type, data) => {
    console.log(`Aplicando resultado específico: ${type}`, data);

    switch (type) {
      case "narrative":
        if (data && data.content) {
          onUpdate("content", data.content);
          console.log("Narrativa aplicada al contenido:", data.content);
        } else {
          console.warn("No se pudo aplicar narrativa - datos inválidos:", data);
        }
        break;
      case "charts":
        onUpdate("generatedCharts", data);
        console.log("Gráficos aplicados:", data);
        break;
      case "kpis":
        onUpdate("generatedKPIs", data);
        console.log("KPIs aplicados:", data);
        break;
      case "trends":
        onUpdate("generatedTrends", data);
        console.log("Tendencias aplicadas:", data);
        break;
      default:
        console.warn("Tipo de resultado no reconocido:", type);
    }
  };

  // Verificar disponibilidad de datos
  const hasDataForAnalysis = () => {
    return (
      sectionData?.excelData?.data?.length > 0 ||
      sectionData?.powerBIData?.length > 0 ||
      sectionData?.apiData?.length > 0
    );
  };

  // Manejador para análisis manual
  const handleManualAnalysis = () => {
    setHasAutoAnalyzed(false); // Permitir re-análisis
    setAnalysisResults(null);
    handleAIAnalysis();
  };

  // Debug del estado del componente
  useEffect(() => {
    console.log("=== DEBUG: Estado del componente ===");
    console.log("component.content:", component.content);
    console.log("component.autoAnalyzeAI:", component.autoAnalyzeAI);
    console.log("analysisResults:", analysisResults);
    console.log("isAnalyzing:", isAnalyzing);
    console.log("hasAutoAnalyzed:", hasAutoAnalyzed);
    console.log("===================================");
  }, [component, analysisResults, isAnalyzing, hasAutoAnalyzed]);

  return (
    <div className="space-y-6">
      {/* Sección de AI Analysis */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <SparklesIcon className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">
            Análisis Inteligente con AI
          </h3>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Usa AI para analizar automáticamente tus datos y generar narrativas,
          gráficos, KPIs y tendencias.
        </p>

        {/* Checkbox para análisis automático */}
        <div className="mb-4">
          <label className="flex items-center text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={component.autoAnalyzeAI || false}
              onChange={(e) => {
                onUpdate("autoAnalyzeAI", e.target.checked);
                if (e.target.checked) {
                  setHasAutoAnalyzed(false); // Permitir nuevo análisis automático
                }
              }}
              className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Analizar automáticamente con AI al cargar nuevos datos
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
                Analizando...
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4" />
                Analizar con AI
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

      {/* Resultados del análisis AI - MEJORADO */}
      {analysisResults && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
            <SparklesIcon className="h-5 w-5" />
            Resultados del Análisis AI
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

            {/* Gráficos */}
            {analysisResults.charts && analysisResults.charts.length > 0 && (
              <div className="bg-white p-3 rounded border">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-900">
                    Gráficos Sugeridos ({analysisResults.charts.length})
                  </h5>
                  <button
                    onClick={() =>
                      applySpecificResult("charts", analysisResults.charts)
                    }
                    className="text-sm bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    Aplicar
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  {analysisResults.charts.map((chart, index) => (
                    <div key={index} className="mb-1">
                      • {chart.type}: {chart.title}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* KPIs */}
            {analysisResults.kpis && analysisResults.kpis.length > 0 && (
              <div className="bg-white p-3 rounded border">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-900">
                    KPIs Identificados ({analysisResults.kpis.length})
                  </h5>
                  <button
                    onClick={() =>
                      applySpecificResult("kpis", analysisResults.kpis)
                    }
                    className="text-sm bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    Aplicar
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {analysisResults.kpis.map((kpi, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded">
                      <div className="font-medium">{kpi.name}</div>
                      <div className="text-gray-600">{kpi.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tendencias */}
            {analysisResults.trends && analysisResults.trends.length > 0 && (
              <div className="bg-white p-3 rounded border">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-900">
                    Tendencias Detectadas
                  </h5>
                  <button
                    onClick={() =>
                      applySpecificResult("trends", analysisResults.trends)
                    }
                    className="text-sm bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    Aplicar
                  </button>
                </div>
                <div className="text-sm text-gray-700">
                  {analysisResults.trends.map((trend, index) => (
                    <div key={index} className="mb-1">
                      • {trend}
                    </div>
                  ))}
                </div>
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
          </div>
        </div>
      )}

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

      {/* Indicadores de contenido generado */}
      {component.generatedCharts && component.generatedCharts.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">
            Gráficos Generados por AI
          </h4>
          <div className="text-sm text-blue-800">
            {component.generatedCharts.length} gráfico(s) configurado(s) para
            esta sección.
          </div>
        </div>
      )}

      {component.generatedKPIs && component.generatedKPIs.length > 0 && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-900 mb-2">
            KPIs Generados por AI
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {component.generatedKPIs.map((kpi, index) => (
              <div key={index} className="bg-white p-2 rounded border">
                <div className="font-medium text-sm">{kpi.name}</div>
                <div className="text-green-700 font-bold">{kpi.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TextConfig;
