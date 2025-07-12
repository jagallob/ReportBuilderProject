namespace ReportBuilderAPI.Services.MCP.Models
{
    public class MCPRequest
    {
        public string Method { get; set; } = string.Empty;
        public Dictionary<string, object> Parameters { get; set; } = new();
        public string Context { get; set; } = string.Empty;
        public int MaxTokens { get; set; } = 4000;
    }

    public class MCPResponse
    {
        public string Content { get; set; } = string.Empty;
        public Dictionary<string, object> Metadata { get; set; } = new();
        public bool Success { get; set; }
        public string Error { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class MCPContext
    {
        public int ReportId { get; set; }
        public string ReportType { get; set; } = string.Empty;
        public Dictionary<string, object> HistoricalData { get; set; } = new();
        public List<string> Templates { get; set; } = new();
        public Dictionary<string, string> Prompts { get; set; } = new();
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }

    public class MCPContextUpdateRequest
    {
        public int ReportId { get; set; }
        public string ReportType { get; set; } = string.Empty;
        public Dictionary<string, object> HistoricalData { get; set; } = new();
        public List<string> Templates { get; set; } = new();
        public Dictionary<string, string> Prompts { get; set; } = new();
    }

    public class MCPQueryRequest
    {
        public int ReportId { get; set; }
        public string Query { get; set; } = string.Empty;
        public Dictionary<string, object> AdditionalParams { get; set; } = new();
    }

    public class MCPQueryResult
    {
        public bool Success { get; set; }
        public string Content { get; set; } = string.Empty;
        public string ErrorMessage { get; set; } = string.Empty;
        public Dictionary<string, object> Metadata { get; set; } = new();
    }

    public class MCPHealth
    {
        public bool Healthy { get; set; }
        public string Message { get; set; } = string.Empty;
        public Dictionary<string, object> Metrics { get; set; } = new();
        public DateTime CheckedAt { get; set; } = DateTime.UtcNow;
    }
}