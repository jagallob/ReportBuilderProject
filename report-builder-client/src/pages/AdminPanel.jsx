import HeaderActions from "../layouts/HeaderActions";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ConsolidatedTemplateService } from "../services/ConsolidatedTemplateService";

const AdminPanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadConsolidatedTemplates();
  }, []);

  const loadConsolidatedTemplates = async () => {
    try {
      setLoading(true);
      const data = await ConsolidatedTemplateService.getConsolidatedTemplates();
      setTemplates(data);
    } catch (err) {
      console.error("Error cargando plantillas consolidadas:", err);
      setError("Error al cargar las plantillas consolidadas");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const goToReports = () => {
    navigate("/dashboard/reports");
  };

  const goToConsolidatedTemplates = () => {
    navigate("/admin/consolidated-templates");
  };

  const goToTemplateStatus = () => {
    navigate("/admin/consolidated-templates");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white p-6">
      <div className="pb-6">
        <HeaderActions onViewReports={goToReports} onCancel={handleLogout} />
      </div>
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-xl">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">
          Consola de Administración
        </h1>
        <p className="text-gray-600 mb-6">
          Bienvenido, <strong>{user?.name}</strong>
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg"
            onClick={() => alert("Ver estado de carga de áreas")}
          >
            📊 Estado de carga por área
          </button>

          <button
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg"
            onClick={() => alert("Acceder a informes individuales")}
          >
            📄 Ver informes individuales
          </button>

          <button
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg"
            onClick={goToConsolidatedTemplates}
          >
            🧩 Generar Plantilla Consolidada
          </button>

          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg"
            onClick={() => navigate("/admin/pdf-analysis")}
          >
            📄 Analizar PDF
          </button>

          <button
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg"
            onClick={goToTemplateStatus}
          >
            📋 Estado de Plantillas
          </button>

          <button
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-4 rounded-lg"
            onClick={() => alert("Consolidar informes del mes")}
          >
            🔄 Consolidar Informes
          </button>

          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg"
            onClick={() => alert("Descargar PDF / Word")}
          >
            📥 Descargar Informe Final
          </button>
        </div>

        {/* Resumen de plantillas consolidadas */}
        {!loading && templates.length > 0 && (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              📋 Resumen de Plantillas Consolidadas
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.slice(0, 3).map((template) => (
                <div
                  key={template.id}
                  className="bg-white p-4 rounded-lg shadow-sm border"
                >
                  <h4 className="font-medium text-gray-900 truncate">
                    {template.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {template.period}
                  </p>
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${ConsolidatedTemplateService.getStatusColor(
                        template.status
                      )}`}
                    >
                      {ConsolidatedTemplateService.getStatusText(
                        template.status
                      )}
                    </span>
                    <span className="text-sm text-gray-500">
                      {template.completedSectionsCount}/{template.sectionsCount}{" "}
                      secciones
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${ConsolidatedTemplateService.getProgressColor(
                          template.completionPercentage
                        )}`}
                        style={{ width: `${template.completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {templates.length > 3 && (
              <div className="mt-4 text-center">
                <button
                  onClick={goToConsolidatedTemplates}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Ver todas las plantillas ({templates.length})
                </button>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
