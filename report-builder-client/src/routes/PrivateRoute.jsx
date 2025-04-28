import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../context/AuthContext";

// Componente para proteger rutas
const PrivateRoute = ({ element, allowedRoles = [] }) => {
  const { user } = useAuth();

  // Si no hay sesión activa
  if (!user || !user.role) {
    return <Navigate to="/" replace />;
  }

  // Normalizar roles
  const userRole = user.role.toLowerCase();
  const permittedRoles = allowedRoles.map((r) => r.toLowerCase());

  // Si no tiene permisos
  if (!permittedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  // Usuario autenticado y con permisos
  return element;
};

PrivateRoute.propTypes = {
  element: PropTypes.element.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

export default PrivateRoute;
