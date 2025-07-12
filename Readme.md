# ReportBuilderProject

**ReportBuilderProject** es una solución integral para la gestión y consolidación de informes, potenciada con Inteligencia Artificial para generar análisis, narrativas y búsquedas semánticas de forma automática.

---

## Tabla de Contenidos

- [🚀 Características](#-características)
- [🛠️ Stack Tecnológico](#️-stack-tecnológico)
- [🏛️ Arquitectura](#️-arquitectura)
- [🏁 Cómo Empezar](#-cómo-empezar)
- [📖 Uso de la API](#-uso-de-la-api)
- [🤝 Cómo Contribuir](#-cómo-contribuir)
- [📝 Licencia](#-licencia)

---

## 🚀 Características

### Funcionalidades Principales

- **Gestión de Usuarios y Autenticación**: Sistema seguro de roles y permisos con JWT.
- **Carga y Procesamiento de Datos**: Soporte nativo para ingesta de datos desde archivos Excel.
- **Generación de Reportes**: Creación de reportes consolidados listos para descargar.
- **Panel de Administración**: Interfaz centralizada para el seguimiento y gestión de informes.

### Capacidades de Inteligencia Artificial

- **Análisis de Datos Automático**: Genera insights, tendencias y resúmenes ejecutivos a partir de los datos cargados.
- **Generación de Narrativas**: Crea textos coherentes y profesionales para las secciones de los reportes.
- **Búsqueda Semántica**: Permite buscar información dentro de los reportes por significado, no solo por palabras clave.

---

## 🛠️ Stack Tecnológico

| Área                  | Tecnología / Librería                              |
| --------------------- | -------------------------------------------------- |
| **Frontend**          | React 19, Vite, Tailwind CSS, Recharts             |
| **Backend**           | ASP.NET Core 9.0                                   |
| **Inteligencia IA**   | `Azure.AI.OpenAI` (GPT-4o, text-embedding-3-small) |
| **Base de Datos**     | Entity Framework Core con PostgreSQL               |
| **Autenticación**     | JWT Bearer Tokens                                  |
| **Documentación API** | Swashbuckle (Swagger)                              |

---

## 🏛️ Arquitectura

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

   La API estará disponible en `https://localhost:5000` o el puerto configurado.

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
