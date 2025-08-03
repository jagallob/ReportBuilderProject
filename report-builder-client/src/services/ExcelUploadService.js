import { API_URL } from "../environments/api.config";

export const ExcelUploadService = {
  uploadExcel: async (file, areaId, period) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("areaId", areaId);
    formData.append("period", period);

    try {
      const response = await fetch(`${API_URL}/api/ExcelUploads/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error subiendo Excel:", error);
      throw error;
    }
  },
};

export default ExcelUploadService;
