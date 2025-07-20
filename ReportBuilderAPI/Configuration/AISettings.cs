namespace ReportBuilderAPI.Configuration
{
    /// <summary>
    /// Contiene la configuración de la aplicación para los servicios de IA, cargada desde appsettings.json.
    /// </summary>
    public class AISettings
    {
        public OpenAIConfig OpenAI { get; set; } = new();
        public DeepSeekConfig DeepSeek { get; set; } = new();
        public OllamaConfig Ollama { get; set; } = new();
        public AnthropicConfig Anthropic { get; set; } = new();
    }

    public class OpenAIConfig
    {
        public string ApiKey { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string EmbeddingModel { get; set; } = string.Empty;
        public double Temperature { get; set; } = 0.7;
        public int MaxTokens { get; set; } = 1500;
    }

    public class DeepSeekConfig
    {
        public string ApiKey { get; set; } = string.Empty;
        public string Model { get; set; } = "deepseek-chat";
        public double Temperature { get; set; } = 0.7;
        public int MaxTokens { get; set; } = 2000;
        public string Endpoint { get; set; } = "https://api.deepseek.com/v1/chat/completions";
    }

    public class OllamaConfig
    {
        public string Endpoint { get; set; } = "http://localhost:11434";
        public string Model { get; set; } = "tinyllama:1.1b";
        public string EmbeddingModel { get; set; } = "nomic-embed-text";
        public double Temperature { get; set; } = 0.7;
        public int MaxTokens { get; set; } = 1500;
        public int TimeoutSeconds { get; set; } = 600;
        public bool StreamResponse { get; set; } = true;
    }

    public class AnthropicConfig
    {
        public string ApiKey { get; set; } = string.Empty;
        public string Model { get; set; } = "claude-sonnet-4-20250514";
        public double Temperature { get; set; } = 0.7;
        public int MaxTokens { get; set; } = 4000;
        public int TimeoutSeconds { get; set; } = 60;
        public string Endpoint { get; set; } = "https://api.anthropic.com/v1/messages";
    }
}