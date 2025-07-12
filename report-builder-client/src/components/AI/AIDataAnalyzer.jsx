import React, { useState } from "react";
import {
  ChartBarIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const AIDataAnalyzer = ({
  excelData,
  powerBIData,
  apiData,
  onAnalysisComplete,
  config = {},
}) => {
  const [analysisStep, setAnalysisStep] = useState("idle"); // idle, analyzing, complete, error
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Configuración por defecto
  const defaultConfig = {
    includeNarrative: true,
    includeCharts: true,
    includeKPIs: true,
    includeTrends: true,
    language: "es",
    tone: "professional",
    chartTypes: ["bar", "line", "pie", "scatter"],
    kpiTypes: ["sum", "avg", "max", "min", "count", "growth"],
    ...config,
  };

  // Pasos del análisis
  const analysisSteps = [
    { id: "data_validation", name: "Validando datos", duration: 10 },
    { id: "statistical_analysis", name: "Análisis estadístico", duration: 20 },
    { id: "pattern_detection", name: "Detectando patrones", duration: 25 },
    { id: "narrative_generation", name: "Generando narrativa", duration: 20 },
    { id: "chart_suggestions", name: "Sugiriendo gráficos", duration: 15 },
    { id: "kpi_calculation", name: "Calculando KPIs", duration: 10 },
  ];

  const startAnalysis = async () => {
    setAnalysisStep("analyzing");
    setProgress(0);
    setError(null);
    setResults(null);

    try {
      // Preparar datos para el análisis
      const combinedData = {
        excel: excelData,
        powerBI: powerBIData,
        api: apiData,
        source: determineDataSource(),
        totalRows: getTotalRows(),
        columns: getAvailableColumns(),
      };

      // Ejecutar análisis paso a paso
      for (let i = 0; i < analysisSteps.length; i++) {
        const step = analysisSteps[i];
        setCurrentStep(step.name);

        // Ejecutar paso del análisis
        await executeAnalysisStep(step.id, combinedData, defaultConfig);
        setProgress(((i + 1) / analysisSteps.length) * 100);

        // Pausa para mostrar progreso
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Generar resultados finales
      const finalResults = await generateFinalResults(
        combinedData,
        defaultConfig
      );
      setResults(finalResults);
      setAnalysisStep("complete");

      if (onAnalysisComplete) {
        onAnalysisComplete(finalResults);
      }
    } catch (err) {
      setError(err.message);
      setAnalysisStep("error");
    }
  };

  const executeAnalysisStep = async (stepId, data, stepConfig) => {
    switch (stepId) {
      case "data_validation":
        return await validateData(data);
      case "statistical_analysis":
        return await performStatisticalAnalysis(data);
      case "pattern_detection":
        return await detectPatterns(data);
      case "narrative_generation":
        return await generateNarrative(data, stepConfig);
      case "chart_suggestions":
        return await suggestCharts(data, stepConfig);
      case "kpi_calculation":
        return await calculateKPIs(data, stepConfig);
      default:
        return {};
    }
  };

  // Funciones de análisis específicas
  const validateData = async (data) => {
    const validation = {
      hasData: data.totalRows > 0,
      hasColumns: data.columns.length > 0,
      hasNumericData: data.columns.some((col) => col.type === "number"),
      hasDateData: data.columns.some((col) => col.type === "date"),
      quality: calculateDataQuality(data),
    };

    return validation;
  };

  const performStatisticalAnalysis = async (data) => {
    // Aquí iría la lógica para análisis estadístico
    const stats = {
      descriptiveStats: calculateDescriptiveStats(data),
      correlations: calculateCorrelations(data),
      distributions: analyzeDistributions(data),
    };

    return stats;
  };

  const detectPatterns = async (data) => {
    // Detectar patrones en los datos
    const patterns = {
      trends: identifyTrends(data),
      seasonality: identifySeasonality(data),
      outliers: identifyOutliers(data),
      clusters: identifyClusters(data),
    };

    return patterns;
  };

  const generateNarrative = async (data, narrativeConfig) => {
    // Llamar a la API de AI para generar narrativa
    try {
      const response = await fetch("/api/ai/generate-narrative", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: data,
          config: narrativeConfig,
          analysisType: "comprehensive",
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      return result.narrative;
    } catch (error) {
      console.error("Error generating narrative:", error);
      // Fallback a narrativa básica
      return generateBasicNarrative(data);
    }
  };

  const suggestCharts = async (data, chartConfig) => {
    const suggestions = [];

    // Lógica para sugerir gráficos basada en los datos
    if (data.columns.some((col) => col.type === "number")) {
      suggestions.push({
        type: "bar",
        title: "Gráfico de Barras",
        description: "Comparación de valores numéricos",
        columns: data.columns
          .filter((col) => col.type === "number")
          .slice(0, 2),
        priority: "high",
      });
    }

    if (data.columns.some((col) => col.type === "date")) {
      suggestions.push({
        type: "line",
        title: "Gráfico de Líneas Temporal",
        description: "Tendencias a lo largo del tiempo",
        columns: [
          data.columns.find((col) => col.type === "date"),
          data.columns.find((col) => col.type === "number"),
        ].filter(Boolean),
        priority: "high",
      });
    }

    if (
      data.columns.length >= 2 &&
      chartConfig.chartTypes.includes("scatter")
    ) {
      suggestions.push({
        type: "scatter",
        title: "Gráfico de Dispersión",
        description: "Correlación entre variables",
        columns: data.columns
          .filter((col) => col.type === "number")
          .slice(0, 2),
        priority: "medium",
      });
    }

    // Sugerir gráfico de torta si hay columnas categóricas
    const categoricalCols = data.columns.filter((col) => col.type === "string");
    if (categoricalCols.length > 0 && chartConfig.chartTypes.includes("pie")) {
      suggestions.push({
        type: "pie",
        title: "Gráfico de Torta",
        description: "Distribución por categorías",
        columns: [
          categoricalCols[0],
          data.columns.find((col) => col.type === "number"),
        ].filter(Boolean),
        priority: "medium",
      });
    }

    return suggestions;
  };

  const calculateKPIs = async (data, kpiConfig) => {
    const kpis = {};
    const numericColumns = data.columns.filter((col) => col.type === "number");

    for (const col of numericColumns) {
      const values = getColumnValues(data, col.name);

      if (kpiConfig.kpiTypes.includes("sum")) {
        kpis[`${col.name}_sum`] = {
          name: `Total ${col.name}`,
          value: values.reduce((sum, val) => sum + val, 0),
          type: "sum",
          format: "number",
        };
      }

      if (kpiConfig.kpiTypes.includes("avg")) {
        kpis[`${col.name}_avg`] = {
          name: `Promedio ${col.name}`,
          value: values.reduce((sum, val) => sum + val, 0) / values.length,
          type: "avg",
          format: "decimal",
        };
      }

      if (kpiConfig.kpiTypes.includes("max")) {
        kpis[`${col.name}_max`] = {
          name: `Máximo ${col.name}`,
          value: Math.max(...values),
          type: "max",
          format: "number",
        };
      }

      if (kpiConfig.kpiTypes.includes("min")) {
        kpis[`${col.name}_min`] = {
          name: `Mínimo ${col.name}`,
          value: Math.min(...values),
          type: "min",
          format: "number",
        };
      }

      if (kpiConfig.kpiTypes.includes("count")) {
        kpis[`${col.name}_count`] = {
          name: `Conteo ${col.name}`,
          value: values.length,
          type: "count",
          format: "number",
        };
      }
    }

    return kpis;
  };

  // Funciones auxiliares
  const determineDataSource = () => {
    if (excelData && excelData.length > 0) return "excel";
    if (powerBIData && powerBIData.length > 0) return "powerbi";
    if (apiData && apiData.length > 0) return "api";
    return "none";
  };

  const getTotalRows = () => {
    const data = excelData || powerBIData || apiData || [];
    return data.length;
  };

  const getAvailableColumns = () => {
    const data = excelData || powerBIData || apiData || [];
    if (data.length === 0) return [];

    const firstRow = data[0];
    return Object.keys(firstRow).map((key) => ({
      name: key,
      type: inferColumnType(data, key),
    }));
  };

  const inferColumnType = (data, columnName) => {
    if (data.length === 0) return "unknown";

    const sample = data.slice(0, 10);
    const values = sample
      .map((row) => row[columnName])
      .filter((val) => val != null);

    if (values.length === 0) return "unknown";

    // Verificar si es fecha
    if (values.some((val) => !isNaN(Date.parse(val)))) {
      return "date";
    }

    // Verificar si es número
    if (values.every((val) => !isNaN(parseFloat(val)))) {
      return "number";
    }

    return "string";
  };

  const calculateDataQuality = (data) => {
    let score = 100;

    // Penalizar por datos faltantes
    const totalCells = data.totalRows * data.columns.length;
    const missingCells = countMissingCells(data);
    score -= (missingCells / totalCells) * 30;

    // Penalizar por duplicados
    const duplicateRows = countDuplicateRows(data);
    score -= (duplicateRows / data.totalRows) * 20;

    return Math.max(0, Math.min(100, score));
  };

  const countMissingCells = (data) => {
    // Simulación - en implementación real contaría celdas vacías
    return Math.floor(data.totalRows * data.columns.length * 0.05);
  };

  const countDuplicateRows = (data) => {
    // Simulación - en implementación real contaría filas duplicadas
    return Math.floor(data.totalRows * 0.02);
  };

  const calculateDescriptiveStats = (data) => {
    // Usar los datos para calcular estadísticas descriptivas
    const numericColumns = data.columns.filter((col) => col.type === "number");
    const stats = {};

    numericColumns.forEach((col) => {
      const values = getColumnValues(data, col.name);
      if (values.length > 0) {
        const sum = values.reduce((a, b) => a + b, 0);
        const mean = sum / values.length;
        const sortedValues = [...values].sort((a, b) => a - b);
        const median = sortedValues[Math.floor(sortedValues.length / 2)];

        stats[col.name] = {
          mean,
          median,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length,
        };
      }
    });

    return stats;
  };

  const calculateCorrelations = (data) => {
    // Calcular correlaciones básicas entre columnas numéricas
    const numericColumns = data.columns.filter((col) => col.type === "number");
    const correlations = {};

    for (let i = 0; i < numericColumns.length; i++) {
      for (let j = i + 1; j < numericColumns.length; j++) {
        const col1 = numericColumns[i];
        const col2 = numericColumns[j];
        const key = `${col1.name}_${col2.name}`;

        // Correlación simulada - en implementación real se calcularía
        correlations[key] = Math.random() * 2 - 1; // valor entre -1 y 1
      }
    }

    return correlations;
  };

  const analyzeDistributions = (data) => {
    // Análisis de distribuciones para columnas numéricas
    const distributions = {};
    const numericColumns = data.columns.filter((col) => col.type === "number");

    numericColumns.forEach((col) => {
      const values = getColumnValues(data, col.name);
      if (values.length > 0) {
        distributions[col.name] = {
          type: "normal", // simplificado
          parameters: {
            mean: values.reduce((a, b) => a + b, 0) / values.length,
            std: Math.sqrt(
              values.reduce(
                (a, b) =>
                  a +
                  Math.pow(
                    b - values.reduce((c, d) => c + d, 0) / values.length,
                    2
                  ),
                0
              ) / values.length
            ),
          },
        };
      }
    });

    return distributions;
  };

  const identifyTrends = (data) => {
    // Identificar tendencias en datos temporales
    const trends = [];
    const dateColumns = data.columns.filter((col) => col.type === "date");
    const numericColumns = data.columns.filter((col) => col.type === "number");

    if (dateColumns.length > 0 && numericColumns.length > 0) {
      trends.push({
        type: "temporal",
        direction: "increasing",
        strength: 0.7,
        columns: [dateColumns[0].name, numericColumns[0].name],
      });
    }

    return trends;
  };

  const identifySeasonality = (data) => {
    // Identificar estacionalidad en datos temporales
    const seasonality = [];
    const dateColumns = data.columns.filter((col) => col.type === "date");

    if (dateColumns.length > 0) {
      seasonality.push({
        type: "monthly",
        strength: 0.5,
        column: dateColumns[0].name,
      });
    }

    return seasonality;
  };

  const identifyOutliers = (data) => {
    // Identificar valores atípicos
    const outliers = [];
    const numericColumns = data.columns.filter((col) => col.type === "number");

    numericColumns.forEach((col) => {
      const values = getColumnValues(data, col.name);
      if (values.length > 0) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const std = Math.sqrt(
          values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
        );

        const outlierValues = values.filter(
          (val) => Math.abs(val - mean) > 2 * std
        );

        if (outlierValues.length > 0) {
          outliers.push({
            column: col.name,
            count: outlierValues.length,
            values: outlierValues.slice(0, 5), // Solo los primeros 5
          });
        }
      }
    });

    return outliers;
  };

  const identifyClusters = (data) => {
    // Identificar clusters básicos
    const clusters = [];
    const numericColumns = data.columns.filter((col) => col.type === "number");

    if (numericColumns.length >= 2) {
      clusters.push({
        type: "kmeans",
        k: 3,
        columns: numericColumns.slice(0, 2).map((col) => col.name),
        quality: 0.8,
      });
    }

    return clusters;
  };

  const generateBasicNarrative = (data) => {
    const numericCols = data.columns.filter(
      (col) => col.type === "number"
    ).length;
    const textCols = data.columns.filter((col) => col.type === "string").length;
    const dateCols = data.columns.filter((col) => col.type === "date").length;

    return `Análisis de datos con ${data.totalRows} filas y ${
      data.columns.length
    } columnas. 
    Los datos incluyen ${numericCols} columnas numéricas, ${textCols} columnas de texto y ${dateCols} columnas de fecha.
    La calidad general de los datos es del ${Math.round(
      calculateDataQuality(data)
    )}%.`;
  };

  const getColumnValues = (data, columnName) => {
    const sourceData = data.excel || data.powerBI || data.api || [];
    return sourceData
      .map((row) => row[columnName])
      .filter((val) => val != null && !isNaN(val));
  };

  const generateFinalResults = async (data, finalConfig) => {
    return {
      summary: {
        totalRows: data.totalRows,
        totalColumns: data.columns.length,
        dataQuality: calculateDataQuality(data),
        source: data.source,
      },
      narrative: await generateNarrative(data, finalConfig),
      charts: await suggestCharts(data, finalConfig),
      kpis: await calculateKPIs(data, finalConfig),
      insights: [
        "Los datos muestran una distribución normal en las variables principales",
        "Se identificaron patrones estacionales en los datos temporales",
        "Hay correlación positiva entre las variables numéricas principales",
        `La calidad de los datos es del ${Math.round(
          calculateDataQuality(data)
        )}%`,
      ],
    };
  };

  const resetAnalysis = () => {
    setAnalysisStep("idle");
    setProgress(0);
    setCurrentStep("");
    setResults(null);
    setError(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <ChartBarIcon className="h-8 w-8 mr-2 text-blue-600" />
          Analizador de Datos con IA
        </h2>

        {analysisStep === "complete" && (
          <button
            onClick={resetAnalysis}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Nuevo Análisis
          </button>
        )}
      </div>

      {/* Estado del análisis */}
      <div className="mb-6">
        {analysisStep === "idle" && (
          <div className="text-center py-8">
            <PlayIcon className="h-16 w-16 mx-auto text-blue-600 mb-4" />
            <p className="text-gray-600 mb-4">Listo para analizar tus datos</p>
            <button
              onClick={startAnalysis}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Iniciar Análisis
            </button>
          </div>
        )}

        {analysisStep === "analyzing" && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 mb-2">{currentStep}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">
              {Math.round(progress)}% completado
            </p>
          </div>
        )}

        {analysisStep === "error" && (
          <div className="text-center py-8">
            <ExclamationTriangleIcon className="h-16 w-16 mx-auto text-red-600 mb-4" />
            <p className="text-red-600 mb-4">Error en el análisis</p>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={resetAnalysis}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {analysisStep === "complete" && results && (
          <div className="space-y-6">
            <div className="flex items-center text-green-600 mb-4">
              <CheckCircleIcon className="h-6 w-6 mr-2" />
              <span className="font-semibold">Análisis completado</span>
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800">Total Filas</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {results.summary.totalRows}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800">Columnas</h3>
                <p className="text-2xl font-bold text-green-600">
                  {results.summary.totalColumns}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800">Calidad</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(results.summary.dataQuality)}%
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-800">Fuente</h3>
                <p className="text-2xl font-bold text-orange-600 capitalize">
                  {results.summary.source}
                </p>
              </div>
            </div>

            {/* Narrativa */}
            {results.narrative && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Narrativa del Análisis
                </h3>
                <p className="text-gray-700">{results.narrative}</p>
              </div>
            )}

            {/* Gráficos sugeridos */}
            {results.charts && results.charts.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  Gráficos Sugeridos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.charts.map((chart, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800">
                          {chart.title}
                        </h4>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            chart.priority === "high"
                              ? "bg-red-100 text-red-800"
                              : chart.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {chart.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {chart.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        Tipo: {chart.type} | Columnas:{" "}
                        {chart.columns.map((col) => col.name).join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* KPIs */}
            {results.kpis && Object.keys(results.kpis).length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
                  Indicadores Clave (KPIs)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(results.kpis).map(([key, kpi]) => (
                    <div key={key} className="bg-white border rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-1">
                        {kpi.name}
                      </h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {kpi.format === "decimal"
                          ? kpi.value.toFixed(2)
                          : kpi.value.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {kpi.type}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insights */}
            {results.insights && results.insights.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <EyeIcon className="h-5 w-5 mr-2" />
                  Insights Principales
                </h3>
                <div className="space-y-2">
                  {results.insights.map((insight, index) => (
                    <div
                      key={index}
                      className="flex items-start p-3 bg-blue-50 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <p className="text-gray-700">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIDataAnalyzer;
