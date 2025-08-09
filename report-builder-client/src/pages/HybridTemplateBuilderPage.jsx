import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TemplateEditor from "../components/TemplateEditor";
import AreaAssignmentPanel from "../components/AreaAssignmentPanel";
import AreaAssignmentService from "../services/AreaAssignmentService";
import { toast } from "react-toastify";
import HeaderActions from "../layouts/HeaderActions";
import {
  DocumentTextIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

const HybridTemplateBuilderPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [template, setTemplate] = useState(null);
  const [availableAreas, setAvailableAreas] = useState([]);
  const [areaAssignments, setAreaAssignments] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const steps = [
    { id: 1, name: "Crear Plantilla", icon: DocumentTextIcon },
    { id: 2, name: "Asignar Áreas", icon: UserGroupIcon },
    { id: 3, name: "Finalizar", icon: CheckCircleIcon },
  ];

  useEffect(() => {
    loadAvailableAreas();
  }, []);

  const loadAvailableAreas = async () => {
    try {
      const areas = await AreaAssignmentService.getAvailableAreas();
      setAvailableAreas(areas);
    } catch (error) {
      console.error("Error cargando áreas:", error);
      setError("Error cargando áreas disponibles");
    }
  };

  const handleTemplateSave = (savedTemplate) => {
    setTemplate(savedTemplate);
    setCurrentStep(2);
    toast.success("Plantilla creada exitosamente");
  };

  const handleAutoAssign = async (sections) => {
    try {
      const assignments = await AreaAssignmentService.autoAssignAreas(sections);
      return assignments;
    } catch (error) {
      toast.error("Error en asignación automática: " + error.message);
      throw error;
    }
  };

  const handleManualAssign = () => {
    // Aquí podrías abrir un modal o navegar a una página de asignación manual
    toast.info("Modo de asignación manual activado");
  };

  const handleAssignmentsChange = (newAssignments) => {
    setAreaAssignments(newAssignments);
  };

  const handleFinalize = async () => {
    if (!template) {
      toast.error("No hay plantilla para finalizar");
      return;
    }

    const validation = AreaAssignmentService.validateAssignments(
      areaAssignments,
      template.sections
    );

    if (!validation.isValid) {
      toast.error(
        `${validation.unassignedSections.length} secciones sin asignar`
      );
      return;
    }

    setLoading(true);
    try {
      // Aquí guardarías la plantilla con las asignaciones
      await AreaAssignmentService.saveAreaAssignments(
        template.id,
        areaAssignments
      );

      toast.success("Plantilla finalizada exitosamente");
      navigate("/admin/consolidated-templates");
    } catch (error) {
      toast.error("Error finalizando plantilla: " + error.message);
    } finally {
      setLoading(false);
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

  const getCurrentStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Paso 1: Crear Plantilla Manualmente
              </h3>
              <p className="text-blue-700">
                Usa el editor de plantillas para crear la estructura de tu
                reporte. Puedes agregar secciones, componentes y configurar el
                diseño.
              </p>
            </div>

            <TemplateEditor
              initialTemplate={template}
              onSave={handleTemplateSave}
              onCancel={() => navigate("/admin/consolidated-templates")}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-green-900 mb-2">
                Paso 2: Asignar Áreas de Responsabilidad
              </h3>
              <p className="text-green-700">
                Asigna cada sección de la plantilla a un área específica. Puedes
                usar asignación automática con IA o hacerlo manualmente.
              </p>
            </div>

            {template && (
              <AreaAssignmentPanel
                sections={template.sections}
                availableAreas={availableAreas}
                onAssignmentsChange={handleAssignmentsChange}
                onAutoAssign={handleAutoAssign}
                onManualAssign={handleManualAssign}
              />
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Volver a Plantilla
              </button>

              <button
                onClick={() => setCurrentStep(3)}
                disabled={
                  Object.values(areaAssignments).filter((a) => a.areaId)
                    .length === 0
                }
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar →
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-purple-900 mb-2">
                Paso 3: Revisar y Finalizar
              </h3>
              <p className="text-purple-700">
                Revisa la plantilla y las asignaciones antes de finalizar.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Resumen de la plantilla */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Resumen de Plantilla
                </h4>
                {template && (
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Nombre:</span>
                      <p className="font-medium">
                        {template.metadata?.name || "Sin nombre"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">
                        Descripción:
                      </span>
                      <p className="text-sm">
                        {template.metadata?.description || "Sin descripción"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Secciones:</span>
                      <p className="font-medium">
                        {template.sections?.length || 0} secciones
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Resumen de asignaciones */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Resumen de Asignaciones
                </h4>
                <div className="space-y-3">
                  {Object.entries(areaAssignments).map(
                    ([sectionId, assignment]) => {
                      const section = template?.sections?.find(
                        (s) => s.id === sectionId
                      );
                      return (
                        <div
                          key={sectionId}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {section?.title || "Sección"}
                            </p>
                            <p className="text-xs text-gray-600">
                              {assignment.areaName}
                            </p>
                          </div>
                          {assignment.isAutoAssigned && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              IA
                            </span>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Volver a Asignaciones
              </button>

              <button
                onClick={handleFinalize}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Finalizando..." : "Finalizar Plantilla"}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white p-6">
      <div className="pb-6">
        <HeaderActions
          onViewReports={goToReports}
          onCancel={handleLogout}
          onGoHome={goToHome}
        />
      </div>
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-800">
            Constructor Híbrido de Plantillas
          </h1>
          <p className="mt-2 text-gray-600">
            Crea plantillas manualmente y asigna áreas de responsabilidad a
            través de un proceso guiado.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <nav aria-label="Progress">
            <ol className="flex items-center">
              {steps.map((step, stepIdx) => (
                <li
                  key={step.name}
                  className={`relative ${
                    stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : ""
                  } ${stepIdx !== 0 ? "pl-8 sm:pl-20" : ""}`}
                >
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    {stepIdx !== 0 && (
                      <div
                        className={`h-0.5 w-full ${
                          step.id <= currentStep ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                  <div
                    className={`relative flex h-10 w-10 items-center justify-center rounded-full ${
                      step.id < currentStep
                        ? "bg-blue-600 hover:bg-blue-900"
                        : step.id === currentStep
                        ? "bg-blue-600"
                        : "bg-gray-200"
                    }`}
                  >
                    <step.icon
                      className={`h-6 w-6 ${
                        step.id <= currentStep ? "text-white" : "text-gray-400"
                      }`}
                      aria-hidden="true"
                    />
                    <span className="sr-only">{step.name}</span>
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Step Content */}
        {getCurrentStepContent()}
      </div>
    </div>
  );
};

export default HybridTemplateBuilderPage;
