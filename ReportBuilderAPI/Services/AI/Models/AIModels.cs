using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace ReportBuilderAPI.Services.AI.Models
{
    /// <summary>
    /// Representa las opciones de configuración para una solicitud de análisis de IA.
    /// </summary>
    public class AIRequestConfig
    {
        [JsonPropertyName("analysisType")]
        public string AnalysisType { get; set; } = string.Empty;

        [JsonPropertyName("includeCharts")]
        public bool IncludeCharts { get; set; }

        [JsonPropertyName("includeKPIs")]
        public bool IncludeKPIs { get; set; }

        [JsonPropertyName("includeTrends")]
        public bool IncludeTrends { get; set; }

        [JsonPropertyName("includeNarrative")]
        public bool IncludeNarrative { get; set; }

        [JsonPropertyName("chartTypes")]
        public List<string> ChartTypes { get; set; } = new();

        [JsonPropertyName("kpiTypes")]
        public List<string> KpiTypes { get; set; } = new();

        [JsonPropertyName("language")]
        public string Language { get; set; } = string.Empty;

        [JsonPropertyName("tone")]
        public string Tone { get; set; } = string.Empty;
    }

    public class AnalysisResult
    {
        public int ReportId { get; set; }
        public string Summary { get; set; } = string.Empty;
        public List<Insight> Insights { get; set; } = new();
        public List<Trend> Trends { get; set; } = new();
        public Dictionary<string, object> Metrics { get; set; } = new();
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }

    public class Insight
    {
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Severity { get; set; } = "Info"; // Info, Warning, Critical
        public double Confidence { get; set; }
        public Dictionary<string, object> Metadata { get; set; } = new();
    }

    public class Trend
    {
        public string Metric { get; set; } = string.Empty;
        public string Direction { get; set; } = string.Empty; // Up, Down, Stable
        public double ChangePercentage { get; set; }
        public string Period { get; set; } = string.Empty;
        public List<DataPoint> DataPoints { get; set; } = new();
    }

    public class DataPoint
    {
        public DateTime Date { get; set; }
        public double Value { get; set; }
        public string Label { get; set; } = string.Empty;
    }

    public class NarrativeResult
    {
        public string Content { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public List<string> KeyPoints { get; set; } = new();
        public Dictionary<string, string> Sections { get; set; } = new();
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }

    public class NarrativeTemplate
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Language { get; set; } = "es";
        public string Style { get; set; } = "Professional";
    }

    public class CustomizeNarrativeRequest
    {
        public string NarrativeId { get; set; } = string.Empty;
        public Dictionary<string, object> Modifications { get; set; } = new();
        public string? Reviewer { get; set; }
        public string? Comments { get; set; }
    }

    public class NarrativeSuggestion
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public double RelevanceScore { get; set; }
    }
}