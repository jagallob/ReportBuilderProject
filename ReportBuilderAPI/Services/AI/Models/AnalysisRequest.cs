using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace ReportBuilderAPI.Services.AI.Models
{
    /// <summary>
    /// Define la solicitud para el endpoint de análisis de datos.
    /// Esta clase es un DTO (Data Transfer Object) que debe coincidir con el payload enviado desde el frontend.
    /// </summary>
    public class AnalysisRequest
    {
        [JsonPropertyName("Data")]
        public List<List<object>> Data { get; set; } = new List<List<object>>();

        public AnalysisRequest()
        {
            Config = new AIConfiguration();
        }

        [JsonPropertyName("Config")]
        public AIConfiguration Config { get; set; } = new AIConfiguration();
    }
}