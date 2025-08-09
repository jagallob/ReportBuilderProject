import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ConsolidatedTemplateService } from "../services/ConsolidatedTemplateService";
import { useAuth } from "../context/AuthContext";
import HeaderActions from "../layouts/HeaderActions";
import TemplateEditor from "../components/TemplateEditor";

const SectionCompletionPage = () => {
  const { templateId, sectionId } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSection = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ConsolidatedTemplateService.getSectionForCompletion(
        templateId,
        sectionId
      );

      const editorData = {
        metadata: {
          name: data.SectionTitle,
          description: data.SectionDescription,
        },
        sections: [data.SectionData || data.SectionConfiguration],
      };

      setSection(editorData);
    } catch (err) {
      setError("Error al cargar la sección. " + err.message);
      toast.error("No se pudo cargar la tarea.");
    } finally {
      setLoading(false);
    }
  }, [templateId, sectionId]);

  useEffect(() => {
    loadSection();
  }, [loadSection]);

  const handleSave = async (updatedTemplateData) => {
    try {
      const updatedSectionContent = updatedTemplateData.sections[0];

      await ConsolidatedTemplateService.updateSectionContent(
        templateId,
        sectionId,
        {
          sectionData: updatedSectionContent,
          status: "in_progress",
        }
      );

      toast.success("Progreso guardado correctamente.");
    } catch (err) {
      toast.error("Error al guardar el progreso. " + err.message);
    }
  };

  const handleFinalize = async (updatedTemplateData) => {
    try {
      const updatedSectionContent = updatedTemplateData.sections[0];
      await ConsolidatedTemplateService.updateSectionContent(
        templateId,
        sectionId,
        {
          sectionData: updatedSectionContent,
          status: "completed",
        }
      );
      toast.success("Sección finalizada y enviada.");
      navigate("/dashboard/my-tasks");
    } catch (err) {
      toast.error("Error al finalizar la sección. " + err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading)
    return <div className="p-8 text-center">Cargando tu tarea...</div>;
  if (error)
    return <div className="p-8 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <HeaderActions
        onCancel={handleLogout}
        onGoHome={() => navigate("/dashboard/my-tasks")}
      />

      <TemplateEditor
        initialTemplate={section}
        onSave={handleSave}
        onFinalize={handleFinalize}
        onCancel={() => navigate("/dashboard/my-tasks")}
        isCompletionMode={true} // Prop para adaptar el editor
      />
    </div>
  );
};

export default SectionCompletionPage;
