const API_URL = "http://localhost:5000/api/Templates";

export const TemplateService = {
  getAllTemplates: async () => {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Error al obtener plantillas");
    }
    return await response.json();
  },

  getTemplate: async (id) => {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
      throw new Error(`Error al obtener plantilla ID ${id}`);
    }
    return await response.json();
  },

  createTemplate: async (template) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(template),
    });
    if (!response.ok) {
      throw new Error("Error al crear plantilla");
    }
    return await response.json();
  },

  updateTemplate: async (id, template) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(template),
    });
    if (!response.ok) {
      throw new Error(`Error al actualizar plantilla ID ${id}`);
    }
    return await response.json();
  },

  deleteTemplate: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Error al eliminar plantilla ID ${id}`);
    }
    return;
  },
};
