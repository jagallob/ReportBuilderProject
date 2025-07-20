import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import _ from "lodash";
import { analyzeData } from "../../services/analysisService";
import { generateNarrativeFromAnalysis } from "../../services/narrativeService";
import { isFeatureEnabled } from "../../utils/featureFlags";

const DataAnalysisPanel = ({ data, config, onAnalysisComplete }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (data && data.length > 0) {
      performAnalysis();
    }
  }, [data, config]);

  const performAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      // Preparar datos para el análisis
      const analysisData = prepareDataForAnalysis(data);

      // Usar los servicios originales que sabemos que funcionan
      const analysisResult = await analyzeData(analysisData, config);

      // Generar narrativa si está habilitado
      if (config?.includeNarrative !== false) {
        try {
          const narrativeResult = await generateNarrativeFromAnalysis(
            analysisResult,
            config,
            data
          );
          setAnalysis({
            ...analysisResult,
            narrative: narrativeResult,
          });
        } catch (narrativeError) {
          console.error("Error generando narrativa:", narrativeError);
          setAnalysis({
            ...analysisResult,
            narrative: {
              title: "Error generando narrativa",
              content: `No se pudo generar la narrativa automáticamente. Error: ${narrativeError.message}`,
              keyPoints: [],
            },
          });
        }
      } else {
        setAnalysis(analysisResult);
      }

      if (onAnalysisComplete) {
        onAnalysisComplete(analysisResult);
      }
    } catch (err) {
      console.error("Error en el análisis:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const prepareDataForAnalysis = (rawData) => {
    // Convertir datos a formato tabular para el análisis
    if (Array.isArray(rawData) && rawData.length > 0) {
      const firstRow = rawData[0];
      if (typeof firstRow === "object") {
        // Si ya es un array de objetos, usarlo directamente
        return rawData.map((row) => Object.values(row));
      }
    }

    // Si es un array simple, convertirlo a formato tabular
    return rawData.map((item, index) => [index, item]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Generando narrativa con IA...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error en el análisis
            </h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-500">No hay datos para analizar</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Narrativa */}
      {analysis.narrative && (
        <div className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">
            📊 Narrativa Automática
          </h2>
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold mb-2">
              {analysis.narrative.title}
            </h3>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
              {analysis.narrative.content}
            </div>
            {analysis.narrative.keyPoints &&
              analysis.narrative.keyPoints.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Puntos Clave:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.narrative.keyPoints.map((point, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Resumen del análisis */}
      {analysis.summary && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Resumen Ejecutivo</h3>
          <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
        </div>
      )}

      {/* Métricas clave */}
      {analysis.keyMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(analysis.keyMetrics).map(([key, value]) => (
            <div
              key={key}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg"
            >
              <h3 className="text-sm font-medium opacity-90">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </h3>
              <p className="text-2xl font-bold">
                {typeof value === "number"
                  ? value.toLocaleString("es-ES")
                  : value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Insights */}
      {analysis.insights && analysis.insights.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Insights Detectados</h3>
          <div className="space-y-4">
            {analysis.insights.map((insight, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-800">{insight.title}</h4>
                <p className="text-gray-600 mt-1">{insight.description}</p>
                <div className="flex items-center mt-2 space-x-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      insight.severity === "critical"
                        ? "bg-red-100 text-red-800"
                        : insight.severity === "warning"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {insight.severity}
                  </span>
                  <span className="text-gray-500">
                    Confianza: {(insight.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Recomendaciones</h3>
          <ul className="space-y-2">
            {analysis.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span className="text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Información de feature flags en desarrollo */}
      {import.meta.env.DEV && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-2 text-yellow-800">
            🔧 Feature Flags (Solo desarrollo)
          </h3>
          <div className="text-xs text-yellow-700 space-y-1">
            <div>NARRATIVE: {isFeatureEnabled("NARRATIVE") ? "✅" : "❌"}</div>
            <div>CHARTS: {isFeatureEnabled("CHARTS") ? "✅" : "❌"}</div>
            <div>KPIS: {isFeatureEnabled("KPIS") ? "✅" : "❌"}</div>
            <div>TRENDS: {isFeatureEnabled("TRENDS") ? "✅" : "❌"}</div>
            <div>PATTERNS: {isFeatureEnabled("PATTERNS") ? "✅" : "❌"}</div>
            <div>
              RECOMMENDATIONS:{" "}
              {isFeatureEnabled("RECOMMENDATIONS") ? "✅" : "❌"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataAnalysisPanel;
