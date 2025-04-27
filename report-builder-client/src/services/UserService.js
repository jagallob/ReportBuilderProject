const API_URL = "http://localhost:5000";

export const UserService = {
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `Error ${response.status}: ${response.statusText}`,
        }));
        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        );
      }

      console.log("RESPONSE STATUS:", response.status);
      const data = await response.json();
      console.log("DATA:", data);

      // Guardar token en localStorage
      localStorage.setItem("token", data.token);

      // Decodificar el token para obtener información del usuario
      const payload = JSON.parse(atob(data.token.split(".")[1]));

      // Guardar datos adicionales del usuario
      if (payload.Id) localStorage.setItem("id", payload.Id);
      if (payload.Role) localStorage.setItem("role", payload.Role);
      if (payload.AreaId) localStorage.setItem("areaId", payload.AreaId);
      if (payload.FullName) localStorage.setItem("name", payload.FullName);

      return {
        token: data.token,
        user: {
          id: payload.Id || payload.id,
          name: payload.FullName || payload.name,
          role: payload.Role || payload.role,
          areaId: payload.AreaId || payload.areaId,
        },
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    localStorage.removeItem("role");
    localStorage.removeItem("areaId");
    localStorage.removeItem("name");
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  getToken: () => {
    return localStorage.getItem("token");
  },

  getUserRole: () => {
    return localStorage.getItem("role");
  },

  getUserId: () => {
    return localStorage.getItem("id");
  },

  getUserAreaId: () => {
    return localStorage.getItem("areaId");
  },

  getUserName: () => {
    return localStorage.getItem("name");
  },

  getUserData: () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return {
        id: payload.Id || payload.id,
        name: payload.FullName || payload.name,
        role: payload.Role || payload.role,
        areaId: payload.AreaId || payload.areaId,
      };
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  },
};

export default UserService;
