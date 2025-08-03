import { API_URL } from "../environments/api.config";

const AreaAssignmentService = {
  /**
   * Obtiene las áreas disponibles del sistema
   */
  getAvailableAreas: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No se encontró token de autenticación");
      }

      const response = await fetch(`${API_URL}/api/Areas`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error obteniendo áreas:", error);
      throw error;
    }
  },

  /**
   * Asigna áreas automáticamente usando IA
   */
  autoAssignAreas: async (sections) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No se encontró token de autenticación");
      }

      const response = await fetch(
        `${API_URL}/api/ConsolidatedTemplates/suggest-area-assignments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sections }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Convertir el resultado al formato esperado por el componente
      const assignments = {};
      result.forEach((assignment) => {
        assignments[assignment.sectionId] = {
          areaId: assignment.areaId,
          areaName: assignment.areaName,
          confidence: assignment.confidence,
          isAutoAssigned: true,
          reasoning: assignment.reasoning,
        };
      });

      return assignments;
    } catch (error) {
      console.error("Error en asignación automática:", error);
      throw error;
    }
  },

  /**
   * Guarda las asignaciones de áreas
   */
  saveAreaAssignments: async (templateId, assignments) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No se encontró token de autenticación");
      }

      const response = await fetch(
        `${API_URL}/api/ConsolidatedTemplates/${templateId}/assign-areas`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ assignments }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error guardando asignaciones:", error);
      throw error;
    }
  },

  /**
   * Obtiene las asignaciones existentes de un template
   */
  getAreaAssignments: async (templateId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No se encontró token de autenticación");
      }

      const response = await fetch(
        `${API_URL}/api/ConsolidatedTemplates/${templateId}/area-assignments`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error obteniendo asignaciones:", error);
      throw error;
    }
  },

  /**
   * Valida que todas las secciones tengan áreas asignadas
   */
  validateAssignments: (assignments, sections) => {
    const unassignedSections = sections.filter(
      (section) => !assignments[section.id]?.areaId
    );

    return {
      isValid: unassignedSections.length === 0,
      unassignedSections,
      assignedCount: Object.values(assignments).filter((a) => a.areaId).length,
      totalCount: sections.length,
    };
  },

  /**
   * Sugiere áreas basadas en palabras clave
   */
  suggestAreasByKeywords: (keywords, availableAreas) => {
    const suggestions = [];

    // Mapeo de palabras clave a áreas
    const keywordToArea = {
      financiero: "Finanzas",
      finanzas: "Finanzas",
      contabilidad: "Finanzas",
      presupuesto: "Finanzas",
      ventas: "Finanzas",
      ingresos: "Finanzas",
      gastos: "Finanzas",

      "recursos humanos": "Recursos Humanos",
      personal: "Recursos Humanos",
      empleados: "Recursos Humanos",
      trabajadores: "Recursos Humanos",
      capacitación: "Recursos Humanos",
      salarios: "Recursos Humanos",

      operaciones: "Operaciones",
      producción: "Operaciones",
      manufactura: "Operaciones",
      logística: "Operaciones",
      inventario: "Operaciones",
      calidad: "Operaciones",

      marketing: "Marketing",
      publicidad: "Marketing",
      promoción: "Marketing",
      mercado: "Marketing",
      clientes: "Marketing",
      ventas: "Marketing",

      tecnología: "Tecnología",
      sistemas: "Tecnología",
      software: "Tecnología",
      digital: "Tecnología",
      automatización: "Tecnología",
      innovación: "Tecnología",
    };

    keywords.forEach((keyword) => {
      const lowerKeyword = keyword.toLowerCase();
      for (const [key, areaName] of Object.entries(keywordToArea)) {
        if (lowerKeyword.includes(key)) {
          const area = availableAreas.find((a) => a.name === areaName);
          if (area && !suggestions.find((s) => s.areaId === area.id)) {
            suggestions.push({
              areaId: area.id,
              areaName: area.name,
              confidence: 0.8,
              reason: `Palabra clave: "${keyword}"`,
            });
          }
        }
      }
    });

    return suggestions;
  },
};

export default AreaAssignmentService;
