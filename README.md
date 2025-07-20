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

- **Generación de Narrativas Automática**: Crea textos coherentes y profesionales para las secciones de los reportes usando la API de Anthropic.
- **Análisis de Datos Inteligente**: Genera insights y resúmenes ejecutivos a partir de los datos cargados.
- **Búsqueda Semántica**: Permite buscar información dentro de los reportes por significado, no solo por palabras clave.
- **Análisis de Consumo Metro**: Sistema especializado para análisis de datos de transporte público con narrativas automáticas.

---

## 🛠️ Stack Tecnológico

| Área                  | Tecnología / Librería                  |
| --------------------- | -------------------------------------- |
| **Frontend**          | React 19, Vite, Tailwind CSS, Recharts |
| **Backend**           | ASP.NET Core 9.0                       |
| **Inteligencia IA**   | Anthropic Claude API (Claude-3-Sonnet) |
| **Base de Datos**     | Entity Framework Core con PostgreSQL   |
| **Autenticación**     | JWT Bearer Tokens                      |
| **Documentación API** | Swashbuckle (Swagger)                  |

---

## 🏛️ Arquitectura

```
[Usuario] <-- navegador --> [React + Vite + Tailwind] <---> [API REST .NET] <---> [Anthropic API]
```

---

## Instalación

### Backend (.NET API)

1. **Requisitos:**

   - .NET 7 SDK
   - PostgreSQL

2. **Configuración:**

   - Copia `appsettings.json` y ajusta la cadena de conexión y claves JWT según tu entorno.
   - **Importante**: Configura tu clave de API de Anthropic en `appsettings.json`:

   ```json
   "Anthropic": {
     "ApiKey": "tu-clave-de-api-aqui",
     "Model": "claude-3-sonnet-20240229",
     "MaxTokens": 4000,
     "Temperature": 0.7,
     "TimeoutSeconds": 60
   }
   ```

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

- **Backend:** Edita `ReportBuilderAPI/appsettings.json` para definir la cadena de conexión a PostgreSQL, los parámetros de JWT y la clave de API de Anthropic.
- **Frontend:** Si la URL de la API cambia, actualízala en los servicios de React (`src/services/`).

---

## Uso

1. **Login:** Accede con tus credenciales. El sistema soporta roles de usuario y administrador.
2. **Panel de administración:** Visualiza el estado de carga de áreas, genera informes consolidados y descarga reportes.
3. **Editor de plantillas:** Crea y edita plantillas de informes de manera visual.
4. **Carga de Excel:** Sube archivos Excel para alimentar los reportes.
5. **Generación de reportes:** Descarga los informes en PDF o Word.
6. **Generación de Narrativas:** Al cargar archivos Excel, el sistema automáticamente genera narrativas profesionales usando IA.

---

## Nuevas Funcionalidades

### Generación Automática de Narrativas con IA

El sistema ahora incluye generación automática de narrativas que se activa cuando cargas archivos Excel:

- **Procesa datos Excel** automáticamente al cargarlos
- **Genera narrativas profesionales** usando la API de Anthropic
- **Crea secciones automáticas** en el informe con el análisis narrativo
- **Proporciona insights automáticos** basados en patrones de datos
- **Integra narrativas** directamente en el flujo de creación de informes

### Flujo de Trabajo

1. **Cargar Excel**: Sube un archivo Excel en el editor de plantillas
2. **Análisis Automático**: El sistema analiza automáticamente los datos
3. **Narrativa Generada**: Se crea una nueva sección con la narrativa del análisis
4. **Informe Completo**: La narrativa se integra como parte del informe final

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
│   │   └── AI/                 # Servicios de IA
│   │       ├── Implementation/ # Implementaciones (Anthropic, etc.)
│   │       └── Interfaces/     # Interfaces de servicios
│   └── ...
│
└── report-builder-client/      # Frontend React
    ├── src/
    │   ├── components/         # Componentes reutilizables
    │   │   └── AI/            # Componentes de IA
    │   ├── pages/              # Vistas principales
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
- Papa Parse (procesamiento CSV)
