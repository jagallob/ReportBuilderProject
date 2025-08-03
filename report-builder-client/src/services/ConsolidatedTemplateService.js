import { API_URL } from "../environments/api.config";
import { JSON_HEADERS } from "../environments/http-headers";

export const ConsolidatedTemplateService = {
  // Obtener todas las plantillas consolidadas
  getConsolidatedTemplates: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/ConsolidatedTemplates`, {
        method: "GET",
        headers: {
          ...JSON_HEADERS,
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `Error ${response.status}: ${response.statusText}`,
        }));
        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error al obtener plantillas consolidadas:", error);
      throw error;
    }
  },

  // Obtener una plantilla consolidada específica
  getConsolidatedTemplate: async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/ConsolidatedTemplates/${id}`,
        {
          method: "GET",
          headers: {
            ...JSON_HEADERS,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `Error ${response.status}: ${response.statusText}`,
        }));
        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`Error al obtener plantilla consolidada ${id}:`, error);
      throw error;
    }
  },

  // Crear una nueva plantilla consolidada desde informes anteriores
  createFromReports: async (templateData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/ConsolidatedTemplates/from-reports`,
        {
          method: "POST",
          headers: {
            ...JSON_HEADERS,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(templateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `Error ${response.status}: ${response.statusText}`,
        }));
        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error al crear plantilla consolidada:", error);
      throw error;
    }
  },

  // Actualizar una plantilla consolidada
  updateConsolidatedTemplate: async (id, updateData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/ConsolidatedTemplates/${id}`,
        {
          method: "PUT",
          headers: {
            ...JSON_HEADERS,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `Error ${response.status}: ${response.statusText}`,
        }));
        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        );
      }

      return true;
    } catch (error) {
      console.error(`Error al actualizar plantilla consolidada ${id}:`, error);
      throw error;
    }
  },

  // Asignar una sección a un área
  assignSection: async (templateId, sectionId, assignData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/ConsolidatedTemplates/${templateId}/sections/${sectionId}/assign`,
        {
          method: "POST",
          headers: {
            ...JSON_HEADERS,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(assignData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `Error ${response.status}: ${response.statusText}`,
        }));
        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        );
      }

      return true;
    } catch (error) {
      console.error(
        `Error al asignar sección ${sectionId} de plantilla ${templateId}:`,
        error
      );
      throw error;
    }
  },

  // Actualizar el estado de una sección
  updateSectionStatus: async (templateId, sectionId, statusData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/ConsolidatedTemplates/${templateId}/sections/${sectionId}/status`,
        {
          method: "PUT",
          headers: {
            ...JSON_HEADERS,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(statusData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `Error ${response.status}: ${response.statusText}`,
        }));
        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        );
      }

      return true;
    } catch (error) {
      console.error(
        `Error al actualizar estado de sección ${sectionId} de plantilla ${templateId}:`,
        error
      );
      throw error;
    }
  },

  // Obtener el estado detallado de una plantilla consolidada
  getTemplateStatus: async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/ConsolidatedTemplates/${id}/status`,
        {
          method: "GET",
          headers: {
            ...JSON_HEADERS,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `Error ${response.status}: ${response.statusText}`,
        }));
        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(
        `Error al obtener estado de plantilla consolidada ${id}:`,
        error
      );
      throw error;
    }
  },

  // Eliminar una plantilla consolidada
  deleteConsolidatedTemplate: async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/ConsolidatedTemplates/${id}`,
        {
          method: "DELETE",
          headers: {
            ...JSON_HEADERS,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `Error ${response.status}: ${response.statusText}`,
        }));
        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        );
      }

      return true;
    } catch (error) {
      console.error(`Error al eliminar plantilla consolidada ${id}:`, error);
      throw error;
    }
  },

  // Utilidades para el manejo de estados
  getStatusColor: (status) => {
    const statusColors = {
      draft: "bg-gray-100 text-gray-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      archived: "bg-purple-100 text-purple-800",
      pending: "bg-yellow-100 text-yellow-800",
      assigned: "bg-indigo-100 text-indigo-800",
      reviewed: "bg-emerald-100 text-emerald-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  },

  getStatusText: (status) => {
    const statusTexts = {
      draft: "Borrador",
      in_progress: "En Progreso",
      completed: "Completado",
      archived: "Archivado",
      pending: "Pendiente",
      assigned: "Asignado",
      reviewed: "Revisado",
    };
    return statusTexts[status] || status;
  },

  getProgressColor: (percentage) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    if (percentage >= 40) return "bg-orange-500";
    return "bg-red-500";
  },
};

export default ConsolidatedTemplateService;
