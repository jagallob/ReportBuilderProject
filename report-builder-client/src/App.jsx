import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import PrivateRoute from "./routes/PrivateRoute";
import TemplateEditorPage from "./pages/TemplateEditorPage";
import ReportsPage from "./pages/ReportsPage";
import AdminPanel from "./pages/AdminPanel";
import NarrativeGeneratorPage from "./pages/NarrativeGeneratorPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

        <Route
          path="/admin"
          element={
            <PrivateRoute element={<AdminPanel />} allowedRoles={["admin"]} />
          }
        />

        <Route
          path="/narrative-generator"
          element={<NarrativeGeneratorPage />}
        />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </>
  );
}

export default App;
