import React from "react";
import { SparklesIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { isFeatureEnabled } from "../../utils/featureFlags";

const AIConfigPanel = ({ config, onConfigChange, hasData }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    onConfigChange((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <div className="flex items-center gap-2 mb-3">
        <SparklesIcon className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">
          Configuración de Narrativa AI
        </h3>
      </div>

      <div className="space-y-4">
        {/* Configuración principal */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              Tipo de narrativa
            </label>
            <select
              name="analysisType"
              value={config.analysisType}
              onChange={handleChange}
              className="w-full p-2 border rounded text-sm"
            >
              <option value="comprehensive">Análisis Completo</option>
              <option value="executive">Resumen Ejecutivo</option>
              <option value="detailed">Análisis Detallado</option>
              <option value="insights">Solo Insights</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Idioma</label>
            <select
              name="language"
              value={config.language}
              onChange={handleChange}
              className="w-full p-2 border rounded text-sm"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {/* Configuración de tono */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Tono</label>
            <select
              name="tone"
              value={config.tone}
              onChange={handleChange}
              className="w-full p-2 border rounded text-sm"
            >
              <option value="professional">Profesional</option>
              <option value="casual">Casual</option>
              <option value="technical">Técnico</option>
              <option value="executive">Ejecutivo</option>
            </select>
          </div>

          <div>
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                name="includeNarrative"
                checked={config.includeNarrative}
                onChange={handleChange}
                className="mr-2"
              />
              <DocumentTextIcon className="h-4 w-4 mr-1" />
              Generar narrativa
            </label>
          </div>
        </div>

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
      </div>

      {!hasData && (
        <p className="text-sm text-amber-600 mt-3 bg-amber-50 p-2 rounded">
          ⚠️ Carga datos (Excel, PowerBI, API) para habilitar la generación de
          narrativa AI
        </p>
      )}
    </div>
  );
};

export default AIConfigPanel;
