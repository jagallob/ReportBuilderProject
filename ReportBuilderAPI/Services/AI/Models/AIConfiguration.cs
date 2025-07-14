using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace ReportBuilderAPI.Services.AI.Models
{
    /// <summary>
    /// Representa las opciones de configuración para una solicitud de análisis de IA.
    /// </summary>
    public class AIConfiguration
    {
        [JsonPropertyName("analysisType")]
        public string AnalysisType { get; set; }

        [JsonPropertyName("includeCharts")]
        public bool IncludeCharts { get; set; }

        [JsonPropertyName("includeKPIs")]
        public bool IncludeKPIs { get; set; }

        [JsonPropertyName("includeTrends")]
        public bool IncludeTrends { get; set; }

        [JsonPropertyName("includeNarrative")]
        public bool IncludeNarrative { get; set; }

        [JsonPropertyName("chartTypes")]
        public List<string> ChartTypes { get; set; }

        [JsonPropertyName("kpiTypes")]
        public List<string> KpiTypes { get; set; }

        [JsonPropertyName("language")]
        public string Language { get; set; }

        [JsonPropertyName("tone")]
        public string Tone { get; set; }
    }
}