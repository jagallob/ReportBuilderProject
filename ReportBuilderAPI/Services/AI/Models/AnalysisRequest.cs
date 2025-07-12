using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace ReportBuilderAPI.Services.AI.Models
{
    /// <summary>
    /// Define la solicitud para el endpoint de análisis de datos.
    /// </summary>
    public class AnalysisRequest
    {
        [JsonPropertyName("data")]
        public List<Dictionary<string, object>> Data { get; set; } = new();

        [JsonPropertyName("config")]
        public AIConfiguration Config { get; set; } = new();
    }
}