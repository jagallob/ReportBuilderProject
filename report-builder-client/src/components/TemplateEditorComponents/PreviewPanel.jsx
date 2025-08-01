import React, { useState } from "react";
import ComponentRenderer from "../Renders/ComponentRenderer";
import { exportToPDF } from "../../utils/exportUtils";
import { toast } from "react-toastify";
import { shouldShowImageOnPage } from "../../utils/pageUtils";

const PreviewPanel = ({ template, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [isExporting, setIsExporting] = useState(null);

  const handleExport = async (type) => {
    setIsExporting(type);
    try {
      if (type === "pdf") await exportToPDF("report-preview");
      // else if (type === "word") await exportToWord(template);
      toast.success(`Exportado a ${type.toUpperCase()} con éxito`);
    } catch (error) {
      toast.error(`Error al exportar: ${error.message}`);
    } finally {
      setIsExporting(null);
    }
  };

  const renderEventsTimeline = (events) => {
    if (!events || events.length === 0) return null;

    return (
      <div className="p-4 border-t border-gray-200 mt-4">
        <h3 className="text-lg font-medium mb-2">Línea de Tiempo</h3>
        <div className="space-y-2">
          {events.map((event, index) => (
            <div key={index} className="flex items-start">
              <div className="flex flex-col items-center mr-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div className="w-px h-full bg-blue-300"></div>
              </div>
              <div className="bg-white p-2 rounded shadow mb-2 flex-1">
                <div className="font-bold">{event.title}</div>
                <div className="text-sm text-gray-500">{event.date}</div>
                <div className="text-sm mt-1">{event.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const Spinner = () => (
    <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent" />
  );

  const PdfIcon = () => <span></span>;
  const WordIcon = () => <span></span>;

  // Función para obtener todas las imágenes de página completa
  const getFullPageImages = () => {
    const images = [];
    template.sections.forEach((section, sectionIndex) => {
      section.components.forEach((component, componentIndex) => {
        if (component.type === "image" && component.position === "full-page") {
          images.push({
            component,
            sectionIndex,
            componentIndex,
          });
        }
      });
    });
    return images;
  };

  const fullPageImages = getFullPageImages();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
      <div className="bg-white rounded-lg shadow-xl flex flex-col h-5/6 w-4/5 max-w-5xl">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Vista Previa del Informe</h2>
            <p className="text-sm text-gray-500">
              {template.metadata?.description || "Sin descripción"}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <button
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                className="px-2 py-1 bg-gray-200 rounded-l"
                disabled={isExporting}
              >
                -
              </button>
              <span className="px-2">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(150, zoom + 10))}
                className="px-2 py-1 bg-gray-200 rounded-r"
                disabled={isExporting}
              >
                +
              </button>
            </div>

            <button
              onClick={() => handleExport("pdf")}
              disabled={isExporting}
              className={`px-3 py-1 rounded flex items-center ${
                isExporting === "pdf"
                  ? "bg-gray-400 cursor-wait"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {isExporting === "pdf" ? (
                <>
                  <Spinner className="mr-2" />
                  Generando...
                </>
              ) : (
                <>
                  <PdfIcon className="mr-2" />
                  Exportar PDF
                </>
              )}
            </button>

            {/* <button
              onClick={() => handleExport("word")}
              disabled={isExporting}
              className={`px-3 py-1 rounded flex items-center ${
                isExporting === "word"
                  ? "bg-gray-400 cursor-wait"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isExporting === "word" ? (
                <>
                  <Spinner className="mr-2" />
                  Generando...
                </>
              ) : (
                <>
                  <WordIcon className="mr-2" />
                  Exportar Word
                </>
              )}
            </button> */}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              disabled={isExporting}
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-100">
          <div
            id="report-preview"
            className="bg-white shadow-md mx-auto transition-all relative"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top center",
              width: "210mm",
              minHeight: "297mm",
              padding: "20mm",
            }}
          >
            {/* Imágenes de fondo de página completa */}
            {fullPageImages.map((imageData, index) => {
              if (shouldShowImageOnPage(imageData.component, currentPage)) {
                return (
                  <div
                    key={`bg-image-${index}`}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 0,
                      opacity:
                        (imageData.component.backgroundOpacity || 100) / 100,
                    }}
                  >
                    <img
                      src={imageData.component.imageData}
                      alt="Imagen de fondo"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                );
              }
              return null;
            })}
            {/* Contenido del informe (sobre las imágenes de fondo) */}
            <div style={{ position: "relative", zIndex: 1 }}>
              {/* Encabezado */}
              <div className="mb-8 pb-4 border-b border-gray-300">
                <h1 className="text-2xl font-bold mb-2">
                  {template.metadata?.description || "Informe sin título"}
                </h1>
                <div className="text-gray-500 text-sm">
                  Tipo: {template.metadata?.templateType || "Genérico"} |
                  Versión: {template.metadata?.version || "1.0.0"}
                </div>
              </div>

              {/* Secciones */}
              {template.sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="mb-8">
                  <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200">
                    {section.title}
                  </h2>
                  <div className="space-y-4">
                    {section.components.map((component, componentIndex) => {
                      // Omitir imágenes de página completa del contenido normal
                      if (
                        component.type === "image" &&
                        component.position === "full-page"
                      ) {
                        return null;
                      }

                      // Para otros componentes, usar el contenedor normal
                      return (
                        <div
                          key={componentIndex}
                          className="border border-gray-200 rounded p-4"
                        >
                          <ComponentRenderer
                            component={component}
                            excelData={section.excelData}
                          />
                        </div>
                      );
                    })}
                  </div>
                  {renderEventsTimeline(section.events)}
                </div>
              ))}

              {/* Footer */}
              <div className="mt-8 pt-4 border-t border-gray-300 text-gray-500 text-sm text-center">
                Página {currentPage} | Generado el{" "}
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Paginación */}
        <div className="border-t border-gray-200 p-4 flex justify-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              className="px-3 py-1 bg-gray-200 rounded-l hover:bg-gray-300"
              disabled={currentPage === 1 || isExporting}
            >
              ←
            </button>
            <span>Página {currentPage}</span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-3 py-1 bg-gray-200 rounded-r hover:bg-gray-300"
              disabled={isExporting}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
