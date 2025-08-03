import { API_URL } from "../environments/api.config";
import { JSON_HEADERS } from "../environments/http-headers";

const TEMPLATES_API_URL = `${API_URL}/api/Templates`;

export const TemplateService = {
  getAllTemplates: async () => {
    const response = await fetch(TEMPLATES_API_URL);
    if (!response.ok) {
      throw new Error("Error al obtener plantillas");
    }
    return await response.json();
  },

  getTemplate: async (id) => {
    const response = await fetch(`${TEMPLATES_API_URL}/${id}`);
    if (!response.ok) {
      throw new Error(`Error al obtener plantilla ID ${id}`);
    }
    return await response.json();
  },

  createTemplate: async (template) => {
    const response = await fetch(TEMPLATES_API_URL, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(template),
    });
    if (!response.ok) {
      throw new Error("Error al crear plantilla");
    }
    return await response.json();
  },

  updateTemplate: async (id, template) => {
    const response = await fetch(`${TEMPLATES_API_URL}/${id}`, {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify(template),
    });
    if (!response.ok) {
      throw new Error(`Error al actualizar plantilla ID ${id}`);
    }
    return await response.json();
  },

  deleteTemplate: async (id) => {
    const response = await fetch(`${TEMPLATES_API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Error al eliminar plantilla ID ${id}`);
    }
    return;
  },
};
