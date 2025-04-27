import React from "react";

const TemplateMetadataForm = ({ template, updateTemplate }) => {
  return (
    <div className="mt-6">
      <h2 className="font-semibold text-lg mb-2">Configuración General</h2>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Plantilla
          </label>
          <select
            value={template.metadata.templateType}
            onChange={(e) =>
              updateTemplate("metadata.templateType", e.target.value)
            }
            className="w-full p-2 border rounded text-sm"
          >
            <option value="generic">Genérica</option>
            <option value="technical">Técnica</option>
            <option value="financial">Financiera</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            value={template.metadata.description}
            onChange={(e) =>
              updateTemplate("metadata.description", e.target.value)
            }
            className="w-full p-2 border rounded text-sm"
            rows={3}
            placeholder="Descripción de la plantilla..."
          />
        </div>
      </div>
    </div>
  );
};

export default TemplateMetadataForm;
