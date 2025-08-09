import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ConsolidatedTemplateService } from "../services/ConsolidatedTemplateService";
import HeaderActions from "../layouts/HeaderActions";
import { useAuth } from "../context/AuthContext";

const MyTasksPage = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const assignedSections =
          await ConsolidatedTemplateService.getMyAssignedSections();
        setTasks(assignedSections);
      } catch (err) {
        setError("Error al cargar las tareas asignadas.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleCompleteSection = (templateId, sectionId) => {
    navigate(`/dashboard/template/${templateId}/section/${sectionId}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) return <div className="text-center p-8">Cargando tareas...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <HeaderActions
        onCancel={handleLogout}
        onGoHome={() => navigate("/dashboard")}
      />
      <div className="max-w-5xl mx-auto mt-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Mis Tareas Pendientes
        </h1>
        <p className="text-gray-600 mb-6">
          Hola {user?.name}, estas son las secciones de informes asignadas a tu
          área.
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {tasks.length === 0 && !loading ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-800">
              ¡Todo al día!
            </h3>
            <p className="text-gray-600 mt-2">
              No tienes secciones de informes pendientes por completar.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.Id}
                className="bg-white p-4 rounded-lg shadow border flex justify-between items-center transition hover:shadow-md"
              >
                <div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${ConsolidatedTemplateService.getStatusColor(
                      task.Status
                    )}`}
                  >
                    {ConsolidatedTemplateService.getStatusText(task.Status)}
                  </span>
                  <h2 className="text-lg font-semibold mt-1">
                    {task.SectionTitle}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Del informe:{" "}
                    <strong>{task.ConsolidatedTemplateName}</strong> (
                    {task.Period})
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Fecha Límite:{" "}
                    {task.SectionDeadline
                      ? new Date(task.SectionDeadline).toLocaleDateString()
                      : "No definida"}
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleCompleteSection(task.ConsolidatedTemplateId, task.Id)
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
                >
                  {task.Status === "pending" ? "Empezar" : "Continuar"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTasksPage;
