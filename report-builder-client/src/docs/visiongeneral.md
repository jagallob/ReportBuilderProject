# 🧠 VISIÓN GENERAL DEL SISTEMA

## 🌐 Página Inicial (Login por Área)

1. **Pantalla de login**
   - Cada área tiene un usuario y contraseña.
   - **Roles**: Admin, Responsable de Área, Revisor.
   - Acceso personalizado según el tipo de usuario.
   - Después del login → Redirige a su _"plantilla de trabajo mensual"_.

## 📄 Plantilla de Informe Configurable por Área

Cada área accede a su propia plantilla preconfigurada, donde podrá:

- Subir su archivo Excel del mes (formato estandarizado).
- Visualizar los datos extraídos automáticamente:
  - Tablas cargadas
  - KPIs generados
  - Gráficos automáticos (tendencias, resultados, etc.)
  - Observaciones si hay textos en el Excel
- Editar campos narrativos si lo desea.
- Guardar como borrador o enviar para consolidación final.

## 📩 MiniApp de Sucesos / Bitácora (por Área)

Desde la misma pantalla de trabajo, cada área podrá:

### ✅ Ingreso Manual:

- Registrar sucesos relevantes (fecha, título, descripción, impacto, adjuntos).
- Editarlos si es necesario.
- Asociarlos automáticamente al mes y área.

### 🤖 Ingreso Automático vía Correo:

- Se conecta a carpetas específicas del buzón de cada área.
- Extrae correos relevantes y crea eventos automáticos.
- Categorización por palabras clave.
- Adjunta documentos automáticamente si es necesario.

Todos los sucesos se pueden incluir automáticamente en el informe mensual como una sección especial.

## 🧾 Generación del Informe Consolidado

Cuando todas las áreas completen su parte:

- El sistema consolida automáticamente toda la información en una plantilla maestra.
- Genera el informe final:
  - En Word, PDF o Web.
  - Con narrativas, tablas, gráficos y bitácora.
- Envía a revisión o directamente a los grupos de interés.

## 🧩 PROPUESTA DE ARQUITECTURA PARA CONSTRUIRLO

### 🧱 Backend: ReportBuilderAPI (.NET 8 + PostgreSQL)

| Módulo    | Función                                                  |
| --------- | -------------------------------------------------------- |
| Auth      | Login, roles, JWT                                        |
| Areas     | Información de cada área                                 |
| Users     | Gestión de usuarios del sistema                          |
| Templates | Plantillas configurables por área                        |
| Uploads   | Subida y lectura de archivos Excel                       |
| Events    | Bitácora de sucesos manuales o automáticos               |
| Reports   | Generación del informe final por mes                     |
| EmailSync | Lectura automática desde carpetas de correo vía IMAP/EWS |

### 🎨 Frontend: report-builder-client (React + Vite)

| Página     | Descripción                                                       |
| ---------- | ----------------------------------------------------------------- |
| /login     | Login por usuario/área                                            |
| /dashboard | Vista por área: carga de Excel, datos extraídos, edición          |
| /events    | Registro y visualización de sucesos (manuales o importados)       |
| /templates | Vista editable de la plantilla por área                           |
| /admin     | Consola de revisión, consolidación y generación del informe final |

### 🔐 Roles

- **Admin**: todo acceso.
- **Responsable de Área**: carga y edición de su propia sección.
- **Revisor**: vista del consolidado, pero sin editar.

## 🧭 FLUJO DE TRABAJO

---

## ✅ Checklist de Cumplimiento de Funcionalidades (Estado al 21/05/2025)

### 1. Pantalla de login por área y roles
- [x] Modelo de usuario con área y rol (`User.cs`)
- [x] Lógica de autenticación y roles en backend (`AuthController`, `UserService`)
- [x] Contexto de usuario y roles en frontend (`AuthContext.jsx`)
- [ ] Pantalla de login diferenciada por área (no explícito)
- [ ] Redirección automática a la plantilla mensual tras login (no explícito)

### 2. Plantilla de informe configurable por área
- [x] Plantillas asociadas a áreas (`Template`, `TemplatesController`, `TemplateService.js`)
- [x] Carga de archivo Excel por área y período (`ExcelUploadsController`, `ExcelUploadService.js`)
- [x] Visualización de datos extraídos de Excel (tablas, KPIs, gráficos) (`TableRenderer`, `KpiRenderer`, `ChartConfig`)
- [x] Edición de campos narrativos (`TextConfig`, `TextRenderer`)
- [x] Guardar cambios en la plantilla
- [ ] Guardar como borrador vs enviar para consolidación (no diferenciado claramente)

### 3. MiniApp de sucesos / bitácora
- [x] Registro manual de sucesos por área y mes (`EventLogsController`, `SelectEventsModal.jsx`)
- [x] Edición y asociación de sucesos a área y mes
- [ ] Ingreso automático de sucesos vía correo (no implementado)
- [ ] Categorización automática por palabras clave (no implementado)
- [x] Inclusión de sucesos en el informe mensual

### 4. Generación del informe consolidado
- [x] Consolidación de información de todas las áreas (estructura presente, lógica parcial)
- [x] Generación de informe final en PDF (`exportUtils.js`, `PreviewPanel.jsx`)
- [ ] Exportación a Word (estructura presente, pero función comentada)
- [x] Inclusión de narrativas, tablas, gráficos y bitácora en el informe

### 5. Panel de administración
- [x] Panel de administración para ver estado de carga, informes individuales y consolidación (`AdminPanel.jsx`)
- [x] Botones para consolidar informes y descargar informe final

### 6. Otros detalles técnicos
- [x] Asociación de usuarios a áreas y roles (`User.cs`)
- [x] Relación de plantillas, uploads y sucesos con áreas
- [x] Servicios y controladores para cada entidad principal

---

> Este checklist se debe actualizar conforme avance el desarrollo para reflejar el estado real del sistema respecto a la visión general.
