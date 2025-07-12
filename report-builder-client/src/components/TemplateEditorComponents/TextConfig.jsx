import { useEffect, useState } from "react";
import {
  SparklesIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import NarrativeGenerator from "../AI/NarrativeGenerator";
import AIDataAnalyzer from "../AI/AIDataAnalyzer";

const TextConfig = ({ component, onUpdate, sectionData = {} }) => {
  const [excelColumns, setExcelColumns] = useState([]);
  const [showNarrativeGenerator, setShowNarrativeGenerator] = useState(false);
  const [showAIAnalyzer, setShowAIAnalyzer] = useState(false);
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

  // Handler para recibir la narrativa generada y actualizar el contenido
  const handleNarrativeGenerated = (narrative) => {
    onUpdate("content", narrative);
    setShowNarrativeGenerator(false);
  };

  // Handler para análisis completo con AI
  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // Preparar datos para enviar a la AI
      const dataToAnalyze = {
        excelData: sectionData?.excelData,
        powerBIData: sectionData?.powerBIData,
        apiData: sectionData?.apiData,
        selectedColumns: component.analysisConfig?.dataColumn
          ? [component.analysisConfig.dataColumn]
          : [],
        categoryColumn: component.analysisConfig?.categoryColumn,
        analysisConfig: aiConfig,
      };

      // Llamar al servicio de AI
      const response = await fetch("/api/ai/analyze-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: dataToAnalyze,
          config: aiConfig,
          requestedOutputs: {
            narrative: aiConfig.includeNarrative,
            charts: aiConfig.includeCharts,
            kpis: aiConfig.includeKPIs,
            trends: aiConfig.includeTrends,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const analysisResult = await response.json();
      setAnalysisResults(analysisResult);

      // Aplicar resultados automáticamente si está configurado
      if (component.autoApplyAIResults) {
        applyAIResults(analysisResult);
      }
    } catch (error) {
      console.error("Error en análisis AI:", error);
      alert("Error al analizar datos con AI. Por favor, intenta nuevamente.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Aplicar resultados de AI al componente
  const applyAIResults = (results) => {
    if (results.narrative) {
      onUpdate("content", results.narrative);
    }

    if (results.charts && results.charts.length > 0) {
      onUpdate("generatedCharts", results.charts);
    }

    if (results.kpis && results.kpis.length > 0) {
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

        {/* Configuración de AI */}
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Tipo de análisis
              </label>
              <select
                value={aiConfig.analysisType}
                onChange={(e) =>
                  setAiConfig({ ...aiConfig, analysisType: e.target.value })
                }
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
                value={aiConfig.language}
                onChange={(e) =>
                  setAiConfig({ ...aiConfig, language: e.target.value })
                }
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
                type="checkbox"
                checked={aiConfig.includeNarrative}
                onChange={(e) =>
                  setAiConfig({
                    ...aiConfig,
                    includeNarrative: e.target.checked,
                  })
                }
                className="mr-2"
              />
              <DocumentTextIcon className="h-4 w-4 mr-1" />
              Narrativa
            </label>

            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={aiConfig.includeCharts}
                onChange={(e) =>
                  setAiConfig({ ...aiConfig, includeCharts: e.target.checked })
                }
                className="mr-2"
              />
              <ChartBarIcon className="h-4 w-4 mr-1" />
              Gráficos
            </label>

            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={aiConfig.includeKPIs}
                onChange={(e) =>
                  setAiConfig({ ...aiConfig, includeKPIs: e.target.checked })
                }
                className="mr-2"
              />
              <EyeIcon className="h-4 w-4 mr-1" />
              KPIs
            </label>

            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={aiConfig.includeTrends}
                onChange={(e) =>
                  setAiConfig({ ...aiConfig, includeTrends: e.target.checked })
                }
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
            onClick={() => setShowAIAnalyzer(!showAIAnalyzer)}
            className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
            title="Configuración avanzada"
          >
            <CogIcon className="h-4 w-4" />
          </button>
        </div>

        {!hasDataForAnalysis() && (
          <p className="text-sm text-amber-600 mt-2 bg-amber-50 p-2 rounded">
            ⚠️ No hay datos cargados. Sube un archivo Excel, conecta PowerBI o
            configura una API primero.
          </p>
        )}
      </div>

      {/* Resultados del análisis AI */}
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
                  {analysisResults.trends.summary}
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

      {/* Configuración tradicional */}
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

            {/* Botón para generador tradicional */}
            <div>
              <button
                type="button"
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 mb-2"
                onClick={() => setShowNarrativeGenerator((prev) => !prev)}
              >
                {showNarrativeGenerator
                  ? "Ocultar generador tradicional"
                  : "Generar narrativa tradicional"}
              </button>
              {showNarrativeGenerator && (
                <div className="mt-4 border rounded p-4 bg-gray-50">
                  <NarrativeGenerator
                    excelData={sectionData?.excelData}
                    onNarrativeGenerated={handleNarrativeGenerated}
                  />
                </div>
              )}
            </div>
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
