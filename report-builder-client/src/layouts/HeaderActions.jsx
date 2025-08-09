import React from "react";
import { useAuth } from "../context/AuthContext";

const HeaderActions = ({ onViewReports, onCancel, onGoHome }) => {
  const { user } = useAuth();

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
      {/* Logo y bienvenida */}
      <div className="flex items-center">
        <img
          src="/logo-placeholder.png"
          alt="Logo"
          className="h-8 mr-3"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTcgOGg4bTAgNGg0bS00IDRoNE01IDIwaDE0YTIgMiAwIDAgMCAyLTJWNmEyIDIgMCAwIDAtMi0ySDVhMiAyIDAgMCAwLTIgMnYxMmEyIDIgMCAwIDAgMiAyeiIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=";
          }}
        />
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-gray-800">
            ReportBuilder
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              Hola, {user?.name || "Usuario"}
            </span>
            {user?.areaId && (
              <span className="text-xs text-gray-500 italic">
                (Área {user.areaId})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex items-center space-x-3">
        {/* Botón "Volver al Inicio" para todas las páginas que no son el dashboard principal */}
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition border border-green-200"
          >
            🏠 Volver al Inicio
          </button>
        )}

        <button
          onClick={onViewReports}
          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition border border-blue-200"
        >
          📑 Ver Informes
        </button>

        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition border border-gray-300"
        >
          🔒 Cerrar Sesión
        </button>
      </div>
    </header>
  );
};

export default HeaderActions;
