import React from "react";
import { useNavigate } from "react-router-dom";
import { mockReports } from "../mocks/mockReports";
import HeaderActions from "../layouts/HeaderActions";

const ReportsPage = () => {
  const navigate = useNavigate();

  const handleView = (id) => {
    // Redirigir al editor en modo lectura
    navigate(`/dashboard/templates/${id}`);
  };

  const handleDuplicate = (report) => {
    // Crear una nueva plantilla usando los mismos datos
    const duplicatedTemplate = {
      ...report, // solo para mock, en real usaría template config
      id: null,
      name: `${report.name} (Copia)`,
    };
    localStorage.setItem(
      "duplicatedTemplate",
      JSON.stringify(duplicatedTemplate)
    );
    navigate("/dashboard"); // carga nueva plantilla
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };
  const goToReports = () => {
    navigate("/dashboard/reports");
  };

  return (
    <>
      <div className="pb-6">
        <HeaderActions onViewReports={goToReports} onCancel={handleLogout} />
      </div>
      <div className="p-6 max-w-5xl mx-auto mt-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          📊 Reportes Generados
        </h1>
        <div className="grid gap-4">
          {mockReports.map((report) => (
            <div
              key={report.id}
              className="bg-white shadow border rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <h2 className="text-lg font-semibold">{report.name}</h2>
                <p className="text-sm text-gray-500">
                  Área: {report.area} | Tipo: {report.templateType} | Fecha:{" "}
                  {report.createdAt}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleView(report.id)}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Ver detalle
                </button>
                <button
                  onClick={() => handleDuplicate(report)}
                  className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Duplicar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ReportsPage;
