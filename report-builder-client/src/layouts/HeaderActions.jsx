import { useAuth } from "../context/AuthContext";

const HeaderActions = ({ onViewReports, onCancel }) => {
  const { user } = useAuth();

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
      {/* Mensaje de bienvenida */}
      <div className="flex items-center space-x-2">
        <span className="text-lg font-semibold text-gray-700">
          Hola, {user?.name || "Usuario"}
        </span>
        {user?.areaId && (
          <span className="text-sm text-gray-500 italic">
            (Área {user.areaId})
          </span>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onViewReports}
          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-md transition"
        >
          📑 Ver Reportes
        </button>

        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-100 hover:bg-red-200 rounded-md transition"
        >
          🔒 Cerrar Sesión
        </button>
      </div>
    </header>
  );
};

export default HeaderActions;
