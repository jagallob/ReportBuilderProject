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
        public string AnalysisType { get; set; } = string.Empty;

        public AIConfiguration()
        {
            ChartTypes = new List<string>();
            KpiTypes = new List<string>();
            Language = string.Empty;
            Tone = string.Empty;
        }

        [JsonPropertyName("includeCharts")]
        public bool IncludeCharts { get; set; }

        [JsonPropertyName("includeKPIs")]
        public bool IncludeKPIs { get; set; }

        [JsonPropertyName("includeTrends")]
        public bool IncludeTrends { get; set; }

        [JsonPropertyName("includeNarrative")]
        public bool IncludeNarrative { get; set; }

        [JsonPropertyName("chartTypes")]
        public List<string> ChartTypes { get; set; } = new List<string>();

        [JsonPropertyName("kpiTypes")]
        public List<string> KpiTypes { get; set; } = new List<string>();

        [JsonPropertyName("language")]
        public string Language { get; set; } = string.Empty;

        [JsonPropertyName("tone")]
        public string Tone { get; set; } = string.Empty;
    }
}