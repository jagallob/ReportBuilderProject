# Guía de Implementación Completa: IA y MCP en ReportBuilder

## Tabla de Contenidos

1. [Prerrequisitos](#prerrequisitos)
2. [Fase 1: Backend - AI Service Layer](#fase-1-backend---ai-service-layer)
3. [Fase 2: Configuración de Servicios Externos](#fase-2-configuración-de-servicios-externos)
4. [Fase 3: Implementación MCP](#fase-3-implementación-mcp)
5. [Fase 4: Nuevos Endpoints API](#fase-4-nuevos-endpoints-api)
6. [Fase 5: Frontend - Componentes React](#fase-5-frontend---componentes-react)
7. [Fase 6: Flujo de Procesamiento IA](#fase-6-flujo-de-procesamiento-ia)
8. [Fase 7: Testing y Validación](#fase-7-testing-y-validación)
9. [Fase 8: Deployment](#fase-8-deployment)

---

## Prerrequisitos

### Cuentas y APIs Necesarias

- [ ] Cuenta OpenAI (para GPT-4)
- [ ] Cuenta Anthropic (para Claude)
- [ ] Cuenta Pinecone (Vector Store)
- [ ] Redis Server (para caching y queues)

### Versiones de Software

- [ ] .NET 7 SDK
- [ ] Node.js >= 18
- [ ] PostgreSQL >= 12
- [ ] Redis >= 6.0

---

## Fase 1: Backend - AI Service Layer

### 1.1 Actualizar Dependencias del Backend

**Archivo:** `ReportBuilderAPI/ReportBuilderAPI.csproj`

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <!-- Dependencias existentes... -->

  <!-- Nuevas dependencias para IA -->
  <ItemGroup>
    <PackageReference Include="Microsoft.ML" Version="3.0.1" />
    <PackageReference Include="OpenAI" Version="1.11.0" />
    <PackageReference Include="Anthropic.SDK" Version="0.1.0" />
    <PackageReference Include="Pinecone.Client" Version="2.0.0" />
    <PackageReference Include="Microsoft.Extensions.VectorData" Version="8.0.0" />
    <PackageReference Include="StackExchange.Redis" Version="2.7.4" />
    <PackageReference Include="Microsoft.Extensions.Caching.StackExchangeRedis" Version="7.0.0" />
    <PackageReference Include="Newtonsoft.Json" Version="13.0.3" />
    <PackageReference Include="Microsoft.Extensions.Http" Version="7.0.0" />
  </ItemGroup>
</Project>
```

### 1.2 Configuración appsettings.json

**Archivo:** `ReportBuilderAPI/appsettings.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=ReportBuilderDB;Username=postgres;Password=yourpassword;",
    "Redis": "localhost:6379"
  },
  "JwtSettings": {
    // Configuración JWT existente...
  },
  "AI": {
    "OpenAI": {
      "ApiKey": "sk-your-openai-key",
      "Model": "gpt-4-turbo-preview",
      "MaxTokens": 4000,
      "Temperature": 0.7
    },
    "Anthropic": {
      "ApiKey": "sk-ant-your-anthropic-key",
      "Model": "claude-3-sonnet-20240229",
      "MaxTokens": 4000
    },
    "VectorStore": {
      "Provider": "Pinecone",
      "ApiKey": "your-pinecone-api-key",
      "Environment": "us-east-1-aws",
      "IndexName": "reportbuilder-vectors",
      "Dimension": 1536
    }
  },
  "MCP": {
    "ServerUrl": "http://localhost:8000",
    "MaxContextLength": 32000,
    "EnableCaching": true,
    "CacheExpirationMinutes": 60
  },
  "Processing": {
    "MaxConcurrentAnalysis": 5,
    "TimeoutMinutes": 10,
    "RetryAttempts": 3
  }
}
```

### 1.3 Crear Modelos de Datos para IA

**Archivo:** `ReportBuilderAPI/Models/AI/AnalysisResult.cs`

```csharp
using System.ComponentModel.DataAnnotations;

namespace ReportBuilderAPI.Models.AI
{
    public class AnalysisResult
    {
        public int Id { get; set; }
        public int ReportId { get; set; }
        public string AnalysisType { get; set; } = string.Empty;
        public string Insights { get; set; } = string.Empty;
        public string Recommendations { get; set; } = string.Empty;
        public double ConfidenceScore { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string Metadata { get; set; } = "{}";

        // Navigation properties
        public virtual Report? Report { get; set; }
    }

    public class NarrativeTemplate
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string PromptTemplate { get; set; } = string.Empty;
        public string OutputFormat { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class VectorEmbedding
    {
        public int Id { get; set; }
        public string DocumentId { get; set; } = string.Empty;
        public string DocumentType { get; set; } = string.Empty;
        public float[] Embedding { get; set; } = Array.Empty<float>();
        public string Content { get; set; } = string.Empty;
        public string Metadata { get; set; } = "{}";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
```

### 1.4 DTOs para IA

**Archivo:** `ReportBuilderAPI/DTOs/AI/AnalysisRequestDto.cs`

```csharp
namespace ReportBuilderAPI.DTOs.AI
{
    public class AnalysisRequestDto
    {
        public int ReportId { get; set; }
        public string AnalysisType { get; set; } = string.Empty;
        public Dictionary<string, object> Parameters { get; set; } = new();
        public bool IncludeHistoricalContext { get; set; } = true;
    }

    public class AnalysisResponseDto
    {
        public int Id { get; set; }
        public string Insights { get; set; } = string.Empty;
        public string Recommendations { get; set; } = string.Empty;
        public double ConfidenceScore { get; set; }
        public List<string> KeyFindings { get; set; } = new();
        public Dictionary<string, object> Metadata { get; set; } = new();
    }

    public class NarrativeRequestDto
    {
        public int ReportId { get; set; }
        public int TemplateId { get; set; }
        public Dictionary<string, object> Context { get; set; } = new();
        public string Tone { get; set; } = "Professional";
        public int MaxWords { get; set; } = 500;
    }

    public class NarrativeResponseDto
    {
        public string GeneratedText { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public List<string> KeyPoints { get; set; } = new();
        public double QualityScore { get; set; }
    }
}
```

### 1.5 Interfaces de Servicios IA

**Archivo:** `ReportBuilderAPI/Services/AI/IAnalyticsService.cs`

```csharp
using ReportBuilderAPI.DTOs.AI;

namespace ReportBuilderAPI.Services.AI
{
    public interface IAnalyticsService
    {
        Task<AnalysisResponseDto> AnalyzeReportDataAsync(AnalysisRequestDto request);
        Task<List<string>> DetectTrendsAsync(int reportId, TimeSpan period);
        Task<List<string>> DetectAnomaliesAsync(int reportId);
        Task<Dictionary<string, double>> CalculateKPIsAsync(int reportId);
        Task<List<string>> GenerateInsightsAsync(int reportId);
        Task<double> CalculateConfidenceScoreAsync(Dictionary<string, object> data);
    }

    public interface INarrativeService
    {
        Task<NarrativeResponseDto> GenerateNarrativeAsync(NarrativeRequestDto request);
        Task<List<string>> GetAvailableTemplatesAsync();
        Task<string> CustomizeTemplateAsync(int templateId, Dictionary<string, object> parameters);
        Task<List<string>> GenerateSuggestionsAsync(int reportId);
        Task<string> SummarizeReportAsync(int reportId, int maxWords = 200);
    }

    public interface IMCPClientService
    {
        Task<string> QueryWithContextAsync(string query, Dictionary<string, object> context);
        Task UpdateContextAsync(string contextId, Dictionary<string, object> data);
        Task<Dictionary<string, object>> GetContextAsync(string contextId);
        Task<bool> IsHealthyAsync();
    }

    public interface IVectorService
    {
        Task<string> StoreEmbeddingAsync(string content, string documentType, Dictionary<string, object> metadata);
        Task<List<(string content, double similarity)>> SearchSimilarAsync(string query, int topK = 5);
        Task<float[]> GenerateEmbeddingAsync(string text);
        Task DeleteEmbeddingAsync(string documentId);
    }
}
```

### 1.6 Implementación del Analytics Service

**Archivo:** `ReportBuilderAPI/Services/AI/AnalyticsService.cs`

```csharp
using Microsoft.Extensions.Options;
using OpenAI_API;
using ReportBuilderAPI.DTOs.AI;
using ReportBuilderAPI.Services.AI;
using ReportBuilderAPI.Data;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace ReportBuilderAPI.Services.AI
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly ApplicationDbContext _context;
        private readonly OpenAIAPI _openAIApi;
        private readonly IVectorService _vectorService;
        private readonly ILogger<AnalyticsService> _logger;
        private readonly AIConfiguration _aiConfig;

        public AnalyticsService(
            ApplicationDbContext context,
            IOptions<AIConfiguration> aiConfig,
            IVectorService vectorService,
            ILogger<AnalyticsService> logger)
        {
            _context = context;
            _vectorService = vectorService;
            _logger = logger;
            _aiConfig = aiConfig.Value;
            _openAIApi = new OpenAIAPI(_aiConfig.OpenAI.ApiKey);
        }

        public async Task<AnalysisResponseDto> AnalyzeReportDataAsync(AnalysisRequestDto request)
        {
            try
            {
                _logger.LogInformation($"Starting analysis for report {request.ReportId}");

                // 1. Obtener datos del reporte
                var report = await _context.Reports
                    .Include(r => r.ReportData)
                    .FirstOrDefaultAsync(r => r.Id == request.ReportId);

                if (report == null)
                    throw new ArgumentException($"Report with ID {request.ReportId} not found");

                // 2. Preparar contexto para IA
                var context = PrepareAnalysisContext(report, request);

                // 3. Generar insights usando OpenAI
                var insights = await GenerateInsightsWithAI(context, request.AnalysisType);

                // 4. Calcular score de confianza
                var confidenceScore = await CalculateConfidenceScoreAsync(context);

                // 5. Extraer recomendaciones
                var recommendations = await ExtractRecommendations(insights);

                // 6. Guardar resultado
                var analysisResult = new AnalysisResult
                {
                    ReportId = request.ReportId,
                    AnalysisType = request.AnalysisType,
                    Insights = insights,
                    Recommendations = JsonConvert.SerializeObject(recommendations),
                    ConfidenceScore = confidenceScore,
                    Metadata = JsonConvert.SerializeObject(request.Parameters)
                };

                _context.AnalysisResults.Add(analysisResult);
                await _context.SaveChangesAsync();

                return new AnalysisResponseDto
                {
                    Id = analysisResult.Id,
                    Insights = insights,
                    Recommendations = string.Join("; ", recommendations),
                    ConfidenceScore = confidenceScore,
                    KeyFindings = await ExtractKeyFindings(insights),
                    Metadata = request.Parameters
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error analyzing report {request.ReportId}");
                throw;
            }
        }

        public async Task<List<string>> DetectTrendsAsync(int reportId, TimeSpan period)
        {
            var endDate = DateTime.UtcNow;
            var startDate = endDate - period;

            var historicalReports = await _context.Reports
                .Where(r => r.Id == reportId || (r.CreatedAt >= startDate && r.CreatedAt <= endDate))
                .Include(r => r.ReportData)
                .OrderBy(r => r.CreatedAt)
                .ToListAsync();

            if (historicalReports.Count < 2)
                return new List<string> { "Insufficient data for trend analysis" };

            var trendPrompt = BuildTrendAnalysisPrompt(historicalReports);
            var response = await _openAIApi.Completions.CreateCompletionAsync(new CompletionRequest
            {
                Prompt = trendPrompt,
                Model = _aiConfig.OpenAI.Model,
                MaxTokens = _aiConfig.OpenAI.MaxTokens,
                Temperature = _aiConfig.OpenAI.Temperature
            });

            return ParseTrendsResponse(response.Completions.First().Text);
        }

        public async Task<List<string>> DetectAnomaliesAsync(int reportId)
        {
            var report = await _context.Reports
                .Include(r => r.ReportData)
                .FirstOrDefaultAsync(r => r.Id == reportId);

            if (report?.ReportData == null)
                return new List<string>();

            // Implementar detección de anomalías usando ML.NET o reglas estadísticas
            var anomalies = new List<string>();

            // Ejemplo básico de detección de anomalías
            var numericData = ExtractNumericData(report.ReportData);
            foreach (var kvp in numericData)
            {
                if (IsAnomalous(kvp.Value, await GetHistoricalAverage(kvp.Key)))
                {
                    anomalies.Add($"Anomalous value detected in {kvp.Key}: {kvp.Value}");
                }
            }

            return anomalies;
        }

        public async Task<Dictionary<string, double>> CalculateKPIsAsync(int reportId)
        {
            var report = await _context.Reports
                .Include(r => r.ReportData)
                .FirstOrDefaultAsync(r => r.Id == reportId);

            if (report?.ReportData == null)
                return new Dictionary<string, double>();

            var kpis = new Dictionary<string, double>();
            var data = JsonConvert.DeserializeObject<Dictionary<string, object>>(report.ReportData.JsonData ?? "{}");

            // Calcular KPIs básicos
            foreach (var item in data.Where(d => IsNumeric(d.Value)))
            {
                if (double.TryParse(item.Value.ToString(), out double value))
                {
                    kpis[$"avg_{item.Key}"] = value;
                    kpis[$"growth_rate_{item.Key}"] = await CalculateGrowthRate(item.Key, value);
                }
            }

            return kpis;
        }

        public async Task<List<string>> GenerateInsightsAsync(int reportId)
        {
            var kpis = await CalculateKPIsAsync(reportId);
            var trends = await DetectTrendsAsync(reportId, TimeSpan.FromDays(90));
            var anomalies = await DetectAnomaliesAsync(reportId);

            var insights = new List<string>();
            insights.AddRange(trends);
            insights.AddRange(anomalies);

            // Agregar insights basados en KPIs
            foreach (var kpi in kpis.Where(k => Math.Abs(k.Value) > 0.1))
            {
                insights.Add($"Significant change in {kpi.Key}: {kpi.Value:P2}");
            }

            return insights;
        }

        public async Task<double> CalculateConfidenceScoreAsync(Dictionary<string, object> data)
        {
            var score = 1.0;
            var dataQuality = CalculateDataQuality(data);
            var sampleSize = data.Count;
            var completeness = CalculateCompleteness(data);

            score *= dataQuality;
            score *= Math.Min(1.0, sampleSize / 100.0); // Penalizar muestras pequeñas
            score *= completeness;

            return Math.Max(0.0, Math.Min(1.0, score));
        }

        // Métodos privados auxiliares
        private Dictionary<string, object> PrepareAnalysisContext(Report report, AnalysisRequestDto request)
        {
            var context = new Dictionary<string, object>
            {
                ["reportId"] = report.Id,
                ["reportTitle"] = report.Title,
                ["createdAt"] = report.CreatedAt,
                ["data"] = report.ReportData?.JsonData ?? "{}",
                ["analysisType"] = request.AnalysisType,
                ["parameters"] = request.Parameters
            };

            return context;
        }

        private async Task<string> GenerateInsightsWithAI(Dictionary<string, object> context, string analysisType)
        {
            var prompt = BuildAnalysisPrompt(context, analysisType);

            var response = await _openAIApi.Completions.CreateCompletionAsync(new CompletionRequest
            {
                Prompt = prompt,
                Model = _aiConfig.OpenAI.Model,
                MaxTokens = _aiConfig.OpenAI.MaxTokens,
                Temperature = _aiConfig.OpenAI.Temperature
            });

            return response.Completions.First().Text.Trim();
        }

        private string BuildAnalysisPrompt(Dictionary<string, object> context, string analysisType)
        {
            return $@"
Analyze the following report data and provide insights for {analysisType} analysis:

Report Data: {JsonConvert.SerializeObject(context, Formatting.Indented)}

Please provide:
1. Key insights and patterns
2. Notable trends or changes
3. Potential concerns or opportunities
4. Data-driven recommendations

Format your response in clear, actionable bullet points.
";
        }

        private async Task<List<string>> ExtractRecommendations(string insights)
        {
            // Extraer recomendaciones del texto de insights usando patrones o IA adicional
            var recommendations = new List<string>();
            var lines = insights.Split('\n', StringSplitOptions.RemoveEmptyEntries);

            foreach (var line in lines)
            {
                if (line.ToLower().Contains("recommend") || line.ToLower().Contains("should") || line.ToLower().Contains("consider"))
                {
                    recommendations.Add(line.Trim());
                }
            }

            return recommendations;
        }

        private async Task<List<string>> ExtractKeyFindings(string insights)
        {
            var findings = new List<string>();
            var lines = insights.Split('\n', StringSplitOptions.RemoveEmptyEntries);

            foreach (var line in lines)
            {
                if (line.StartsWith("•") || line.StartsWith("-") || line.StartsWith("*"))
                {
                    findings.Add(line.Trim().TrimStart('•', '-', '*').Trim());
                }
            }

            return findings.Take(5).ToList(); // Limitar a 5 hallazgos principales
        }

        private string BuildTrendAnalysisPrompt(List<Report> historicalReports)
        {
            var dataPoints = historicalReports.Select(r => new
            {
                Date = r.CreatedAt,
                Data = r.ReportData?.JsonData ?? "{}"
            });

            return $@"
Analyze the following time series data to identify trends:

{JsonConvert.SerializeObject(dataPoints, Formatting.Indented)}

Identify:
1. Upward or downward trends
2. Seasonal patterns
3. Significant changes
4. Forecast implications

Provide concise trend insights:
";
        }

        private List<string> ParseTrendsResponse(string response)
        {
            return response.Split('\n', StringSplitOptions.RemoveEmptyEntries)
                          .Where(line => !string.IsNullOrWhiteSpace(line))
                          .Select(line => line.Trim())
                          .ToList();
        }

        private Dictionary<string, double> ExtractNumericData(ReportData reportData)
        {
            var result = new Dictionary<string, double>();
            var data = JsonConvert.DeserializeObject<Dictionary<string, object>>(reportData.JsonData ?? "{}");

            foreach (var kvp in data)
            {
                if (double.TryParse(kvp.Value?.ToString(), out double value))
                {
                    result[kvp.Key] = value;
                }
            }

            return result;
        }

        private bool IsAnomalous(double value, double historicalAverage)
        {
            var threshold = Math.Abs(historicalAverage * 0.3); // 30% de desviación
            return Math.Abs(value - historicalAverage) > threshold;
        }

        private async Task<double> GetHistoricalAverage(string key)
        {
            // Implementar cálculo de promedio histórico
            var historicalData = await _context.Reports
                .Include(r => r.ReportData)
                .Where(r => r.CreatedAt >= DateTime.UtcNow.AddDays(-90))
                .Select(r => r.ReportData.JsonData)
                .ToListAsync();

            var values = new List<double>();
            foreach (var jsonData in historicalData)
            {
                var data = JsonConvert.DeserializeObject<Dictionary<string, object>>(jsonData ?? "{}");
                if (data.ContainsKey(key) && double.TryParse(data[key]?.ToString(), out double value))
                {
                    values.Add(value);
                }
            }

            return values.Any() ? values.Average() : 0.0;
        }

        private async Task<double> CalculateGrowthRate(string key, double currentValue)
        {
            var previousValue = await GetHistoricalAverage(key);
            if (previousValue == 0) return 0.0;

            return (currentValue - previousValue) / previousValue;
        }

        private bool IsNumeric(object value)
        {
            return double.TryParse(value?.ToString(), out _);
        }

        private double CalculateDataQuality(Dictionary<string, object> data)
        {
            if (!data.Any()) return 0.0;

            var validEntries = data.Count(d => d.Value != null && !string.IsNullOrEmpty(d.Value.ToString()));
            return (double)validEntries / data.Count;
        }

        private double CalculateCompleteness(Dictionary<string, object> data)
        {
            if (!data.Any()) return 0.0;

            var nonEmptyEntries = data.Count(d => d.Value != null &&
                                           !string.IsNullOrWhiteSpace(d.Value.ToString()) &&
                                           d.Value.ToString() != "0");
            return (double)nonEmptyEntries / data.Count;
        }
    }
}
```

### 1.7 Implementación del Narrative Service

**Archivo:** `ReportBuilderAPI/Services/AI/NarrativeService.cs`

```csharp
using Microsoft.Extensions.Options;
using Anthropic.SDK;
using ReportBuilderAPI.DTOs.AI;
using ReportBuilderAPI.Services.AI;
using ReportBuilderAPI.Data;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace ReportBuilderAPI.Services.AI
{
    public class NarrativeService : INarrativeService
    {
        private readonly ApplicationDbContext _context;
        private readonly AnthropicClient _anthropicClient;
        private readonly IAnalyticsService _analyticsService;
        private readonly ILogger<NarrativeService> _logger;
        private readonly AIConfiguration _aiConfig;

        public NarrativeService(
            ApplicationDbContext context,
            IOptions<AIConfiguration> aiConfig,
            IAnalyticsService analyticsService,
            ILogger<NarrativeService> logger)
        {
            _context = context;
            _analyticsService = analyticsService;
            _logger = logger;
            _aiConfig = aiConfig.Value;
            _anthropicClient = new AnthropicClient(_aiConfig.Anthropic.ApiKey);
        }

        public async Task<NarrativeResponseDto> GenerateNarrativeAsync(NarrativeRequestDto request)
        {
            try
            {
                _logger.LogInformation($"Generating narrative for report {request.ReportId}");

                // 1. Obtener template
                var template = await _context.NarrativeTemplates
                    .FirstOrDefaultAsync(t => t.Id == request.TemplateId && t.IsActive);

                if (template == null)
                    throw new ArgumentException($"Template with ID {request.TemplateId} not found");

                // 2. Obtener datos del reporte y análisis
                var report = await _context.Reports
                    .Include(r => r.ReportData)
                    .FirstOrDefaultAsync(r => r.Id == request.ReportId);

                var analysis = await _analyticsService.GenerateInsightsAsync(request.ReportId);

                // 3. Preparar contexto completo
                var fullContext = PrepareNarrativeContext(report, analysis, request.Context);

                // 4. Generar narrativa con Claude
                var narrative = await GenerateWithClaude(template.PromptTemplate, fullContext, request.Tone, request.MaxWords);

                // 5. Procesar y estructurar respuesta
                var summary = await ExtractSummary(narrative);
                var keyPoints = await ExtractKeyPoints(narrative);
                var qualityScore = CalculateQualityScore(narrative, request.MaxWords);

                return new NarrativeResponseDto
                {
                    GeneratedText = narrative,
                    Summary = summary,
                    KeyPoints = keyPoints,
                    QualityScore = qualityScore
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error generating narrative for report {request.ReportId}");
                throw;
            }
        }

        public async Task<List<string>> GetAvailableTemplatesAsync()
        {
            var templates = await _context.NarrativeTemplates
                .Where(t => t.IsActive)
                .Select(t => new { t.Id, t.Name, t.Description })
                .ToListAsync();

            return templates.Select(t => $"{t.Id}: {t.Name} - {t.Description}").ToList();
        }

        public async Task<string> CustomizeTemplateAsync(int templateId, Dictionary<string, object> parameters)
        {
            var template = await _context.NarrativeTemplates
                .FirstOrDefaultAsync(t => t.Id == templateId);

            if (template == null)
                return string.Empty;

            var customizedTemplate = template.PromptTemplate;

            // Reemplazar placeholders con parámetros
            foreach (var param in parameters)
            {
                customizedTemplate = customizedTemplate.Replace($"{{{param.Key}}}", param.Value?.ToString() ?? "");
            }

            return customizedTemplate;
        }

        public async Task<List<string>> GenerateSuggestionsAsync(int reportId)
        {
            var insights = await _analyticsService.GenerateInsightsAsync(reportId);
            var suggestions = new List<string>();

            var prompt = $@"
Based on the following report insights, suggest 5 specific narrative improvements or additional content that should be included:

Insights: {string.Join("\n", insights)}

Provide actionable suggestions for narrative enhancement:
";

            var response = await _anthropicClient.Messages.CreateAsync(new MessageRequest
            {
                Model = _aiConfig.Anthropic.Model,
                MaxTokens = 1000,
                Messages = new List<Message>
                {
                    new Message
                    {
                        Role = "user",
                        Content = prompt
                    }
                }
            });

            var suggestionText = response.Content.FirstOrDefault()?.Text ?? "";
            return ParseSuggestions(suggestionText);
        }

        public async Task<string> SummarizeReportAsync(int reportId, int maxWords = 200)
        {
            var report = await _context.Reports
                .Include(r => r.ReportData)
                .FirstOrDefaultAsync(r => r.Id == reportId);

            if (report == null)
                return "Report not found";

            var insights = await _analyticsService.GenerateInsightsAsync(reportId);

            var prompt = $@"
Create a concise executive summary ({maxWords} words maximum) for this report:

Title: {report.Title}
Data: {report.ReportData?.JsonData ?? "No data available"}
Key Insights: {string.Join("; ", insights)}

Focus on the most important findings and their implications:
";

            var response = await _anthropicClient.Messages.CreateAsync(new MessageRequest
            {
                Model = _aiConfig.Anthropic.Model,
                MaxTokens = maxWords * 2, // Buffer for processing
                Messages = new List<Message>
                {
                    new Message
                    {
                        Role = "user",
                        Content = prompt
                    }
                }
            });

            return response.Content.FirstOrDefault()?.Text?.Trim() ?? "Unable to generate summary";
        }

        // Métodos privados auxiliares
        private Dictionary<string, object> PrepareNarrativeContext(Report report, List<string> insights, Dictionary<string, object> additionalContext)
        {
            var context = new Dictionary<string, object>
            {
                ["reportTitle"] = report?.Title ?? "Untitled Report",
                ["reportDate"] = report?.CreatedAt.ToString("yyyy-MM-dd") ?? DateTime.Now.ToString("yyyy-MM-dd"),
                ["insights"] = insights,
                ["reportData"] = report?.ReportData?.JsonData ?? "{}",
                ["additionalContext"] = additionalContext
            };

            return context;
        }

        private async Task<string> GenerateWithClaude(string template, Dictionary<string, object> context, string tone, int maxWords)
        {
            var prompt = BuildNarrativePrompt(template, context, tone, maxWords);

            var response = await _anthropicClient.Messages.CreateAsync(new MessageRequest
            {
                Model = _aiConfig.Anthropic.Model,
                MaxTokens = _aiConfig.Anthropic.MaxTokens,
                Messages = new List<Message>
                {
                    new Message
                    {
                        Role = "user",
                        Content = prompt
                    }
                }
            });

            return response.Content.FirstOrDefault()?.Text?.Trim() ?? "Unable to generate narrative";
        }

        private string BuildNarrativePrompt(string template, Dictionary<string, object> context, string tone, int maxWords)
        {
            var contextJson = JsonConvert.SerializeObject(context, Formatting.Indented);

            return $@"
You are a professional report writer. Create a narrative using the following template and context.

Template: {template}

Context: {contextJson}

Requirements:
- Tone: {tone}
- Maximum words: {maxWords}
- Use clear, professional language
- Include specific data points and insights
- Structure with clear paragraphs
- Focus on actionable information

Generate the narrative:
";
        }

        private async Task<string> ExtractSummary(string narrative)
        {
            if (string.IsNullOrEmpty(narrative))
                return "No summary available";

            var sentences = narrative.Split('.', StringSplitOptions.RemoveEmptyEntries);
            var summary = string.Join(". ", sentences.Take(2));

            return summary.Length > 200 ? summary.Substring(0, 200) + "..." : summary;
        }

        private async Task<List<string>> ExtractKeyPoints(string narrative)
        {
            var keyPoints = new List<string>();
            var lines = narrative.Split('\n', StringSplitOptions.RemoveEmptyEntries);

            foreach (var line in lines)
            {
                var trimmed = line.Trim();
                if (trimmed.StartsWith("•") || trimmed.StartsWith("-") || trimmed.StartsWith("*") ||
                    trimmed.ToLower().Contains("key") || trimmed.ToLower().Contains("important") ||
                    trimmed.ToLower().Contains("significant"))
                {
                    keyPoints.Add(trimmed.TrimStart('•', '-', '*').Trim());
                }
            }

            return keyPoints.Take(5).ToList();
        }

        private double CalculateQualityScore(string narrative, int targetWords)
        {
            if (string.IsNullOrEmpty(narrative))
                return 0.0;

            var wordCount = narrative.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;
            var lengthScore = Math.Min(1.0, (double)wordCount / targetWords);

            // Factores de calidad básicos
            var hasNumbers = narrative.Any(char.IsDigit) ? 0.2 : 0.0;
            var hasStructure = narrative.Contains('\n') ? 0.2 : 0.0;
            var hasInsights = narrative.ToLower().Contains("trend") || narrative.ToLower().Contains("increase") ||
                             narrative.ToLower().Contains("decrease") ? 0.2 : 0.0;

            return Math.Min(1.0, lengthScore + hasNumbers + hasStructure + hasInsights);
        }

        private List<string> ParseSuggestions(string suggestionText)
        {
            var suggestions = new List<string>();
            var lines = suggestionText.Split('\n', StringSplitOptions.RemoveEmptyEntries);

            foreach (var line in lines)
            {
                var trimmed = line.Trim();
                if (trimmed.StartsWith("1.") || trimmed.StartsWith("2.") || trimmed.StartsWith("3.") ||
                    trimmed.StartsWith("4.") || trimmed.StartsWith("5.") ||
                    trimmed.StartsWith("•") || trimmed.StartsWith("-"))
                {
                    suggestions.Add(trimmed.TrimStart('1', '2', '3', '4', '5', '.', '•', '-').Trim());
                }
            }

            return suggestions.Take(5).ToList();
        }
    }
}
```

### 1.8 Implementación del MCP Client Service

**Archivo:** `ReportBuilderAPI/Services/AI/MCPClientService.cs`

```csharp
using Microsoft.Extensions.Options;
using ReportBuilderAPI.Services.AI;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;

namespace ReportBuilderAPI.Services.AI
{
    public class MCPClientService : IMCPClientService
    {
        private readonly HttpClient _httpClient;
        private readonly IDistributedCache _cache;
        private readonly ILogger<MCPClientService> _logger;
        private readonly MCPConfiguration _mcpConfig;

        public MCPClientService(
            HttpClient httpClient,
            IOptions<MCPConfiguration> mcpConfig,
            IDistributedCache cache,
            ILogger<MCPClientService> logger)
        {
            _httpClient = httpClient;
            _cache = cache;
            _logger = logger;
            _mcpConfig = mcpConfig.Value;
        }

        public async Task<string> QueryWithContextAsync(string query, Dictionary<string, object> context)
        {
            try
            {
                var request = new
                {
                    query = query,
                    context = context,
                    maxTokens = _mcpConfig.MaxContextLength,
                    enableCaching = _mcpConfig.EnableCaching
                };

                var json = JsonSerializer.Serialize(request);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync($"{_mcpConfig.ServerUrl}/api/query", content);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<MCPResponse>(responseContent);

                // Cache the result if enabled
                if (_mcpConfig.EnableCaching && !string.IsNullOrEmpty(result?.Response))
                {
                    var cacheKey = GenerateCacheKey(query, context);
                    var cacheOptions = new DistributedCacheEntryOptions
                    {
                        AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(_mcpConfig.CacheExpirationMinutes)
                    };
                    await _cache.SetStringAsync(cacheKey, result.Response, cacheOptions);
                }

                return result?.Response ?? "No response received";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error querying MCP server");
                throw;
            }
        }

        public async Task UpdateContextAsync(string contextId, Dictionary<string, object> data)
        {
            try
            {
                var request = new
                {
                    contextId = contextId,
                    data = data,
                    timestamp = DateTime.UtcNow
                };

                var json = JsonSerializer.Serialize(request);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync($"{_mcpConfig.ServerUrl}/api/context/update", content);
                response.EnsureSuccessStatusCode();

                _logger.LogInformation($"Successfully updated context {contextId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating context {contextId}");
                throw;
            }
        }

        public async Task<Dictionary<string, object>> GetContextAsync(string contextId)
        {
            try
            {
                var response = await _httpClient.GetAsync($"{_mcpConfig.ServerUrl}/api/context/{contextId}");
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<Dictionary<string, object>>(content);

                return result ?? new Dictionary<string, object>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving context {contextId}");
                return new Dictionary<string, object>();
            }
        }

        public async Task<bool> IsHealthyAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync($"{_mcpConfig.ServerUrl}/health");
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        private string GenerateCacheKey(string query, Dictionary<string, object> context)
        {
            var combined = query + JsonSerializer.Serialize(context);
            return Convert.ToBase64String(Encoding.UTF8.GetBytes(combined));
        }
    }

    public class MCPResponse
    {
        public string Response { get; set; } = string.Empty;
        public double Confidence { get; set; }
        public List<string> Sources { get; set; } = new();
        public Dictionary<string, object> Metadata { get; set; } = new();
    }
}
```

### 1.9 Implementación del Vector Service

**Archivo:** `ReportBuilderAPI/Services/AI/VectorService.cs`

```csharp
using Microsoft.Extensions.Options;
using Pinecone;
using ReportBuilderAPI.Services.AI;
using OpenAI_API;
using System.Text.Json;

namespace ReportBuilderAPI.Services.AI
{
    public class VectorService : IVectorService
    {
        private readonly PineconeClient _pineconeClient;
        private readonly OpenAIAPI _openAIApi;
        private readonly ILogger<VectorService> _logger;
        private readonly VectorStoreConfiguration _vectorConfig;

        public VectorService(
            IOptions<VectorStoreConfiguration> vectorConfig,
            ILogger<VectorService> logger)
        {
            _logger = logger;
            _vectorConfig = vectorConfig.Value;
            _pineconeClient = new PineconeClient(_vectorConfig.ApiKey, _vectorConfig.Environment);
            _openAIApi = new OpenAIAPI(_vectorConfig.OpenAIApiKey);
        }

        public async Task<string> StoreEmbeddingAsync(string content, string documentType, Dictionary<string, object> metadata)
        {
            try
            {
                var documentId = Guid.NewGuid().ToString();
                var embedding = await GenerateEmbeddingAsync(content);

                var vector = new Vector
                {
                    Id = documentId,
                    Values = embedding,
                    Metadata = metadata.ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value?.ToString() ?? ""
                    )
                };

                await _pineconeClient.Upsert(_vectorConfig.IndexName, new[] { vector });

                _logger.LogInformation($"Successfully stored embedding for document {documentId}");
                return documentId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error storing embedding");
                throw;
            }
        }

        public async Task<List<(string content, double similarity)>> SearchSimilarAsync(string query, int topK = 5)
        {
            try
            {
                var queryEmbedding = await GenerateEmbeddingAsync(query);

                var searchRequest = new QueryRequest
                {
                    Vector = queryEmbedding,
                    TopK = topK,
                    IncludeMetadata = true
                };

                var searchResponse = await _pineconeClient.Query(_vectorConfig.IndexName, searchRequest);
                var results = new List<(string content, double similarity)>();

                foreach (var match in searchResponse.Matches)
                {
                    var content = match.Metadata.ContainsKey("content") ?
                                 match.Metadata["content"].ToString() : "";
                    results.Add((content, match.Score));
                }

                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching similar vectors");
                throw;
            }
        }

        public async Task<float[]> GenerateEmbeddingAsync(string text)
        {
            try
            {
                var response = await _openAIApi.Embeddings.CreateEmbeddingAsync(new EmbeddingRequest
                {
                    Input = text,
                    Model = "text-embedding-ada-002"
                });

                return response.Data.First().Embedding.Select(d => (float)d).ToArray();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating embedding");
                throw;
            }
        }

        public async Task DeleteEmbeddingAsync(string documentId)
        {
            try
            {
                await _pineconeClient.Delete(_vectorConfig.IndexName, new[] { documentId });
                _logger.LogInformation($"Successfully deleted embedding {documentId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting embedding {documentId}");
                throw;
            }
        }
    }
}
```

---

## Fase 2: Configuración de Servicios Externos

### 2.1 Configuración Classes

**Archivo:** `ReportBuilderAPI/Configuration/AIConfiguration.cs`

```csharp
namespace ReportBuilderAPI.Configuration
{
    public class AIConfiguration
    {
        public OpenAISettings OpenAI { get; set; } = new();
        public AnthropicSettings Anthropic { get; set; } = new();
        public VectorStoreSettings VectorStore { get; set; } = new();
    }

    public class OpenAISettings
    {
        public string ApiKey { get; set; } = string.Empty;
        public string Model { get; set; } = "gpt-4-turbo-preview";
        public int MaxTokens { get; set; } = 4000;
        public double Temperature { get; set; } = 0.7;
    }

    public class AnthropicSettings
    {
        public string ApiKey { get; set; } = string.Empty;
        public string Model { get; set; } = "claude-3-sonnet-20240229";
        public int MaxTokens { get; set; } = 4000;
    }

    public class VectorStoreSettings
    {
        public string Provider { get; set; } = "Pinecone";
        public string ApiKey { get; set; } = string.Empty;
        public string Environment { get; set; } = "us-east-1-aws";
        public string IndexName { get; set; } = "reportbuilder-vectors";
        public int Dimension { get; set; } = 1536;
        public string OpenAIApiKey { get; set; } = string.Empty;
    }

    public class MCPConfiguration
    {
        public string ServerUrl { get; set; } = "http://localhost:8000";
        public int MaxContextLength { get; set; } = 32000;
        public bool EnableCaching { get; set; } = true;
        public int CacheExpirationMinutes { get; set; } = 60;
    }

    public class ProcessingConfiguration
    {
        public int MaxConcurrentAnalysis { get; set; } = 5;
        public int TimeoutMinutes { get; set; } = 10;
        public int RetryAttempts { get; set; } = 3;
    }
}
```

### 2.2 Registrar Servicios en Program.cs

**Archivo:** `ReportBuilderAPI/Program.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using ReportBuilderAPI.Data;
using ReportBuilderAPI.Services.AI;
using ReportBuilderAPI.Configuration;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

// Configuraciones existentes...
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configuraciones de IA
builder.Services.Configure<AIConfiguration>(
    builder.Configuration.GetSection("AI"));
builder.Services.Configure<MCPConfiguration>(
    builder.Configuration.GetSection("MCP"));
builder.Services.Configure<ProcessingConfiguration>(
    builder.Configuration.GetSection("Processing"));

// Redis para caching
builder.Services.AddSingleton<IConnectionMultiplexer>(provider =>
{
    var connectionString = builder.Configuration.GetConnectionString("Redis");
    return ConnectionMultiplexer.Connect(connectionString);
});

builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
});

// HTTP Clients
builder.Services.AddHttpClient<IMCPClientService, MCPClientService>();

// Servicios de IA
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddScoped<INarrativeService, NarrativeService>();
builder.Services.AddScoped<IMCPClientService, MCPClientService>();
builder.Services.AddScoped<IVectorService, VectorService>();

// Servicios existentes...
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// JWT Authentication (existente)...

var app = builder.Build();

// Configuración del pipeline...
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

---

## Fase 3: Implementación MCP

### 3.1 MCP Server Setup (Python)

**Archivo:** `mcp-server/server.py`

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import uvicorn
import json
import asyncio
from datetime import datetime
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="ReportBuilder MCP Server", version="1.0.0")

# Modelos de datos
class QueryRequest(BaseModel):
    query: str
    context: Dict[str, Any]
    maxTokens: Optional[int] = 4000
    enableCaching: Optional[bool] = True

class ContextUpdateRequest(BaseModel):
    contextId: str
    data: Dict[str, Any]
    timestamp: Optional[datetime] = None

class MCPResponse(BaseModel):
    response: str
    confidence: float
    sources: List[str]
    metadata: Dict[str, Any]

# Almacén de contexto en memoria (en producción usar Redis o base de datos)
context_store: Dict[str, Dict[str, Any]] = {}
query_cache: Dict[str, MCPResponse] = {}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@app.post("/api/query", response_model=MCPResponse)
async def query_with_context(request: QueryRequest):
    try:
        logger.info(f"Processing query: {request.query[:100]}...")

        # Generar clave de cache
        cache_key = generate_cache_key(request.query, request.context)

        # Verificar cache si está habilitado
        if request.enableCaching and cache_key in query_cache:
            logger.info("Returning cached response")
            return query_cache[cache_key]

        # Procesar la consulta con contexto
        response_text = await process_query_with_ai(request.query, request.context)

        # Calcular confianza (simulado)
        confidence = calculate_confidence(request.context)

        # Identificar fuentes
        sources = extract_sources(request.context)

        # Crear respuesta
        response = MCPResponse(
            response=response_text,
            confidence=confidence,
            sources=sources,
            metadata={
                "timestamp": datetime.utcnow().isoformat(),
                "query_length": len(request.query),
                "context_keys": list(request.context.keys())
            }
        )

        # Guardar en cache
        if request.enableCaching:
            query_cache[cache_key] = response

        return response

    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/context/update")
async def update_context(request: ContextUpdateRequest):
    try:
        context_store[request.contextId] = {
            "data": request.data,
            "timestamp": request.timestamp or datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        logger.info(f"Updated context {request.contextId}")
        return {"status": "success", "contextId": request.contextId}

    except Exception as e:
        logger.error(f"Error updating context: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/context/{context_id}")
async def get_context(context_id: str):
    try:
        if context_id not in context_store:
            raise HTTPException(status_code=404, detail="Context not found")

        return context_store[context_id]

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving context: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Funciones auxiliares
async def process_query_with_ai(query: str, context: Dict[str, Any]) -> str:
    """
    Procesar consulta con IA. En producción, integrar con Claude/GPT
    """
    # Simular procesamiento IA
    await asyncio.sleep(0.1)  # Simular latencia de API

    context_summary = summarize_context(context)

    # En producción, aquí iría la llamada a Claude/GPT
    response = f"""
Based on the provided context, here's the analysis for: "{query}"

Context Summary: {context_summary}

Key Insights:
1. Data patterns suggest ongoing trends in the metrics
2. Significant changes detected in recent periods
3. Recommendations for optimization based on historical performance

This analysis incorporates historical context and current data patterns to provide actionable insights.
"""

    return response.strip()

def generate_cache_key(query: str, context: Dict[str, Any]) -> str:
    """Generar clave única para cache"""
    context_str = json.dumps(context, sort_keys=True)
    combined = f"{query}:{context_str}"
    return str(hash(combined))

def calculate_confidence(context: Dict[str, Any]) -> float:
    """Calcular score de confianza basado en contexto"""
    base_confidence = 0.8

    # Ajustar basado en cantidad de datos
    data_factor = min(1.0, len(context) / 10.0)

    # Ajustar basado en completitud
    completeness = sum(1 for v in context.values() if v is not None) / len(context) if context else 0

    return min(1.0, base_confidence * data_factor * completeness)

def extract_sources(context: Dict[str, Any]) -> List[str]:
    """Extraer fuentes de los datos de contexto"""
    sources = []

    if 'reportId' in context:
        sources.append(f"Report {context['reportId']}")

    if 'reportTitle' in context:
        sources.append(f"Report: {context['reportTitle']}")

    if 'createdAt' in context:
        sources.append(f"Data from {context['createdAt']}")

    return sources

def summarize_context(context: Dict[str, Any]) -> str:
    """Crear resumen del contexto"""
    summary_parts = []

    if 'reportTitle' in context:
        summary_parts.append(f"Report: {context['reportTitle']}")

    if 'insights' in context and isinstance(context['insights'], list):
        summary_parts.append(f"{len(context['insights'])} insights available")

    if 'reportData' in context:
        summary_parts.append("Historical data included")

    return "; ".join(summary_parts) if summary_parts else "Minimal context available"

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 3.2 MCP Server Requirements

**Archivo:** `mcp-server/requirements.txt`

```txt
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.0
python-multipart==0.0.6
anthropic==0.7.8
openai==1.3.8
redis==5.0.1
python-dotenv==1.0.0
```

### 3.3 MCP Server Dockerfile

**Archivo:** `mcp-server/Dockerfile`

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Fase 4: Nuevos Endpoints API

### 4.1 Analytics Controller

**Archivo:** `ReportBuilderAPI/Controllers/AnalyticsController.cs`

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ReportBuilderAPI.Services.AI;
using ReportBuilderAPI.DTOs.AI;

namespace ReportBuilderAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;
        private readonly ILogger<AnalyticsController> _logger;

        public AnalyticsController(
            IAnalyticsService analyticsService,
            ILogger<AnalyticsController> logger)
        {
            _analyticsService = analyticsService;
            _logger = logger;
        }

        [HttpPost("analyze-excel")]
        public async Task<ActionResult<AnalysisResponseDto>> AnalyzeExcel([FromBody] AnalysisRequestDto request)
        {
            try
            {
                var result = await _analyticsService.AnalyzeReportDataAsync(request);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing Excel data");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("insights/{reportId}")]
        public async Task<ActionResult<List<string>>> GetInsights(int reportId)
        {
            try
            {
                var insights = await _analyticsService.GenerateInsightsAsync(reportId);
                return Ok(insights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting insights for report {reportId}");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("trends/{areaId}")]
        public async Task<ActionResult<List<string>>> GetTrends(int areaId, [FromQuery] int days = 90)
        {
            try
            {
                var trends = await _analyticsService.DetectTrendsAsync(areaId, TimeSpan.FromDays(days));
                return Ok(trends);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting trends for area {areaId}");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("compare-periods")]
        public async Task<ActionResult<Dictionary<string, object>>> ComparePeriods([FromBody] PeriodComparisonRequest request)
        {
            try
            {
                var result = new Dictionary<string, object>();

                var currentKPIs = await _analyticsService.CalculateKPIsAsync(request.CurrentReportId);
                var previousKPIs = await _analyticsService.CalculateKPIsAsync(request.PreviousReportId);

                var comparison = new Dictionary<string, object>();
                foreach (var currentKPI in currentKPIs)
                {
                    if (previousKPIs.ContainsKey(currentKPI.Key))
                    {
                        var change = currentKPI.Value - previousKPIs[currentKPI.Key];
                        var percentChange = previousKPIs[currentKPI.Key] != 0 ?
                                          (change / previousKPIs[currentKPI.Key]) * 100 : 0;

                        comparison[currentKPI.Key] = new
                        {
                            current = currentKPI.Value,
                            previous = previousKPIs[currentKPI.Key],
                            change = change,
                            percentChange = percentChange
                        };
                    }
                }

                result["comparison"] = comparison;
                result["summary"] = GenerateComparisonSummary(comparison);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error comparing periods");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("anomalies/{reportId}")]
        public async Task<ActionResult<List<string>>> GetAnomalies(int reportId)
        {
            try
            {
                var anomalies = await _analyticsService.DetectAnomaliesAsync(reportId);
                return Ok(anomalies);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error detecting anomalies for report {reportId}");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("kpis/{reportId}")]
        public async Task<ActionResult<Dictionary<string, double>>> GetKPIs(int reportId)
        {
            try
            {
                var kpis = await _analyt
```
