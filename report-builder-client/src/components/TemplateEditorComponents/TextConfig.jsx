import React from "react";

const TextConfig = ({ component = {}, onUpdate }) => {
  return (
    <div className="space-y-6">
      {/* Configuración tradicional de texto */}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default TextConfig;
