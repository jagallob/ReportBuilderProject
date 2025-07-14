import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redirige las peticiones que empiezan con /api a tu servidor backend
      "/api": {
        target: "http://localhost:5000", // <-- ¡IMPORTANTE! Cambia 5001 por el puerto real de tu backend
        changeOrigin: true, // Necesario para que el backend acepte la petición
        secure: false, // No verificar certificado SSL (útil para desarrollo con https)
      },
    },
  },
});
