import API_BASE_URL from "../environments/api.config";

const API_URL = `${API_BASE_URL}`;

export const PDFAnalysisService = {
  /**
   * Analiza un archivo PDF y sugiere estructura para plantilla consolidada
   */
  analyzePDF: async (
    pdfFile,
    templateName,
    description,
    period,
    deadline,
    analysisConfig = {}
  ) => {
    const formData = new FormData();
    formData.append("PDFFile", pdfFile);
    formData.append("TemplateName", templateName);
    formData.append("Description", description || "");
    formData.append("Period", period);
    if (deadline) {
      formData.append("Deadline", deadline.toISOString());
    }
    formData.append("AnalysisConfig", JSON.stringify(analysisConfig));

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/ConsolidatedTemplates/analyze-pdf`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error analizando PDF:", error);
      throw error;
    }
  },

  /**
   * Crea una plantilla consolidada desde un PDF analizado
   */
  createFromPDF: async (
    pdfFile,
    templateName,
    description,
    period,
    deadline,
    sectionAssignments = [],
    analysisConfig = {}
  ) => {
    const formData = new FormData();
    formData.append("PDFFile", pdfFile);
    formData.append("TemplateName", templateName);
    formData.append("Description", description || "");
    formData.append("Period", period);
    if (deadline) {
      formData.append("Deadline", deadline.toISOString());
    }
    formData.append("SectionAssignments", JSON.stringify(sectionAssignments));
    formData.append("AnalysisConfig", JSON.stringify(analysisConfig));

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/ConsolidatedTemplates/from-pdf`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creando plantilla desde PDF:", error);
      throw error;
    }
  },

  /**
   * Obtiene la configuración por defecto para el análisis de PDF
   */
  getDefaultAnalysisConfig: () => ({
    extractText: true,
    identifySections: true,
    identifyComponents: true,
    suggestAreaAssignments: true,
    generateTemplates: true,
    minConfidence: 0.7,
    language: "es",
  }),

  /**
   * Valida un archivo PDF
   */
  validatePDFFile: (file) => {
    if (!file) {
      throw new Error("No se seleccionó ningún archivo");
    }

    if (file.type !== "application/pdf") {
      throw new Error("El archivo debe ser un PDF");
    }

    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      throw new Error("El archivo es demasiado grande. Máximo 100MB");
    }

    return true;
  },

  /**
   * Formatea el tamaño del archivo
   */
  formatFileSize: (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  /**
   * Obtiene el color para el tipo de componente
   */
  getComponentTypeColor: (type) => {
    const colors = {
      Text: "bg-blue-100 text-blue-800",
      Table: "bg-green-100 text-green-800",
      Chart: "bg-purple-100 text-purple-800",
      Image: "bg-yellow-100 text-yellow-800",
      KPI: "bg-red-100 text-red-800",
      Graph: "bg-indigo-100 text-indigo-800",
      List: "bg-gray-100 text-gray-800",
      Header: "bg-orange-100 text-orange-800",
      Footer: "bg-pink-100 text-pink-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  },

  /**
   * Obtiene el icono para el tipo de componente
   */
  getComponentTypeIcon: (type) => {
    const icons = {
      Text: "📝",
      Table: "📊",
      Chart: "📈",
      Image: "🖼️",
      KPI: "📊",
      Graph: "📉",
      List: "📋",
      Header: "📄",
      Footer: "📄",
    };
    return icons[type] || "📄";
  },

  /**
   * Formatea la confianza como porcentaje
   */
  formatConfidence: (confidence) => {
    return `${Math.round(confidence * 100)}%`;
  },

  /**
   * Obtiene el color para el nivel de confianza
   */
  getConfidenceColor: (confidence) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  },
};

export default PDFAnalysisService;
