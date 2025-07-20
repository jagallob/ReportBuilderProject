/**
 * Feature Flags para funcionalidades de AI
 * Permite habilitar/deshabilitar funcionalidades de forma centralizada
 * y prepara el proyecto para futuras expansiones
 */
export const AI_FEATURES = {
  // Funcionalidades principales (siempre activas)
  NARRATIVE: true,

  // Funcionalidades extendidas (deshabilitadas por defecto, preparadas para futuro)
  CHARTS: false,
  KPIS: false,
  TRENDS: false,
  PATTERNS: false,
  RECOMMENDATIONS: false,

  // Configuraciones avanzadas
  ADVANCED_ANALYSIS: false,
  MULTI_LANGUAGE: true,
  TONE_CUSTOMIZATION: true,
};

/**
 * Configuración por defecto de AI que respeta los feature flags
 */
export const getDefaultAIConfig = () => ({
  // Configuración principal
  analysisType: "comprehensive",
  language: "es",
  tone: "professional",

  // Funcionalidades controladas por feature flags
  includeNarrative: AI_FEATURES.NARRATIVE,
  includeCharts: AI_FEATURES.CHARTS,
  includeKPIs: AI_FEATURES.KPIS,
  includeTrends: AI_FEATURES.TRENDS,
  includePatterns: AI_FEATURES.PATTERNS,
  includeRecommendations: AI_FEATURES.RECOMMENDATIONS,

  // Configuraciones avanzadas
  advancedAnalysis: AI_FEATURES.ADVANCED_ANALYSIS,
  multiLanguage: AI_FEATURES.MULTI_LANGUAGE,
  toneCustomization: AI_FEATURES.TONE_CUSTOMIZATION,

  // Configuraciones específicas (preparadas para futuro)
  chartTypes: ["bar", "line", "pie", "area"],
  kpiTypes: ["sum", "avg", "max", "min", "count", "percentage"],
  trendPeriods: ["daily", "weekly", "monthly", "quarterly"],
});

/**
 * Valida si una funcionalidad está habilitada
 */
export const isFeatureEnabled = (feature) => {
  return AI_FEATURES[feature] === true;
};

/**
 * Obtiene configuración de AI filtrada por feature flags
 */
export const getFilteredAIConfig = (config) => {
  const defaultConfig = getDefaultAIConfig();

  return {
    ...defaultConfig,
    ...config,
    // Asegurar que las funcionalidades respeten los feature flags
    includeNarrative:
      AI_FEATURES.NARRATIVE &&
      (config?.includeNarrative ?? defaultConfig.includeNarrative),
    includeCharts:
      AI_FEATURES.CHARTS &&
      (config?.includeCharts ?? defaultConfig.includeCharts),
    includeKPIs:
      AI_FEATURES.KPIS && (config?.includeKPIs ?? defaultConfig.includeKPIs),
    includeTrends:
      AI_FEATURES.TRENDS &&
      (config?.includeTrends ?? defaultConfig.includeTrends),
    includePatterns:
      AI_FEATURES.PATTERNS &&
      (config?.includePatterns ?? defaultConfig.includePatterns),
    includeRecommendations:
      AI_FEATURES.RECOMMENDATIONS &&
      (config?.includeRecommendations ?? defaultConfig.includeRecommendations),
  };
};

/**
 * Obtiene las funcionalidades disponibles según los feature flags
 */
export const getAvailableFeatures = () => {
  return Object.entries(AI_FEATURES)
    .filter(([, enabled]) => enabled)
    .map(([feature]) => feature);
};

/**
 * Log de feature flags para debugging
 */
export const logFeatureFlags = () => {
  if (import.meta.env.DEV) {
    console.log("🔧 AI Feature Flags:", AI_FEATURES);
    console.log("📋 Available Features:", getAvailableFeatures());
  }
};
