import React from "react";
import {
  SparklesIcon,
  DocumentTextIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import { isFeatureEnabled } from "../../utils/featureFlags";

const AIConfigPanel = ({
  config,
  onConfigChange,
  hasData,
  showAdvanced = false,
}) => {
  // Asegurar que config tenga valores por defecto para evitar problemas de componentes controlados
  const safeConfig = {
    analysisType: config?.analysisType || "comprehensive",
    language: config?.language || "es",
    tone: config?.tone || "professional",
    includeNarrative: config?.includeNarrative ?? true,
    includeCharts: config?.includeCharts ?? false,
    includeKPIs: config?.includeKPIs ?? false,
    includeTrends: config?.includeTrends ?? false,
    includePatterns: config?.includePatterns ?? false,
    includeRecommendations: config?.includeRecommendations ?? false,
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    // Crear el nuevo objeto de configuración
    const newConfig = {
      ...safeConfig,
      [name]: newValue,
    };

    console.log("🔍 AIConfigPanel - Actualizando configuración:", {
      name,
      newValue,
      newConfig,
    });

    onConfigChange(newConfig);
  };

  return (
    <div className="space-y-4">
      {/* Header principal */}
      <div className="flex items-center gap-2 mb-3">
        <SparklesIcon className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">
          Configuración de Narrativa AI
        </h3>
      </div>

      {/* Configuración principal */}
      <div className="space-y-4">
        {/* Tipo de narrativa */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Tipo de narrativa
          </label>
          <select
            name="analysisType"
            value={safeConfig.analysisType}
            onChange={handleChange}
            className="w-full p-2 border rounded text-sm"
          >
            <option value="comprehensive">Análisis Completo</option>
            <option value="executive">Resumen Ejecutivo</option>
            <option value="detailed">Análisis Detallado</option>
            <option value="insights">Solo Insights</option>
          </select>
        </div>

        {/* Idioma y Tono */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Idioma</label>
            <select
              name="language"
              value={safeConfig.language}
              onChange={handleChange}
              className="w-full p-2 border rounded text-sm"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tono</label>
            <select
              name="tone"
              value={safeConfig.tone}
              onChange={handleChange}
              className="w-full p-2 border rounded text-sm"
            >
              <option value="professional">Profesional</option>
              <option value="casual">Casual</option>
              <option value="technical">Técnico</option>
              <option value="executive">Ejecutivo</option>
            </select>
          </div>
        </div>

        {/* Checkbox principal */}
        <div>
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              name="includeNarrative"
              checked={safeConfig.includeNarrative}
              onChange={handleChange}
              className="mr-2"
            />
            <DocumentTextIcon className="h-4 w-4 mr-1" />
            Generar narrativa
          </label>
        </div>
      </div>

      {/* Configuración avanzada */}
      {showAdvanced && (
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-3">
            <CogIcon className="h-4 w-4 text-gray-600" />
            <h4 className="font-medium text-gray-900">
              Configuración Avanzada
            </h4>
          </div>

          <div className="space-y-3">
            {/* Funcionalidades adicionales */}
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  name="includeCharts"
                  checked={safeConfig.includeCharts}
                  onChange={handleChange}
                  disabled={!isFeatureEnabled("CHARTS")}
                  className="mr-2"
                />
                Gráficos
              </label>

              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  name="includeKPIs"
                  checked={safeConfig.includeKPIs}
                  onChange={handleChange}
                  disabled={!isFeatureEnabled("KPIS")}
                  className="mr-2"
                />
                KPIs
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  name="includeTrends"
                  checked={safeConfig.includeTrends}
                  onChange={handleChange}
                  disabled={!isFeatureEnabled("TRENDS")}
                  className="mr-2"
                />
                Tendencias
              </label>

              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  name="includePatterns"
                  checked={safeConfig.includePatterns}
                  onChange={handleChange}
                  disabled={!isFeatureEnabled("PATTERNS")}
                  className="mr-2"
                />
                Patrones
              </label>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  name="includeRecommendations"
                  checked={safeConfig.includeRecommendations}
                  onChange={handleChange}
                  disabled={!isFeatureEnabled("RECOMMENDATIONS")}
                  className="mr-2"
                />
                Recomendaciones
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Información de feature flags en desarrollo */}
      {import.meta.env.DEV && (
        <div className="border-t pt-3">
          <details className="text-xs">
            <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
              🔧 Feature Flags (Solo desarrollo)
            </summary>
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <strong>NARRATIVE:</strong>{" "}
                  {isFeatureEnabled("NARRATIVE") ? "✅" : "❌"}
                </div>
                <div>
                  <strong>CHARTS:</strong>{" "}
                  {isFeatureEnabled("CHARTS") ? "✅" : "❌"}
                </div>
                <div>
                  <strong>KPIS:</strong>{" "}
                  {isFeatureEnabled("KPIS") ? "✅" : "❌"}
                </div>
                <div>
                  <strong>TRENDS:</strong>{" "}
                  {isFeatureEnabled("TRENDS") ? "✅" : "❌"}
                </div>
                <div>
                  <strong>PATTERNS:</strong>{" "}
                  {isFeatureEnabled("PATTERNS") ? "✅" : "❌"}
                </div>
                <div>
                  <strong>RECOMMENDATIONS:</strong>{" "}
                  {isFeatureEnabled("RECOMMENDATIONS") ? "✅" : "❌"}
                </div>
              </div>
            </div>
          </details>
        </div>
      )}

      {/* Mensaje de estado */}
      {!hasData && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-700">
            Carga datos (Excel, PowerBI, API) para habilitar la generación de
            narrativa AI
          </p>
        </div>
      )}
    </div>
  );
};

export default AIConfigPanel;
