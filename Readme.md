# ReportBuilderProject

## Descripción General

**ReportBuilderProject** es una solución integral para la gestión, edición y consolidación de informes periódicos en organizaciones. El sistema está compuesto por:

- **Frontend:** Aplicación web moderna desarrollada en React + Vite + Tailwind CSS.
- **Backend:** API RESTful construida en .NET 7, con autenticación JWT, manejo de usuarios, plantillas, reportes y cargas de archivos Excel.

---

## Tabla de Contenidos

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Instalación](#instalación)
  - [Backend (.NET API)](#backend-net-api)
  - [Frontend (React)](#frontend-react)
- [Configuración](#configuración)
- [Uso](#uso)
- [Estructura de Carpetas](#estructura-de-carpetas)
- [Dependencias Principales](#dependencias-principales)
- [Notas de Seguridad](#notas-de-seguridad)
- [Licencia](#licencia)

---

## Características

- **Gestión de usuarios y autenticación JWT**
- **Editor visual de plantillas de informes**
- **Carga y procesamiento de archivos Excel**
- **Generación y descarga de reportes en PDF/Word**
- **Panel de administración y seguimiento de envíos**
- **Consolidación automática de reportes**
- **Notificaciones y feedback visual**

---

## Arquitectura

```
[Usuario] <-- navegador --> [React + Vite + Tailwind] <---> [API REST .NET] <---> [PostgreSQL]
```

---

## Instalación

### Backend (.NET API)

1. **Requisitos:**

   - .NET 7 SDK
   - PostgreSQL

2. **Configuración:**

   - Copia `appsettings.json` y ajusta la cadena de conexión y claves JWT según tu entorno.

3. **Migraciones y base de datos:**

   ```bash
   dotnet ef database update
   ```

4. **Ejecutar la API:**

   ```bash
   dotnet run --project ReportBuilderAPI
   ```

   La API estará disponible en `https://localhost:5001` o el puerto configurado.

---

### Frontend (React)

1. **Requisitos:**

   - Node.js >= 18
   - npm

2. **Instalación de dependencias:**

   ```bash
   cd report-builder-client
   npm install
   ```

3. **Ejecutar en modo desarrollo:**

   ```bash
   npm run dev
   ```

   La app estará disponible en `http://localhost:5173` (por defecto).

---

## Configuración

- **Backend:** Edita `ReportBuilderAPI/appsettings.json` para definir la cadena de conexión a PostgreSQL y los parámetros de JWT.
- **Frontend:** Si la URL de la API cambia, actualízala en los servicios de React (`src/services/`).

---

## Uso

1. **Login:** Accede con tus credenciales. El sistema soporta roles de usuario y administrador.
2. **Panel de administración:** Visualiza el estado de carga de áreas, genera informes consolidados y descarga reportes.
3. **Editor de plantillas:** Crea y edita plantillas de informes de manera visual.
4. **Carga de Excel:** Sube archivos Excel para alimentar los reportes.
5. **Generación de reportes:** Descarga los informes en PDF o Word.

---

## Estructura de Carpetas

```
ReportBuilderProject/
│
├── ReportBuilderAPI/           # Backend .NET
│   ├── Controllers/            # Controladores de la API
│   ├── Models/                 # Modelos de datos
│   ├── Data/                   # Contexto de base de datos
│   ├── DTOs/                   # Objetos de transferencia de datos
│   ├── Services/               # Lógica de negocio
│   └── ...
│
└── report-builder-client/      # Frontend React
    ├── src/
    │   ├── components/         # Componentes reutilizables
    │   ├── pages/              # Vistas principales (Login, Panel, Editor, etc.)
    │   ├── services/           # Llamadas a la API
    │   └── ...
    └── ...
```

---

## Dependencias Principales

### Frontend

- React 19
- Vite
- Tailwind CSS
- React Router DOM
- XLSX, html2canvas, html2pdf.js (exportación)
- React Hot Toast, React Toastify (notificaciones)
- Recharts (gráficas)

### Backend

- .NET 7
- Entity Framework Core (PostgreSQL)
- JWT Bearer Authentication
- Swashbuckle/Swagger (documentación API)

---

## Notas de Seguridad

- **No compartas tu `appsettings.json` con claves sensibles en repositorios públicos.**
- Cambia la clave JWT y las credenciales de la base de datos en producción.

---

## Licencia

MIT
