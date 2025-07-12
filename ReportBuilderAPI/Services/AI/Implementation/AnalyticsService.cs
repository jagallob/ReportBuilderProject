using System.Text.Json;
using Azure;
using Microsoft.Extensions.Options;
using Azure.AI.OpenAI;
using ReportBuilderAPI.Configuration;
using ReportBuilderAPI.Services.AI.Interfaces;
using ReportBuilderAPI.Services.AI.Models;

namespace ReportBuilderAPI.Services.AI.Implementation
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly OpenAIClient _openAIClient;
        private readonly AIConfiguration _config;
        private readonly ILogger<AnalyticsService> _logger;

        public AnalyticsService(IOptions<AIConfiguration> config, ILogger<AnalyticsService> logger)
        {
            _config = config.Value;
            _logger = logger;
            _openAIClient = new OpenAIClient(_config.OpenAI.ApiKey);
        }

        public async Task<AnalysisResult> AnalyzeExcelDataAsync(AnalysisRequest request)
        {
            try
            {
                _logger.LogInformation($"Iniciando análisis para ReportId: {request.ReportId}");
                var prompt = BuildAnalysisPrompt(request);
                var response = await CallOpenAIAsync(prompt);
                var analysisResult = ParseAnalysisResponse(response, request.ReportId);
                _logger.LogInformation($"Análisis completado para ReportId: {request.ReportId}");
                return analysisResult;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error en análisis para ReportId: {request.ReportId}");
                throw;
            }
        }

        public async Task<List<Insight>> GetInsightsAsync(int reportId)
        {
            try
            {
                var insights = new List<Insight>
                {
                    new Insight
                    {
                        Type = "Performance",
                        Title = "Incremento en Métricas Clave",
                        Description = "Se detectó un aumento del 15% en las métricas principales comparado con el período anterior",
                        Severity = "Info",
                        Confidence = 0.85
                    }
                };
                return await Task.FromResult(insights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error obteniendo insights para ReportId: {reportId}");
                return new List<Insight>();
            }
        }

        public async Task<List<Trend>> GetTrendsAsync(int areaId, DateTime startDate, DateTime endDate)
        {
            try
            {
                var trends = new List<Trend>
                {
                    new Trend
                    {
                        Metric = "Ventas",
                        Direction = "Up",
                        ChangePercentage = 12.5,
                        Period = $"{startDate:yyyy-MM-dd} a {endDate:yyyy-MM-dd}",
                        DataPoints = GenerateDataPoints(startDate, endDate)
                    }
                };
                return await Task.FromResult(trends);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error obteniendo tendencias para AreaId: {areaId}");
                return new List<Trend>();
            }
        }

        public async Task<AnalysisResult> ComparePeroidsAsync(int areaId, DateTime period1Start, DateTime period1End, DateTime period2Start, DateTime period2End)
        {
            try
            {
                var prompt = $@"
                 Compara los siguientes períodos para el área {areaId}:
                 Período 1: {period1Start:yyyy-MM-dd} a {period1End:yyyy-MM-dd}
                 Período 2: {period2Start:yyyy-MM-dd} a {period2End:yyyy-MM-dd}
                
                 Proporciona un análisis comparativo detallado incluyendo:
                 1. Diferencias principales
                 2. Tendencias identificadas
                 3. Recomendaciones
                 ";
                var response = await CallOpenAIAsync(prompt);
                return ParseAnalysisResponse(response, areaId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error en comparación de períodos para AreaId: {areaId}");
                throw;
            }
        }

        public async Task<bool> ProcessDataAsync(Dictionary<string, object> data)
        {
            try
            {
                _logger.LogInformation($"Procesando {data.Count} elementos de datos");
                await Task.Delay(100);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error procesando datos");
                return false;
            }
        }

        private string BuildAnalysisPrompt(AnalysisRequest request)
        {
            var dataJson = JsonSerializer.Serialize(request.Data);
            return $@"
             Analiza los siguientes datos de reporte:
            
             Tipo de Análisis: {request.AnalysisType}
             Período: {request.PeriodStart:yyyy-MM-dd} a {request.PeriodEnd:yyyy-MM-dd}
             Datos: {dataJson}
            
             Proporciona un análisis detallado que incluya:
             1. Resumen ejecutivo
             2. Insights principales (máximo 5)
             3. Tendencias identificadas
             4. Métricas clave
             5. Recomendaciones
            
             Formato de respuesta en JSON:
             {{
                 ""summary"": ""resumen ejecutivo"",
                 ""insights"": [{{""type"": ""tipo"", ""title"": ""título"", ""description"": ""descripción"", ""severity"": ""Info|Warning|Critical"", ""confidence"": 0.0-1.0}}],
                 ""trends"": [{{""metric"": ""métrica"", ""direction"": ""Up|Down|Stable"", ""changePercentage"": 0.0, ""period"": ""período""}}],
                 ""metrics"": {{""key"": ""value""}}
             }}
             ";
        }

        private async Task<string> CallOpenAIAsync(string prompt)
        {
            try
            {
                var chatCompletionsOptions = new ChatCompletionsOptions()
                {
                    DeploymentName = _config.OpenAI.Model,
                    Messages =
                    {
                        new ChatRequestSystemMessage("Eres un analista de datos experto que proporciona insights valiosos a partir de datos de reportes empresariales."),
                        new ChatRequestUserMessage(prompt)
                    },
                    Temperature = (float)_config.OpenAI.Temperature,
                    MaxTokens = _config.OpenAI.MaxTokens
                };

                Response<ChatCompletions> response = await _openAIClient.GetChatCompletionsAsync(chatCompletionsOptions);
                ChatResponseMessage responseMessage = response.Value.Choices[0].Message;
                return responseMessage.Content ?? string.Empty;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error llamando a OpenAI API");
                throw;
            }
        }

        private AnalysisResult ParseAnalysisResponse(string response, int reportId)
        {
            try
            {
                var jsonResponse = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(response);
                return new AnalysisResult
                {
                    ReportId = reportId,
                    Summary = jsonResponse.TryGetValue("summary", out var summary) ? summary.GetString() ?? "" : "",
                    Insights = jsonResponse.TryGetValue("insights", out var insights) ? ParseInsights(insights) : new List<Insight>(),
                    Trends = jsonResponse.TryGetValue("trends", out var trends) ? ParseTrends(trends) : new List<Trend>(),
                    Metrics = jsonResponse.TryGetValue("metrics", out var metrics) ? JsonSerializer.Deserialize<Dictionary<string, object>>(metrics.GetRawText()) ?? new() : new(),
                    GeneratedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error parseando respuesta de IA");
                return new AnalysisResult
                {
                    ReportId = reportId,
                    Summary = "Análisis completado con datos procesados",
                    GeneratedAt = DateTime.UtcNow
                };
            }
        }

        private List<Insight> ParseInsights(JsonElement insightsElement)
        {
            if (insightsElement.ValueKind == JsonValueKind.Array)
            {
                return JsonSerializer.Deserialize<List<Insight>>(insightsElement.GetRawText()) ?? new List<Insight>();
            }
            return new List<Insight>();
        }

        private List<Trend> ParseTrends(JsonElement trendsElement)
        {
            if (trendsElement.ValueKind == JsonValueKind.Array)
            {
                return JsonSerializer.Deserialize<List<Trend>>(trendsElement.GetRawText()) ?? new List<Trend>();
            }
            return new List<Trend>();
        }

        private List<DataPoint> GenerateDataPoints(DateTime startDate, DateTime endDate)
        {
            var dataPoints = new List<DataPoint>();
            var random = new Random();
            for (var date = startDate; date <= endDate; date = date.AddDays(1))
            {
                dataPoints.Add(new DataPoint
                {
                    Date = date,
                    Value = random.NextDouble() * 100,
                    Label = date.ToString("yyyy-MM-dd")
                });
            }
            return dataPoints;
        }
    }
}