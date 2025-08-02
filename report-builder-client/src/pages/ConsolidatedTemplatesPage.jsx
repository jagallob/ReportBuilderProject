import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ConsolidatedTemplateService } from "../services/ConsolidatedTemplateService";
import HeaderActions from "../layouts/HeaderActions";

const ConsolidatedTemplatesPage = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await ConsolidatedTemplateService.getConsolidatedTemplates();
      setTemplates(data);
    } catch (err) {
      console.error("Error cargando plantillas:", err);
      setError("Error al cargar las plantillas consolidadas");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    navigate("/admin/pdf-analysis");
  };

  const handleViewDetails = async (templateId) => {
    try {
      const template =
        await ConsolidatedTemplateService.getConsolidatedTemplate(templateId);
      setSelectedTemplate(template);
      setShowDetailsModal(true);
    } catch (err) {
      console.error("Error obteniendo detalles:", err);
      setError("Error al obtener los detalles de la plantilla");
    }
  };

  const handleViewStatus = (templateId) => {
    handleViewDetails(templateId);
  };

  const handleDeleteTemplate = async (templateId) => {
    if (
      !window.confirm(
        "¿Estás seguro de que quieres eliminar esta plantilla consolidada?"
      )
    ) {
      return;
    }

    try {
      await ConsolidatedTemplateService.deleteConsolidatedTemplate(templateId);
      await loadTemplates();
    } catch (err) {
      console.error("Error eliminando plantilla:", err);
      setError("Error al eliminar la plantilla");
    }
  };

  const handleBack = () => {
    navigate("/admin");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">
                Cargando plantillas consolidadas...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="pb-6">
          <HeaderActions
            onViewReports={() => navigate("/dashboard/reports")}
            onCancel={handleBack}
          />
        </div>

        <div className="bg-white p-8 rounded-xl shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-blue-800 mb-2">
                Plantillas Consolidadas
              </h1>
              <p className="text-gray-600">
                Gestiona las plantillas consolidadas para informes multi-área
              </p>
            </div>
            <button
              onClick={handleCreateTemplate}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2"
            >
              <span>➕</span>
              Crear Nueva Plantilla
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {templates.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No hay plantillas consolidadas
              </h3>
              <p className="text-gray-600 mb-6">
                Crea tu primera plantilla consolidada para comenzar a trabajar
                con informes multi-área
              </p>
              <button
                onClick={handleCreateTemplate}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg"
              >
                Crear Primera Plantilla
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {template.name}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>📅 {template.period}</span>
                        <span>👤 {template.createdByUserName}</span>
                        <span>
                          📅 {new Date(template.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${ConsolidatedTemplateService.getStatusColor(
                          template.status
                        )}`}
                      >
                        {ConsolidatedTemplateService.getStatusText(
                          template.status
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Progreso: {template.completedSectionsCount}/
                        {template.sectionsCount} secciones
                      </span>
                      <span className="text-sm text-gray-500">
                        {Math.round(template.completionPercentage)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${ConsolidatedTemplateService.getProgressColor(
                          template.completionPercentage
                        )}`}
                        style={{ width: `${template.completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleViewDetails(template.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm"
                    >
                      📋 Ver Detalles
                    </button>
                    <button
                      onClick={() => handleViewStatus(template.id)}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg text-sm"
                    >
                      📊 Ver Estado
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg text-sm"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalles */}
      {showDetailsModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Detalles de la Plantilla
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {selectedTemplate.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {selectedTemplate.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Período:
                    </span>
                    <p className="text-gray-900">{selectedTemplate.period}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Estado:
                    </span>
                    <p className="text-gray-900">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${ConsolidatedTemplateService.getStatusColor(
                          selectedTemplate.status
                        )}`}
                      >
                        {ConsolidatedTemplateService.getStatusText(
                          selectedTemplate.status
                        )}
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Creado por:
                    </span>
                    <p className="text-gray-900">
                      {selectedTemplate.createdByUserName}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Fecha límite:
                    </span>
                    <p className="text-gray-900">
                      {selectedTemplate.deadline
                        ? new Date(
                            selectedTemplate.deadline
                          ).toLocaleDateString()
                        : "No definida"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Secciones
                </h4>
                <div className="space-y-3">
                  {selectedTemplate.sections.map((section) => (
                    <div
                      key={section.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-900">
                            {section.sectionTitle}
                          </h5>
                          <p className="text-sm text-gray-600">
                            {section.sectionDescription}
                          </p>
                          <p className="text-sm text-gray-500">
                            Área: {section.areaName}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${ConsolidatedTemplateService.getStatusColor(
                            section.status
                          )}`}
                        >
                          {ConsolidatedTemplateService.getStatusText(
                            section.status
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsolidatedTemplatesPage;
