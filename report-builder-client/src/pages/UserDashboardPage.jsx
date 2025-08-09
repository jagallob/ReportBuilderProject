import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import HeaderActions from "../layouts/HeaderActions";
import {
  DocumentPlusIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

const UserDashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <HeaderActions
          onCancel={handleLogout}
          onGoHome={() => navigate("/dashboard")}
        />
      </div>
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800">
            Bienvenido, {user?.name}
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            ¿Qué te gustaría hacer hoy?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Opción 1: Crear un informe nuevo para el área */}
          <div
            onClick={() => navigate("/dashboard/create-report")}
            className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border-t-4 border-blue-500"
          >
            <div className="flex justify-center mb-4">
              <DocumentPlusIcon className="h-16 w-16 text-blue-500 group-hover:text-blue-600 transition-colors" />
            </div>
            <h2 className="text-center text-2xl font-semibold text-gray-900">
              Crear Nuevo Informe
            </h2>
            <p className="text-center text-gray-600 mt-2">
              Crea un informe independiente para tu área desde cero o usando una
              plantilla base.
            </p>
          </div>

          {/* Opción 2: Ver tareas de informes consolidados */}
          <div
            onClick={() => navigate("/dashboard/my-tasks")}
            className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border-t-4 border-green-500"
          >
            <div className="flex justify-center mb-4">
              <ClipboardDocumentListIcon className="h-16 w-16 text-green-500 group-hover:text-green-600 transition-colors" />
            </div>
            <h2 className="text-center text-2xl font-semibold text-gray-900">
              Mis Tareas Pendientes
            </h2>
            <p className="text-center text-gray-600 mt-2">
              Completa las secciones de informes consolidados que han sido
              asignadas a tu área.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;
