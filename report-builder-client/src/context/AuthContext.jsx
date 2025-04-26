import { createContext, useContext, useState, useEffect } from "react";
import { UserService } from "../services/UserService";

// Crear el contexto
const AuthContext = createContext();

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Cargar sesión previa si existe
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      // Obtener datos del usuario desde el token
      const userData = UserService.getUserData();
      if (userData) {
        setUser(userData);
      }
    }
  }, []);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    const userData = UserService.getUserData();
    if (userData) {
      setUser(userData);
    }
  };

  const logout = () => {
    UserService.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto
export const useAuth = () => {
  return useContext(AuthContext);
};
