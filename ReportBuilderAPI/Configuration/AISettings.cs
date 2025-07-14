namespace ReportBuilderAPI.Configuration
{
    /// <summary>
    /// Contiene la configuración de la aplicación para los servicios de IA, cargada desde appsettings.json.
    /// </summary>
    public class AISettings
    {
        public OpenAIConfig OpenAI { get; set; } = new();
    }

    public class OpenAIConfig
    {
        public string ApiKey { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string EmbeddingModel { get; set; } = string.Empty;
        public double Temperature { get; set; } = 0.7;
        public int MaxTokens { get; set; } = 1500;
    }
}
