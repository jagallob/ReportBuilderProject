import { useState, useEffect } from "react";
import TemplateEditor from "../components/TemplateEditor";
import { TemplateService } from "../services/TemplateService";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import UserService from "../services/UserService";
import HeaderActions from "../layouts/HeaderActions";
import { useAuth } from "../context/AuthContext";

const TemplateEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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

  const goToHome = () => {
    if (user?.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  if (loading) return <div className="p-8">Cargando plantilla...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="pb-6">
        <HeaderActions
          onViewReports={goToReports}
          onCancel={handleLogout}
          onGoHome={goToHome}
        />
      </div>
      <TemplateEditor
        initialTemplate={template}
        onSave={handleSave}
        // onCancel y onViewReports eliminados, ya están en el header global
      />
    </div>
  );
};

export default TemplateEditorPage;
