import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PDFAnalysisService from "../services/PDFAnalysisService";
import { useAuth } from "../context/AuthContext";
import HeaderActions from "../layouts/HeaderActions";

const PDFAnalysisPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [pdfFile, setPdfFile] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [description, setDescription] = useState("");
  const [period, setPeriod] = useState("");
  const [deadline, setDeadline] = useState("");
  const [analysisConfig, setAnalysisConfig] = useState(
    PDFAnalysisService.getDefaultAnalysisConfig()
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        PDFAnalysisService.validatePDFFile(file);
        setPdfFile(file);
        setError(null);
      } catch (err) {
        setError(err.message);
        setPdfFile(null);
      }
    }
  };

  const testAuth = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await PDFAnalysisService.testAuth();
      console.log("Auth test result:", result);
      setError("Autenticación exitosa: " + JSON.stringify(result, null, 2));
    } catch (err) {
      setError("Error de autenticación: " + err.message);

      // Si es un error de autenticación, redirigir al login
      if (
        err.message.includes("Token inválido") ||
        err.message.includes("autenticación")
      ) {
        setTimeout(() => {
          logout();
          navigate("/login");
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!pdfFile || !templateName || !period) {
      setError("Por favor complete todos los campos requeridos");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await PDFAnalysisService.analyzePDF(
        pdfFile,
        templateName,
        description,
        period,
        deadline ? new Date(deadline) : null,
        analysisConfig
      );

      // Debug: Log the result
      console.log("Result from backend:", result);
      console.log("Result sections:", result?.sections);
      console.log("Sections length:", result?.sections?.length);

      // Verificar que el resultado sea válido
      if (!result || !result.sections || result.sections.length === 0) {
        throw new Error(
          "El análisis no devolvió resultados válidos. Intente nuevamente."
        );
      }

      setAnalysisResult(result);
      setShowCreateForm(true);
    } catch (err) {
      console.error("Error en análisis de PDF:", err);

      // Determinar el tipo de error
      let errorMessage = err.message;

      if (err.message.includes("timeout") || err.message.includes("canceled")) {
        errorMessage =
          "El análisis tardó demasiado tiempo. Intente con un archivo más pequeño o verifique su conexión a internet.";
      } else if (
        err.message.includes("Sesión expirada") ||
        err.message.includes("autenticación")
      ) {
        errorMessage = "Sesión expirada. Será redirigido al login.";
        setTimeout(() => {
          logout();
          navigate("/login");
        }, 2000);
      } else if (err.message.includes("400")) {
        errorMessage =
          "Error en los datos enviados. Verifique que todos los campos requeridos estén completos.";
      } else if (err.message.includes("500")) {
        errorMessage =
          "Error interno del servidor. Intente nuevamente más tarde.";
      }

      setError(errorMessage);
      setAnalysisResult(null);
      setShowCreateForm(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!analysisResult) return;

    setLoading(true);
    setError(null);

    try {
      // Crear asignaciones de secciones basadas en las sugerencias
      const sectionAssignments = analysisResult.suggestedAssignments.map(
        (assignment) => ({
          sectionId: assignment.sectionId,
          areaId: assignment.areaId,
          acceptSuggestion: true,
        })
      );

      const result = await PDFAnalysisService.createFromPDF(
        pdfFile,
        templateName,
        description,
        period,
        deadline ? new Date(deadline) : null,
        sectionAssignments,
        analysisConfig
      );

      // Redirigir a la página de plantillas consolidadas
      navigate("/admin/consolidated-templates", {
        state: {
          message: `Plantilla "${result.templateName}" creada exitosamente con ${result.createdSections.length} secciones`,
          templateId: result.consolidatedTemplateId,
        },
      });
    } catch (err) {
      setError(err.message);

      // Si es un error de autenticación, redirigir al login
      if (
        err.message.includes("Sesión expirada") ||
        err.message.includes("autenticación")
      ) {
        setTimeout(() => {
          logout();
          navigate("/login");
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (key, value) => {
    setAnalysisConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetForm = () => {
    setPdfFile(null);
    setTemplateName("");
    setDescription("");
    setPeriod("");
    setDeadline("");
    setAnalysisConfig(PDFAnalysisService.getDefaultAnalysisConfig());
    setAnalysisResult(null);
    setShowCreateForm(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const goToReports = () => {
    navigate("/dashboard/reports");
  };

  const goToHome = () => {
    navigate("/admin");
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Acceso Denegado
          </h1>
          <p className="text-gray-600">
            Solo los administradores pueden acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white p-6">
      <div className="pb-6">
        <HeaderActions
          onViewReports={goToReports}
          onCancel={handleLogout}
          onGoHome={goToHome}
        />
      </div>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">
            Análisis de PDF
          </h1>
          <p className="text-gray-600">
            Sube un archivo PDF para analizar su estructura y crear una
            plantilla consolidada
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulario de Análisis */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Configuración del Análisis
            </h2>

            {/* Selección de archivo */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Archivo PDF *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {pdfFile ? (
                  <div>
                    <p className="text-green-600 font-medium">
                      ✓ {pdfFile.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {PDFAnalysisService.formatFileSize(pdfFile.size)}
                    </p>
                    <button
                      onClick={() => {
                        setPdfFile(null);
                        fileInputRef.current.value = "";
                      }}
                      className="mt-2 text-red-600 hover:text-red-800 text-sm"
                    >
                      Cambiar archivo
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500">
                      Haz clic para seleccionar un archivo PDF
                    </p>
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                      Seleccionar PDF
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Información de la plantilla */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Plantilla *
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Informe de Sostenibilidad 2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descripción opcional de la plantilla"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Período *
                </label>
                <input
                  type="text"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Enero 2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Límite
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Configuración avanzada */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">
                Configuración Avanzada
              </h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={analysisConfig.identifySections}
                    onChange={(e) =>
                      handleConfigChange("identifySections", e.target.checked)
                    }
                    className="mr-2"
                  />
                  Identificar secciones automáticamente
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={analysisConfig.identifyComponents}
                    onChange={(e) =>
                      handleConfigChange("identifyComponents", e.target.checked)
                    }
                    className="mr-2"
                  />
                  Identificar componentes (tablas, gráficos, etc.)
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={analysisConfig.suggestAreaAssignments}
                    onChange={(e) =>
                      handleConfigChange(
                        "suggestAreaAssignments",
                        e.target.checked
                      )
                    }
                    className="mr-2"
                  />
                  Sugerir asignaciones de áreas
                </label>
              </div>
            </div>

            {/* Botones */}
            <div className="mt-6 flex space-x-3">
              <button
                onClick={handleAnalyze}
                disabled={loading || !pdfFile || !templateName || !period}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg"
              >
                {loading ? "Analizando..." : "🔍 Analizar PDF"}
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Limpiar
              </button>
            </div>

            {/* Botón de prueba de autenticación */}
            <div className="mt-3">
              <button
                onClick={testAuth}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg"
              >
                🔐 Probar Autenticación
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
          </div>

          {/* Resultados del Análisis */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Resultados del Análisis
            </h2>

            {!analysisResult ? (
              <div className="text-center text-gray-500 py-12">
                <p>
                  Sube un archivo PDF y haz clic en "Analizar" para ver los
                  resultados
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Información del documento */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Documento Analizado
                  </h3>
                  <p className="text-sm text-gray-600">
                    {analysisResult.documentTitle}
                  </p>
                  <p className="text-xs text-gray-500">
                    Analizado el{" "}
                    {new Date(analysisResult.analyzedAt).toLocaleString()}
                  </p>
                </div>

                {/* Secciones identificadas */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">
                    Secciones Identificadas (
                    {analysisResult?.sections?.length || 0})
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {!analysisResult?.sections ||
                    analysisResult.sections.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No se identificaron secciones en el PDF.</p>
                        <p className="text-sm mt-1">Esto puede deberse a:</p>
                        <ul className="text-xs mt-2 space-y-1">
                          <li>• El PDF no tiene estructura clara</li>
                          <li>• Problemas de conectividad con la IA</li>
                          <li>• El archivo es muy grande o complejo</li>
                        </ul>
                      </div>
                    ) : (
                      analysisResult.sections.map((section) => (
                        <div
                          key={section.id}
                          className="border border-gray-200 rounded-lg p-3"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-sm">
                              {section.title}
                            </h4>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Página {section.pageNumber}
                            </span>
                          </div>
                          {section.subtitle && (
                            <p className="text-xs text-gray-600 mb-2">
                              {section.subtitle}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1">
                            {section.components.map((component) => (
                              <span
                                key={component.id}
                                className={`text-xs px-2 py-1 rounded ${PDFAnalysisService.getComponentTypeColor(
                                  component.type
                                )}`}
                              >
                                {PDFAnalysisService.getComponentTypeIcon(
                                  component.type
                                )}{" "}
                                {component.type}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Asignaciones sugeridas */}
                {analysisResult?.suggestedAssignments?.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">
                      Asignaciones Sugeridas
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {analysisResult.suggestedAssignments.map((assignment) => (
                        <div
                          key={assignment.sectionId}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {assignment.sectionTitle}
                            </p>
                            <p className="text-xs text-gray-600">
                              → {assignment.areaName}
                            </p>
                          </div>
                          <span
                            className={`text-xs font-medium ${PDFAnalysisService.getConfidenceColor(
                              assignment.confidence
                            )}`}
                          >
                            {PDFAnalysisService.formatConfidence(
                              assignment.confidence
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botón para crear plantilla */}
                {showCreateForm && (
                  <div className="pt-4 border-t">
                    <button
                      onClick={handleCreateTemplate}
                      disabled={loading}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium"
                    >
                      {loading
                        ? "Creando..."
                        : "✅ Crear Plantilla Consolidada"}
                    </button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Se creará una plantilla con{" "}
                      {analysisResult?.sections?.length || 0} secciones
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFAnalysisPage;
