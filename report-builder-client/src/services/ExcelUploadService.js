const API_URL = "http://localhost:5000";

export const ExcelUploadService = {
  uploadExcel: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/api/ExcelUploads/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        );
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
