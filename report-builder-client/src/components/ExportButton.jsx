import React, { useState } from "react";
import { toast } from "react-toastify";
import { exportToPDF, exportToWord } from "../../utils/exportUtils";

const ExportButton = ({ template }) => {
  const [isExporting, setIsExporting] = useState(null);

  const handleExport = async (type) => {
    setIsExporting(type);
    try {
      if (type === "pdf") await exportToPDF("report-preview");
      else if (type === "word") await exportToWord(template);
      toast.success(`Exportado a ${type.toUpperCase()} con éxito`);
    } catch (error) {
      toast.error(`Error al exportar: ${error.message}`);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <button
        onClick={() => handleExport("pdf")}
        disabled={isExporting}
        className={`px-4 py-2 rounded-md flex items-center justify-center ${
          isExporting === "pdf"
            ? "bg-gray-400 cursor-wait"
            : "bg-red-600 hover:bg-red-700 text-white"
        }`}
      >
        {isExporting === "pdf" ? (
          <>
            <Spinner className="mr-2" />
            Generando PDF...
          </>
        ) : (
          <>
            <PdfIcon className="mr-2" />
            Exportar a PDF
          </>
        )}
      </button>

      {/* <button
        onClick={() => handleExport("word")}
        disabled={isExporting}
        className={`px-4 py-2 rounded-md flex items-center justify-center ${
          isExporting === "word"
            ? "bg-gray-400 cursor-wait"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {isExporting === "word" ? (
          <>
            <Spinner className="mr-2" />
            Generando Word...
          </>
        ) : (
          <>
            <WordIcon className="mr-2" />
            Exportar a Word
          </>
        )}
      </button> */}
    </div>
  );
};

// Componentes auxiliares (pueden moverse a archivos separados)
const Spinner = () => (
  <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent" />
);
const PdfIcon = () => <span>📄</span>;
const WordIcon = () => <span>📝</span>;

export default ExportButton;
