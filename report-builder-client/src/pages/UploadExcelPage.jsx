import { useState } from "react";
import { ExcelUploadService } from "../services/ExcelUploadService";
import SuccessToast from "../components/SuccessToast";

const UploadExcelPage = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setErrorMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage("Por favor selecciona un archivo primero.");
      return;
    }

    setUploading(true);
    setErrorMessage("");

    try {
      await ExcelUploadService.uploadExcel(file);
      setShowToast(true);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-blue-800 mb-6 text-center">
          Subir archivo Excel
        </h1>

        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          className="mb-4 block w-full text-sm text-gray-600
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-100 file:text-blue-700
                     hover:file:bg-blue-200"
        />

        {errorMessage && (
          <p className="text-red-600 text-sm mb-4">{errorMessage}</p>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
        >
          {uploading ? "Subiendo..." : "Subir Archivo"}
        </button>
      </div>

      {/* TOAST DE ÉXITO */}
      <SuccessToast
        message="Archivo subido exitosamente ✅"
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default UploadExcelPage;
