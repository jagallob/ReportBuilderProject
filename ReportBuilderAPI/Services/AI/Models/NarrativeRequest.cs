using System.Text.Json.Serialization;

namespace ReportBuilderAPI.Services.AI.Models
{
    /// <summary>
    /// Define la solicitud para el endpoint de generación de narrativa.
    /// </summary>
    public class NarrativeRequest
    {
        // Asumiendo que AnalysisResult es el objeto que devuelve el servicio de análisis
        [JsonPropertyName("analysis")]
        public AnalysisResult Analysis { get; set; } = new();

        [JsonPropertyName("config")]
        public AIConfiguration Config { get; set; } = new();

        [JsonPropertyName("templateId")]
        public string TemplateId { get; set; } = string.Empty;
    }
}