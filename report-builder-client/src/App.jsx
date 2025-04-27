import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import PrivateRoute from "./routes/PrivateRoute";
import TemplateEditorPage from "./pages/TemplateEditorPage";
import ReportsPage from "./pages/ReportsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute
            element={<TemplateEditorPage />}
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
