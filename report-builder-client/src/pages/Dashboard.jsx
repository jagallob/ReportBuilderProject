import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-blue-800 mb-2">
          ¡Hola, {user?.name || "Usuario"}!
        </h1>
        <p className="text-gray-700 mb-4">
          Bienvenido al panel de tu área <strong>{user?.areaId}</strong>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <button
            onClick={() => navigate("/dashboard/upload")}
            className="bg-blue-100 border border-blue-300 rounded-lg p-4 text-left hover:shadow-lg transition"
          >
            <h2 className="text-lg font-semibold text-blue-700 mb-2">
              📄 Plantilla del mes
            </h2>
            <p className="text-sm text-gray-600">
              Sube tu archivo Excel, visualiza los datos y ajusta los textos del
              informe mensual.
            </p>
          </button>

          <button
            onClick={() => navigate("/dashboard/bitacora")}
            className="bg-purple-100 border border-purple-300 rounded-lg p-4 text-left hover:shadow-lg transition"
          >
            <h2 className="text-lg font-semibold text-purple-700 mb-2">
              📝 Bitácora de sucesos
            </h2>
            <p className="text-sm text-gray-600">
              Registra eventos importantes de este mes o deja que se importen
              desde tu correo.
            </p>
          </button>

          <button
            onClick={() => navigate("/dashboard/reports")}
            className="bg-green-100 border border-green-300 rounded-lg p-4 text-left hover:shadow-lg transition"
          >
            <h2 className="text-lg font-semibold text-green-700 mb-2">
              📊 Reportes enviados
            </h2>
            <p className="text-sm text-gray-600">
              Consulta los informes anteriores o verifica si ya se envió el
              informe actual.
            </p>
          </button>

          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="bg-red-100 border border-red-300 rounded-lg p-4 text-left hover:shadow-lg transition"
          >
            <h2 className="text-lg font-semibold text-red-700 mb-2">
              🔐 Cerrar sesión
            </h2>
            <p className="text-sm text-gray-600">
              Finaliza tu sesión de forma segura.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
