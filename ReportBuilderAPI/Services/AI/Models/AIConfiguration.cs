using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace ReportBuilderAPI.Services.AI.Models
{
    /// <summary>
    /// Representa las opciones de configuración para una solicitud de análisis de IA.
    /// Diseñado para ser extensible y mantener compatibilidad hacia atrás.
    /// </summary>
    public class AIConfiguration
    {
        [JsonPropertyName("analysisType")]
        public string AnalysisType { get; set; } = string.Empty;

        public AIConfiguration()
        {
            Language = string.Empty;
            Tone = string.Empty;
            
            // Configuraciones específicas (preparadas para futuro)
            ChartTypes = new List<string> { "bar", "line", "pie", "area" };
            KpiTypes = new List<string> { "sum", "avg", "max", "min", "count", "percentage" };
            TrendPeriods = new List<string> { "daily", "weekly", "monthly", "quarterly" };
        }

        // Funcionalidades principales (siempre activas)
        [JsonPropertyName("includeNarrative")]
        public bool IncludeNarrative { get; set; } = true;

        [JsonPropertyName("language")]
        public string Language { get; set; } = string.Empty;

        [JsonPropertyName("tone")]
        public string Tone { get; set; } = string.Empty;

        // Funcionalidades extendidas (preparadas para futuro)
        [JsonPropertyName("includeCharts")]
        public bool IncludeCharts { get; set; } = false;

        [JsonPropertyName("includeKPIs")]
        public bool IncludeKPIs { get; set; } = false;

        [JsonPropertyName("includeTrends")]
        public bool IncludeTrends { get; set; } = false;

        [JsonPropertyName("includePatterns")]
        public bool IncludePatterns { get; set; } = false;

        [JsonPropertyName("includeRecommendations")]
        public bool IncludeRecommendations { get; set; } = false;

        // Configuraciones avanzadas (preparadas para futuro)
        [JsonPropertyName("advancedAnalysis")]
        public bool AdvancedAnalysis { get; set; } = false;

        [JsonPropertyName("multiLanguage")]
        public bool MultiLanguage { get; set; } = true;

        [JsonPropertyName("toneCustomization")]
        public bool ToneCustomization { get; set; } = true;

        // Configuraciones específicas (preparadas para futuro)
        [JsonPropertyName("chartTypes")]
        public List<string> ChartTypes { get; set; } = new List<string>();

        [JsonPropertyName("kpiTypes")]
        public List<string> KpiTypes { get; set; } = new List<string>();

        [JsonPropertyName("trendPeriods")]
        public List<string> TrendPeriods { get; set; } = new List<string>();

        /// <summary>
        /// Valida si la configuración es válida para el análisis actual
        /// </summary>
        /// <returns>True si la configuración es válida</returns>
        public bool IsValid()
        {
            return !string.IsNullOrEmpty(AnalysisType) && 
                   !string.IsNullOrEmpty(Language) && 
                   !string.IsNullOrEmpty(Tone);
        }

        /// <summary>
        /// Obtiene las funcionalidades habilitadas
        /// </summary>
        /// <returns>Lista de funcionalidades habilitadas</returns>
        public List<string> GetEnabledFeatures()
        {
            var features = new List<string>();
            
            if (IncludeNarrative) features.Add("Narrative");
            if (IncludeCharts) features.Add("Charts");
            if (IncludeKPIs) features.Add("KPIs");
            if (IncludeTrends) features.Add("Trends");
            if (IncludePatterns) features.Add("Patterns");
            if (IncludeRecommendations) features.Add("Recommendations");
            
            return features;
        }

        /// <summary>
        /// Obtiene la configuración mínima para narrativa
        /// </summary>
        /// <returns>Configuración mínima</returns>
        public static AIConfiguration GetNarrativeOnly()
        {
            return new AIConfiguration
            {
                AnalysisType = "comprehensive",
                Language = "es",
                Tone = "professional",
                IncludeNarrative = true,
                IncludeCharts = false,
                IncludeKPIs = false,
                IncludeTrends = false,
                IncludePatterns = false,
                IncludeRecommendations = false,
                AdvancedAnalysis = false
            };
        }
    }
}