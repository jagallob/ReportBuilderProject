# Sistema de Feature Flags para AI

Este documento explica cómo usar el sistema de feature flags para habilitar/deshabilitar funcionalidades de AI de forma centralizada.

## 📋 Configuración Actual

### Funcionalidades Habilitadas

- ✅ **NARRATIVE**: Generación de narrativa (siempre activa)
- ✅ **MULTI_LANGUAGE**: Soporte multiidioma
- ✅ **TONE_CUSTOMIZATION**: Personalización de tono

### Funcionalidades Deshabilitadas (Preparadas para Futuro)

- ❌ **CHARTS**: Generación automática de gráficos
- ❌ **KPIS**: Generación automática de KPIs
- ❌ **TRENDS**: Generación automática de tendencias
- ❌ **PATTERNS**: Detección de patrones complejos
- ❌ **RECOMMENDATIONS**: Recomendaciones automáticas
- ❌ **ADVANCED_ANALYSIS**: Análisis avanzado

## 🔧 Cómo Habilitar Nuevas Funcionalidades

### 1. Habilitar Gráficos Automáticos

```javascript
// En src/utils/featureFlags.js
export const AI_FEATURES = {
  NARRATIVE: true,
  CHARTS: true, // Cambiar a true
  KPIS: false,
  TRENDS: false,
  // ... resto de configuraciones
};
```

### 2. Habilitar KPIs Automáticos

```javascript
// En src/utils/featureFlags.js
export const AI_FEATURES = {
  NARRATIVE: true,
  CHARTS: false,
  KPIS: true, // Cambiar a true
  TRENDS: false,
  // ... resto de configuraciones
};
```

### 3. Habilitar Análisis Avanzado

```javascript
// En src/utils/featureFlags.js
export const AI_FEATURES = {
  NARRATIVE: true,
  CHARTS: false,
  KPIS: false,
  TRENDS: false,
  ADVANCED_ANALYSIS: true, // Cambiar a true
  PATTERNS: true, // Habilitar patrones
  RECOMMENDATIONS: true, // Habilitar recomendaciones
  // ... resto de configuraciones
};
```

## 🚀 Cómo Agregar Nuevas Funcionalidades

### Paso 1: Definir el Feature Flag

```javascript
// En src/utils/featureFlags.js
export const AI_FEATURES = {
  // ... funcionalidades existentes
  NEW_FEATURE: false, // Nueva funcionalidad
};
```

### Paso 2: Actualizar la Configuración por Defecto

```javascript
export const getDefaultAIConfig = () => ({
  // ... configuración existente
  includeNewFeature: AI_FEATURES.NEW_FEATURE,
});
```

### Paso 3: Actualizar el Servicio de AI

```javascript
// En src/services/aiService.js
async generateNewFeature(data, config = {}) {
  if (!isFeatureEnabled('NEW_FEATURE')) {
    throw new Error('New feature is not enabled');
  }

  // Implementar la funcionalidad
  // ...
}
```

### Paso 4: Actualizar la Interfaz

```javascript
// En src/components/AI/AIConfigPanel.jsx
{
  isFeatureEnabled("NEW_FEATURE") && (
    <label className="flex items-center text-sm">
      <input
        type="checkbox"
        name="includeNewFeature"
        checked={config.includeNewFeature}
        onChange={handleChange}
        className="mr-2"
      />
      Nueva Funcionalidad
    </label>
  );
}
```

## 🔍 Debugging

### Ver Feature Flags en Desarrollo

En modo desarrollo, puedes ver el estado de los feature flags en:

1. **AIConfigPanel**: Sección expandible "Feature Flags (Solo desarrollo)"
2. **DataAnalysisPanel**: Sección amarilla con estado de features
3. **Console**: Logs automáticos al inicializar el servicio

### Verificar Estado Programáticamente

```javascript
import { isFeatureEnabled, getAvailableFeatures } from "../utils/featureFlags";

// Verificar si una funcionalidad está habilitada
if (isFeatureEnabled("CHARTS")) {
  // Habilitar UI para gráficos
}

// Obtener todas las funcionalidades disponibles
const availableFeatures = getAvailableFeatures();
console.log("Features disponibles:", availableFeatures);
```

## 📊 Beneficios del Sistema

### ✅ Ventajas

- **Control Centralizado**: Todas las funcionalidades se controlan desde un lugar
- **Despliegue Gradual**: Puedes habilitar funcionalidades gradualmente
- **Rollback Fácil**: Deshabilitar funcionalidades sin cambiar código
- **Testing**: Probar funcionalidades en desarrollo sin afectar producción
- **Extensibilidad**: Fácil agregar nuevas funcionalidades

### 🔧 Mantenimiento

- **Configuración por Entorno**: Diferentes configuraciones para dev/prod
- **Documentación**: Cada feature flag está documentado
- **Validación**: El sistema valida la configuración automáticamente

## 🎯 Ejemplos de Uso

### Escenario 1: Lanzamiento Gradual de Gráficos

```javascript
// Semana 1: Solo para desarrollo
AI_FEATURES.CHARTS = import.meta.env.DEV;

// Semana 2: Habilitar para usuarios beta
AI_FEATURES.CHARTS = true;

// Semana 3: Lanzamiento completo
// (mantener en true)
```

### Escenario 2: Funcionalidad Experimental

```javascript
// Solo habilitar en desarrollo
AI_FEATURES.EXPERIMENTAL_FEATURE = import.meta.env.DEV;
```

### Escenario 3: Funcionalidad por Configuración

```javascript
// Habilitar basado en configuración del usuario
AI_FEATURES.PREMIUM_FEATURES = userConfig.isPremium;
```

## 🚨 Consideraciones Importantes

1. **Backend Compatibility**: Asegúrate de que el backend soporte las nuevas funcionalidades
2. **Testing**: Siempre prueba las funcionalidades antes de habilitarlas
3. **Documentation**: Actualiza la documentación cuando agregues nuevas funcionalidades
4. **Performance**: Considera el impacto en rendimiento de nuevas funcionalidades
5. **User Experience**: Asegúrate de que las nuevas funcionalidades mejoren la UX

## 📝 Notas de Desarrollo

- Los feature flags se cargan al inicializar la aplicación
- Los cambios en feature flags requieren recarga de la aplicación
- En producción, considera usar un sistema de configuración dinámica
- Mantén la compatibilidad hacia atrás cuando sea posible
