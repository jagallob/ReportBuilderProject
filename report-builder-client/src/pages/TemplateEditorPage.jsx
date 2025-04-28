import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import TemplateEditor from "../components/TemplateEditor";
import { TemplateService } from "../services/TemplateService";
import UserService from "../services/UserService";

const TemplateEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        if (id) {
          const data = await TemplateService.getTemplate(id);
          setTemplate(data);
        } else {
          setTemplate({
            metadata: {
              templateType: "generic",
              version: "1.0.0",
              description: "",
              allowedPeriods: ["monthly"],
            },
            sections: [],
            header: {},
            footer: {},
            settings: {},
          });
        }
      } catch (err) {
        console.error("Error cargando plantilla:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, [id]);

  const handleSave = async (templateData) => {
    try {
      const areaId = UserService.getUserAreaId();
      const payload = {
        name: templateData.metadata?.description || "Nueva plantilla",
        areaId: areaId ? parseInt(areaId) : 1, // Fallback en caso de que no haya área
        configuration: {
          metadata: templateData.metadata,
          sections: templateData.sections,
          header: templateData.header || {},
          footer: templateData.footer || {},
          settings: templateData.settings || {},
        },
      };
      if (id) {
        await TemplateService.updateTemplate(id, payload);
        toast.success("Plantilla actualizada correctamente ✅");
      } else {
        await TemplateService.createTemplate(payload);
        toast.success("Plantilla creada correctamente 🎉");
      }

      navigate("/dashboard/reports");
    } catch (err) {
      console.error("Error guardando plantilla:", err);
      toast.error("Error al guardar la plantilla ❌");
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const goToReports = () => {
    navigate("/dashboard/reports");
  };

  if (loading) return <div className="p-8">Cargando plantilla...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <TemplateEditor
        initialTemplate={template}
        onSave={handleSave}
        onCancel={handleLogout}
        onViewReports={goToReports}
      />
    </div>
  );
};

export default TemplateEditorPage;
