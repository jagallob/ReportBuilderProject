import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Menu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">
          Bienvenido, {user?.name}
        </h1>
        <p className="text-gray-700 mb-6">
          Rol: <strong>{user?.role}</strong> | Área:{" "}
          <strong>{user?.areaId}</strong>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600"
          >
            📄 Plantilla mensual
          </button>

          <button
            onClick={() => navigate("/events")}
            className="bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600"
          >
            📝 Bitácora de eventos
          </button>

          <button
            onClick={() => navigate("/uploads")}
            className="bg-indigo-500 text-white py-3 px-4 rounded-md hover:bg-indigo-600"
          >
            📥 Subir archivo Excel
          </button>

          {user.role === "Admin" && (
            <>
              <button
                onClick={() => navigate("/admin")}
                className="bg-red-500 text-white py-3 px-4 rounded-md hover:bg-red-600"
              >
                🧾 Consolidador de informes
              </button>

              <button
                onClick={() => navigate("/templates")}
                className="bg-purple-500 text-white py-3 px-4 rounded-md hover:bg-purple-600"
              >
                🛠 Gestión de plantillas
              </button>
            </>
          )}
        </div>

        <button
          onClick={logout}
          className="text-sm text-red-600 underline hover:text-red-800"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default Menu;
