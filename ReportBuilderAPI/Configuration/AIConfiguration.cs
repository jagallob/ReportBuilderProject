namespace ReportBuilderAPI.Configuration
{
    /// <summary>
    /// Contiene toda la configuración relacionada con los servicios de IA.
    /// </summary>
    public class AIConfiguration
    {
        public OpenAIConfig OpenAI { get; set; } = new();
    }

    public class OpenAIConfig
    {
        public string ApiKey { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string EmbeddingModel { get; set; } = string.Empty;
        public double Temperature { get; set; }
        public int MaxTokens { get; set; }
    }
}