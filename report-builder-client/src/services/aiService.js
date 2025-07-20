import {
  getFilteredAIConfig,
  isFeatureEnabled,
  logFeatureFlags,
} from "../utils/featureFlags";

/**
 * Servicio base para todas las funcionalidades de AI
 * Diseñado para ser extensible y mantener separación de responsabilidades
 */
class AIService {
  constructor() {
    this.baseUrl = "/api";
    this.logFeatureFlags();
  }

  /**
   * Log de feature flags al inicializar el servicio
   */
  logFeatureFlags() {
    logFeatureFlags();
  }

  /**
   * Genera narrativa usando AI
   * @param {Object} data - Datos a analizar
   * @param {Object} config - Configuración de AI
   * @returns {Promise<Object>} - Narrativa generada
   */
  async generateNarrative(data, config = {}) {
    if (!isFeatureEnabled("NARRATIVE")) {
      throw new Error("Narrative generation is not enabled");
    }

    const filteredConfig = getFilteredAIConfig(config);

    try {
      const response = await fetch(`${this.baseUrl}/narrative/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data,
          config: filteredConfig,
          templateId: filteredConfig.analysisType || "default",
        }),
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const result = await response.json();
      return this.processNarrativeResult(result);
    } catch (error) {
      console.error("Error generando narrativa:", error);
      throw error;
    }
  }

  /**
   * Analiza datos usando AI (preparado para futuras expansiones)
   * @param {Object} data - Datos a analizar
   * @param {Object} config - Configuración de AI
   * @returns {Promise<Object>} - Resultados del análisis
   */
  async analyzeData(data, config = {}) {
    const filteredConfig = getFilteredAIConfig(config);

    try {
      const response = await fetch(`${this.baseUrl}/analytics/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data,
          config: filteredConfig,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const result = await response.json();
      return this.processAnalysisResult(result, filteredConfig);
    } catch (error) {
      console.error("Error analizando datos:", error);
      throw error;
    }
  }

  /**
   * Genera gráficos usando AI (preparado para futuro)
   * @param {Object} data - Datos a analizar
   * @param {Object} config - Configuración de AI
   * @returns {Promise<Array>} - Gráficos generados
   */
  async generateCharts(data, config = {}) {
    if (!isFeatureEnabled("CHARTS")) {
      throw new Error("Chart generation is not enabled");
    }

    const filteredConfig = getFilteredAIConfig(config);

    try {
      const response = await fetch(`${this.baseUrl}/analytics/charts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data,
          config: filteredConfig,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const result = await response.json();
      return this.processChartsResult(result);
    } catch (error) {
      console.error("Error generando gráficos:", error);
      throw error;
    }
  }

  /**
   * Genera KPIs usando AI (preparado para futuro)
   * @param {Object} data - Datos a analizar
   * @param {Object} config - Configuración de AI
   * @returns {Promise<Array>} - KPIs generados
   */
  async generateKPIs(data, config = {}) {
    if (!isFeatureEnabled("KPIS")) {
      throw new Error("KPI generation is not enabled");
    }

    const filteredConfig = getFilteredAIConfig(config);

    try {
      const response = await fetch(`${this.baseUrl}/analytics/kpis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data,
          config: filteredConfig,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const result = await response.json();
      return this.processKPIsResult(result);
    } catch (error) {
      console.error("Error generando KPIs:", error);
      throw error;
    }
  }

  /**
   * Genera tendencias usando AI (preparado para futuro)
   * @param {Object} data - Datos a analizar
   * @param {Object} config - Configuración de AI
   * @returns {Promise<Array>} - Tendencias generadas
   */
  async generateTrends(data, config = {}) {
    if (!isFeatureEnabled("TRENDS")) {
      throw new Error("Trend generation is not enabled");
    }

    const filteredConfig = getFilteredAIConfig(config);

    try {
      const response = await fetch(`${this.baseUrl}/analytics/trends`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data,
          config: filteredConfig,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const result = await response.json();
      return this.processTrendsResult(result);
    } catch (error) {
      console.error("Error generando tendencias:", error);
      throw error;
    }
  }

  /**
   * Procesa el resultado de narrativa
   * @param {Object} result - Resultado del servidor
   * @returns {Object} - Narrativa procesada
   */
  processNarrativeResult(result) {
    // Mapear las propiedades del backend (PascalCase) a frontend (camelCase)
    const mappedResult = {
      title: result.Title || result.title || "Análisis de Datos",
      content: result.Content || result.content || "",
      keyPoints: result.KeyPoints || result.keyPoints || [],
      sections: result.Sections || result.sections || {},
      generatedAt:
        result.GeneratedAt || result.generatedAt || new Date().toISOString(),
    };

    // Limpiar contenido JSON si es necesario
    if (mappedResult.content) {
      mappedResult.content = this.cleanNarrativeContent(mappedResult.content);
    }

    return mappedResult;
  }

  /**
   * Procesa el resultado de análisis
   * @param {Object} result - Resultado del servidor
   * @param {Object} config - Configuración utilizada
   * @returns {Object} - Análisis procesado
   */
  processAnalysisResult(result, config) {
    const processedResult = {
      narrative: null,
      suggestions: result.suggestions || [],
      confidence: result.confidence || 0.8,
      metadata: {
        analysisType: config.analysisType,
        language: config.language,
        tone: config.tone,
        timestamp: new Date().toISOString(),
      },
    };

    // Procesar narrativa si está habilitada
    if (config.includeNarrative && result.narrative) {
      processedResult.narrative = this.processNarrativeResult(result.narrative);
    }

    return processedResult;
  }

  /**
   * Procesa el resultado de gráficos (preparado para futuro)
   * @param {Object} result - Resultado del servidor
   * @returns {Array} - Gráficos procesados
   */
  processChartsResult(result) {
    return result.charts || result.Charts || [];
  }

  /**
   * Procesa el resultado de KPIs (preparado para futuro)
   * @param {Object} result - Resultado del servidor
   * @returns {Array} - KPIs procesados
   */
  processKPIsResult(result) {
    return result.kpis || result.KPIs || [];
  }

  /**
   * Procesa el resultado de tendencias (preparado para futuro)
   * @param {Object} result - Resultado del servidor
   * @returns {Array} - Tendencias procesadas
   */
  processTrendsResult(result) {
    return result.trends || result.Trends || [];
  }

  /**
   * Limpia el contenido de narrativa de posibles formatos JSON
   * @param {string} content - Contenido a limpiar
   * @returns {string} - Contenido limpio
   */
  cleanNarrativeContent(content) {
    if (!content) return content;

    try {
      // Caso 1: Array con objeto que contiene JSON como string
      if (content.startsWith("[{") && content.includes('"text"')) {
        const jsonArray = JSON.parse(content);
        if (jsonArray.length > 0 && jsonArray[0].text) {
          let textContent = jsonArray[0].text;

          // Si el text contiene JSON dentro de markdown
          if (textContent.includes("```json")) {
            const jsonMatch = textContent.match(
              /```json\s*(\{[\s\S]*?\})\s*```/
            );
            if (jsonMatch) {
              const jsonContent = JSON.parse(jsonMatch[1]);
              return jsonContent.content || jsonContent.text || textContent;
            }
          } else if (textContent.startsWith("{") && textContent.endsWith("}")) {
            // Si el text es JSON directo
            const jsonContent = JSON.parse(textContent);
            return jsonContent.content || jsonContent.text || textContent;
          } else {
            // Si el text es texto plano
            return textContent;
          }
        }
      }
      // Caso 2: JSON dentro de markdown
      else if (content.includes("```json")) {
        const jsonMatch = content.match(/```json\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
          const jsonContent = JSON.parse(jsonMatch[1]);
          return jsonContent.content || jsonContent.text || content;
        }
      }
      // Caso 3: JSON directo
      else if (content.startsWith("{") && content.endsWith("}")) {
        const jsonContent = JSON.parse(content);
        return jsonContent.content || jsonContent.text || content;
      }
      // Caso 4: Array de objetos JSON (formato antiguo)
      else if (content.startsWith("[{") && content.endsWith("}]")) {
        const jsonArray = JSON.parse(content);
        if (jsonArray.length > 0 && jsonArray[0].text) {
          return jsonArray[0].text;
        }
      }
    } catch (error) {
      console.warn("⚠️ Error parseando contenido JSON:", error);
    }

    return content;
  }

  /**
   * Obtiene la configuración por defecto de AI
   * @returns {Object} - Configuración por defecto
   */
  getDefaultConfig() {
    return getFilteredAIConfig();
  }

  /**
   * Valida si una funcionalidad está habilitada
   * @param {string} feature - Nombre de la funcionalidad
   * @returns {boolean} - Si está habilitada
   */
  isFeatureEnabled(feature) {
    return isFeatureEnabled(feature);
  }
}

// Exportar una instancia singleton
export const aiService = new AIService();

// Exportar también la clase para testing
export { AIService };
