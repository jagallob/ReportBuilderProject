using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Options;
using ReportBuilderAPI.Configuration;
using ReportBuilderAPI.Services.AI.Interfaces;
using ReportBuilderAPI.Services.AI.Models;

namespace ReportBuilderAPI.Services.AI.Implementation
{
    public class DeepSeekService : IDeepSeekService
    {
        private readonly HttpClient _httpClient;
        private readonly DeepSeekConfig _config;
        private readonly ILogger<DeepSeekService> _logger;

        public DeepSeekService(
            HttpClient httpClient,
            IOptions<AISettings> settings,
            ILogger<DeepSeekService> logger)
        {
            _httpClient = httpClient;
            _config = settings.Value.DeepSeek;
            _logger = logger;

            _httpClient.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _config.ApiKey);
        }

        public async Task<string> GenerateTextAsync(string prompt)
        {
            try
            {
                var requestData = new
                {
                    model = _config.Model,
                    messages = new[] { new { role = "user", content = prompt } },
                    max_tokens = _config.MaxTokens,
                    temperature = _config.Temperature
                };

                var response = await _httpClient.PostAsJsonAsync(_config.Endpoint, requestData);
                response.EnsureSuccessStatusCode();

                var responseJson = await response.Content.ReadFromJsonAsync<JsonDocument>();
                return responseJson?.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString() ?? "Error: Respuesta no válida";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en DeepSeekService.GenerateTextAsync");
                throw;
            }
        }

        public async Task<AnalysisResult> AnalyzeDataAsync(AnalysisRequest request)
        {
            try
            {
                _logger.LogInformation("Iniciando análisis con DeepSeek para tipo: {AnalysisType}",
                    request.Config?.AnalysisType ?? "No especificado");

                var prompt = BuildAnalysisPrompt(request);
                var response = await GenerateTextAsync(prompt);

                return ParseAnalysisResponse(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en DeepSeekService.AnalyzeDataAsync");
                throw;
            }
        }

        private string BuildAnalysisPrompt(AnalysisRequest request)
        {
            // Convertir los datos a formato tabular para mejor legibilidad
            var tableData = ConvertToMarkdownTable(request.Data);

            return $@"
            ### Instrucciones de Análisis
            **Tipo de Análisis:** {request.Config?.AnalysisType ?? "No especificado"}
            **Idioma:** {request.Config?.Language ?? "es"}
            **Tono:** {request.Config?.Tone ?? "neutral"}
            
            ### Datos a Analizar:
            {tableData}
            
            ### Requerimientos:
            1. Genera un resumen ejecutivo (máximo 200 palabras)
            2. Identifica 3-5 insights clave con:
               - Título
               - Descripción
               - Severidad (Baja/Media/Alta)
               - Confianza (0-1)
            3. Detecta tendencias relevantes
            4. Proporciona recomendaciones accionables
            
            ### Formato de Respuesta (JSON):
            {{
                ""summary"": ""..."",
                ""insights"": [
                    {{
                        ""title"": ""..."",
                        ""description"": ""..."",
                        ""severity"": ""..."",
                        ""confidence"": 0.0
                    }}
                ],
                ""trends"": [
                    {{
                        ""metric"": ""..."",
                        ""direction"": ""up/down/stable"",
                        ""change"": 0.0
                    }}
                ],
                ""recommendations"": []
            }}";
        }

        private string ConvertToMarkdownTable(List<List<object>> data)
        {
            if (data == null || data.Count == 0)
                return "No hay datos disponibles";

            var table = new System.Text.StringBuilder();

            // Encabezados (asumiendo que la primera fila contiene los headers)
            table.AppendLine("| " + string.Join(" | ", data[0]) + " |");

            // Separador
            table.AppendLine("|" + new string('-', data[0].Count * 5) + "|");

            // Filas de datos
            for (int i = 1; i < data.Count; i++)
            {
                table.AppendLine("| " + string.Join(" | ", data[i]) + " |");
            }

            return table.ToString();
        }

        private AnalysisResult ParseAnalysisResponse(string response)
        {
            try
            {
                var jsonResponse = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(response);

                return new AnalysisResult
                {
                    Summary = jsonResponse?.TryGetValue("summary", out var summary) == true
                        ? summary.GetString() ?? "Sin resumen"
                        : "Sin resumen",
                    Insights = jsonResponse?.TryGetValue("insights", out var insights) == true
                        ? JsonSerializer.Deserialize<List<Insight>>(insights.GetRawText()) ?? new()
                        : new(),
                    Trends = jsonResponse?.TryGetValue("trends", out var trends) == true
                        ? JsonSerializer.Deserialize<List<Trend>>(trends.GetRawText()) ?? new()
                        : new(),
                    GeneratedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error parseando respuesta de DeepSeek");
                return new AnalysisResult
                {
                    Summary = $"Error al procesar respuesta: {response}",
                    GeneratedAt = DateTime.UtcNow
                };
            }
        }
    }
}