import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import PrivateRoute from "./routes/PrivateRoute";
import TemplateEditorPage from "./pages/TemplateEditorPage";
import ReportsPage from "./pages/ReportsPage";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
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
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />
    </>
  );
}

export default App;
