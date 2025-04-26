import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./routes/PrivateRoute";
import BitacoraPage from "./pages/BitacoraPage";
import UploadExcelPage from "./pages/UploadExcelPage";
import ReportsPage from "./pages/ReportsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute
            element={<Dashboard />}
            allowedRoles={["admin", "manager", "user"]}
          />
        }
      />

      <Route
        path="/dashboard/upload"
        element={
          <PrivateRoute
            element={<UploadExcelPage />}
            allowedRoles={["admin", "manager", "user"]}
          />
        }
      />
      <Route
        path="/dashboard/bitacora"
        element={
          <PrivateRoute
            element={<BitacoraPage />}
            allowedRoles={["admin", "manager", "user"]}
          />
        }
      />
      <Route
        path="/dashboard/reports"
        element={
          <PrivateRoute
            element={<ReportsPage />}
            allowedRoles={["admin", "manager", "user"]}
          />
        }
      />
    </Routes>
  );
}

export default App;
