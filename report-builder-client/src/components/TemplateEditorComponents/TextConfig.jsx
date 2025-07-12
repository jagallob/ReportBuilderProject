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

const TextConfig = ({ component, onUpdate, sectionData = {} }) => {
  const [excelColumns, setExcelColumns] = useState([]);
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
  const [error, setError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [aiConfig, setAiConfig] = useState({
    analysisType: "comprehensive", // comprehensive, narrative, charts, kpis, trends
    includeCharts: true,
    includeKPIs: true,
    includeTrends: true,
    includeNarrative: true,
    chartTypes: ["bar", "line", "pie"],
    kpiTypes: ["sum", "avg", "max", "min", "count"],
    language: "es",
    tone: "professional",
  });

  useEffect(() => {
    if (!sectionData || !sectionData.excelData) return;

    console.log("sectionData recibido:", sectionData);
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

  // Nuevo useEffect para disparar el análisis automático con AI
  useEffect(() => {
    // Se activa si la opción está marcada, hay datos, no se está analizando ya y no hay resultados previos.
    if (
      component.autoAnalyzeAI &&
      hasDataForAnalysis() &&
      !isAnalyzing &&
      !analysisResults
    ) {
      console.log("Activado análisis automático con AI...");
      handleAIAnalysis();
    }
    // Las dependencias aseguran que se ejecute solo cuando cambien los datos o la configuración de auto-análisis.
  }, [sectionData, component.autoAnalyzeAI, isAnalyzing, analysisResults]);

  // 1. Refactorización: Un solo manejador para todos los cambios en aiConfig
  const handleAiConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAiConfig((prevConfig) => ({
      ...prevConfig,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  //Refactorizamos el manejador de análisis para orquestar los servicios
  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResults(null);

    try {
      const dataToAnalyze = sectionData?.excelData;
      if (
        !dataToAnalyze ||
        !dataToAnalyze.data ||
        dataToAnalyze.data.length === 0
      ) {
        throw new Error("No hay datos de Excel disponibles para el análisis.");
      }

      // Paso 1: Llamar al servicio de análisis. Este es el análisis base.
      console.log("Iniciando análisis de datos...");
      // Pasamos tanto los datos como la configuración de AI al servicio
      const baseAnalysis = await analyzeExcelData(dataToAnalyze.data, aiConfig);
      console.log("Análisis base recibido:", baseAnalysis);

      // Preparamos el objeto de resultados finales
      const finalResults = {
        narrative: null,
        // El modelo AnalysisResult no tiene 'charts', lo inicializamos vacío.
        // Si quieres esta funcionalidad, debes añadir la propiedad 'Charts' a la clase AnalysisResult en C#.
        charts: baseAnalysis.charts || [],
        // CORRECCIÓN: Mapeamos desde 'metrics' (backend) en lugar de 'keyMetrics' (frontend)
        kpis: baseAnalysis.metrics
          ? Object.entries(baseAnalysis.metrics).map(([key, value]) => ({
              name: key,
              value: String(value), // Convertimos a string para una visualización segura
            }))
          : [],
        // CORRECCIÓN: Mapeamos la descripción de cada objeto 'trend' para mostrarla
        trends:
          baseAnalysis.trends?.map(
            (t) => `${t.metric} tiene una tendencia ${t.direction}`
          ) || [],
        // CORRECCIÓN: Mapeamos la descripción de cada 'insight' como una sugerencia
        suggestions: baseAnalysis.insights?.map((i) => i.description) || [],
        confidence: baseAnalysis.insights?.[0]?.confidence || 0.8, // Usamos la confianza del primer insight como referencia
      };

      // Paso 2: Si se solicita una narrativa, llamar al servicio de narrativa
      if (aiConfig.includeNarrative) {
        console.log("Generando narrativa a partir del análisis...");
        // Pasamos el resultado del análisis anterior para generar el texto
        const narrativeResult = await generateNarrativeFromAnalysis(
          // 2. CORRECCIÓN: Pasamos aiConfig para que se use el idioma y tono correctos
          baseAnalysis,
          aiConfig
        );
        finalResults.narrative = narrativeResult.narrative;
        console.log("Narrativa generada:", narrativeResult.narrative);
      }

      // (Aquí se podrían añadir llamadas a otros servicios para tendencias, etc., si fuera necesario)

      setAnalysisResults(finalResults);

      // Aplicar resultados automáticamente si está configurado
      // Si el análisis se disparó automáticamente, aplicamos los resultados también automáticamente.
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

  // Aplicar resultados de AI al componente
  const applyAIResults = (results) => {
    if (results.narrative) {
      onUpdate("content", results.narrative);
    }

    if (results.charts?.length > 0) {
      onUpdate("generatedCharts", results.charts);
    }

    if (results.kpis?.length > 0) {
      onUpdate("generatedKPIs", results.kpis);
    }

    if (results.trends) {
      onUpdate("generatedTrends", results.trends);
    }

    // Actualizar metadatos de AI
    onUpdate("aiMetadata", {
      lastAnalysis: new Date().toISOString(),
      analysisConfig: aiConfig,
      confidence: results.confidence || 0.8,
      suggestions: results.suggestions || [],
    });
  };

  // Aplicar resultado específico
  const applySpecificResult = (type, data) => {
    switch (type) {
      case "narrative":
        onUpdate("content", data);
        break;
      case "charts":
        onUpdate("generatedCharts", data);
        break;
      case "kpis":
        onUpdate("generatedKPIs", data);
        break;
      case "trends":
        onUpdate("generatedTrends", data);
        break;
    }
  };

  // Verificar si hay datos disponibles para análisis
  const hasDataForAnalysis = () => {
    return (
      sectionData?.excelData?.data?.length > 0 ||
      sectionData?.powerBIData?.length > 0 ||
      sectionData?.apiData?.length > 0
    );
  };

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

        {/* Checkbox para controlar el análisis automático */}
        <div className="mb-4">
          <label className="flex items-center text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={component.autoAnalyzeAI || false}
              onChange={(e) => onUpdate("autoAnalyzeAI", e.target.checked)}
              className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Analizar automáticamente con AI al cargar nuevos datos
          </label>
        </div>

        {/* Configuración de AI */}
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Tipo de análisis
              </label>
              <select
                name="analysisType"
                value={aiConfig.analysisType}
                onChange={handleAiConfigChange}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="comprehensive">Análisis Completo</option>
                <option value="narrative">Solo Narrativa</option>
                <option value="charts">Solo Gráficos</option>
                <option value="kpis">Solo KPIs</option>
                <option value="trends">Solo Tendencias</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Idioma</label>
              <select
                name="language"
                value={aiConfig.language}
                onChange={handleAiConfigChange}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <label className="flex items-center text-sm">
              <input
                name="includeNarrative"
                type="checkbox"
                checked={aiConfig.includeNarrative}
                onChange={handleAiConfigChange}
                className="mr-2"
              />
              <DocumentTextIcon className="h-4 w-4 mr-1" />
              Narrativa
            </label>

            <label className="flex items-center text-sm">
              <input
                name="includeCharts"
                type="checkbox"
                checked={aiConfig.includeCharts}
                onChange={handleAiConfigChange}
                className="mr-2"
              />
              <ChartBarIcon className="h-4 w-4 mr-1" />
              Gráficos
            </label>

            <label className="flex items-center text-sm">
              <input
                name="includeKPIs"
                type="checkbox"
                checked={aiConfig.includeKPIs}
                onChange={handleAiConfigChange}
                className="mr-2"
              />
              <EyeIcon className="h-4 w-4 mr-1" />
              KPIs
            </label>

            <label className="flex items-center text-sm">
              <input
                name="includeTrends"
                type="checkbox"
                checked={aiConfig.includeTrends}
                onChange={handleAiConfigChange}
                className="mr-2"
              />
              <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              Tendencias
            </label>
          </div>
        </div>

        {/* Botón principal de análisis AI */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleAIAnalysis}
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
          <p className="text-sm text-red-600 mt-2 bg-red-50 p-2 rounded">
            <strong>Error:</strong> {error}
          </p>
        )}

        {!hasDataForAnalysis() && (
          <p className="text-sm text-amber-600 mt-2 bg-amber-50 p-2 rounded">
            ⚠️ No hay datos cargados. Sube un archivo Excel, conecta PowerBI o
            configura una API primero.
          </p>
        )}
      </div>

      {/* 3. La UI para mostrar resultados se mantiene, ahora alimentada por el nuevo flujo */}
      {analysisResults && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
            <SparklesIcon className="h-5 w-5" />
            Resultados del Análisis AI
          </h4>

          <div className="space-y-3">
            {analysisResults.narrative && (
              <div className="bg-white p-3 rounded border">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-900">
                    Narrativa Generada
                  </h5>
                  <button
                    onClick={() =>
                      applySpecificResult(
                        "narrative",
                        analysisResults.narrative
                      )
                    }
                    className="text-sm bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    Aplicar
                  </button>
                </div>
                <p className="text-sm text-gray-700 max-h-32 overflow-y-auto">
                  {analysisResults.narrative}
                </p>
              </div>
            )}

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

            {analysisResults.trends && (
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
                <p className="text-sm text-gray-700">
                  {analysisResults.trends.join(", ")}
                </p>
              </div>
            )}

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

      {/* 4. Eliminamos la sección que renderizaba el NarrativeGenerator tradicional */}
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

      {/* Mostrar contenido generado por AI */}
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
