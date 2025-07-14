import React from "react";
import {
  SparklesIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  EyeIcon, // Añadimos el import faltante
} from "@heroicons/react/24/outline";

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
          Configuración de Análisis AI
        </h3>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              Tipo de análisis
            </label>
            <select
              name="analysisType"
              value={config.analysisType}
              onChange={handleChange}
              className="w-full p-2 border rounded text-sm"
            >
              <option value="comprehensive">Completo</option>
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
              value={config.language}
              onChange={handleChange}
              className="w-full p-2 border rounded text-sm"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              name="includeNarrative"
              checked={config.includeNarrative}
              onChange={handleChange}
              className="mr-2"
            />
            <DocumentTextIcon className="h-4 w-4 mr-1" />
            Narrativa
          </label>

          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              name="includeCharts"
              checked={config.includeCharts}
              onChange={handleChange}
              className="mr-2"
            />
            <ChartBarIcon className="h-4 w-4 mr-1" />
            Gráficos
          </label>

          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              name="includeKPIs"
              checked={config.includeKPIs}
              onChange={handleChange}
              className="mr-2"
            />
            <EyeIcon className="h-4 w-4 mr-1" />
            KPIs
          </label>

          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              name="includeTrends"
              checked={config.includeTrends}
              onChange={handleChange}
              className="mr-2"
            />
            <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
            Tendencias
          </label>
        </div>
      </div>

      {!hasData && (
        <p className="text-sm text-amber-600 mt-3 bg-amber-50 p-2 rounded">
          ⚠️ Carga datos (Excel, PowerBI, API) para habilitar el análisis AI
        </p>
      )}
    </div>
  );
};

export default AIConfigPanel;
