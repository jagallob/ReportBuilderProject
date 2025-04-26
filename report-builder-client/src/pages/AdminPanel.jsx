import { useAuth } from "../context/AuthContext";

const AdminPanel = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white p-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-xl">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">
          Consola de Administración
        </h1>
        <p className="text-gray-600 mb-6">
          Bienvenido, <strong>{user?.name}</strong>
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg"
            onClick={() => alert("Ver estado de carga de áreas")}
          >
            📊 Estado de carga por área
          </button>

          <button
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg"
            onClick={() => alert("Acceder a informes individuales")}
          >
            📄 Ver informes individuales
          </button>

          <button
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-4 rounded-lg"
            onClick={() => alert("Consolidar informes del mes")}
          >
            🧩 Generar informe consolidado
          </button>

          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg"
            onClick={() => alert("Descargar PDF / Word")}
          >
            📥 Descargar informe final
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
