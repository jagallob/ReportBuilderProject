using System.Text.Json;
using Azure;
using Microsoft.Extensions.Options;
using Azure.AI.OpenAI;
using ReportBuilderAPI.Configuration;
using ReportBuilderAPI.Services.AI.Interfaces;
using ReportBuilderAPI.Services.AI.Models;

namespace ReportBuilderAPI.Services.AI.Implementation
{
    public class NarrativeService : INarrativeService
    {
        private readonly OpenAIClient _openAIClient;
        private readonly AIConfiguration _config;
        private readonly ILogger<NarrativeService> _logger;

        public NarrativeService(IOptions<AIConfiguration> config, ILogger<NarrativeService> logger)
        {
            _config = config.Value;
            _logger = logger;
            _openAIClient = new OpenAIClient(_config.OpenAI.ApiKey);
        }

        public async Task<NarrativeResult> GenerateNarrativeAsync(NarrativeRequest request)
        {
            try
            {
                _logger.LogInformation($"Generando narrativa para TemplateId: {request.TemplateId}");
                var prompt = BuildNarrativePrompt(request);
                var response = await CallOpenAIAsync(prompt);
                var narrativeResult = ParseNarrativeResponse(response);
                _logger.LogInformation($"Narrativa generada para TemplateId: {request.TemplateId}");
                return narrativeResult;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error generando narrativa para TemplateId: {request.TemplateId}");
                throw;
            }
        }

        public async Task<IEnumerable<NarrativeTemplate>> GetTemplatesAsync()
        {
            return await Task.FromResult(new List<NarrativeTemplate>
            {
                new NarrativeTemplate { Id = 1, Name = "Reporte Ejecutivo", Description = "Resumen ejecutivo del negocio", Language = "es" },
                new NarrativeTemplate { Id = 2, Name = "Análisis de Ventas", Description = "Análisis detallado de ventas", Language = "es" }
            });
        }

        public async Task<NarrativeResult> CustomizeNarrativeAsync(CustomizeNarrativeRequest request)
        {
            try
            {
                _logger.LogInformation($"Personalizando narrativa ID: {request.NarrativeId}");
                var prompt = BuildCustomizationPrompt(request);
                var response = await CallOpenAIAsync(prompt);
                return ParseNarrativeResponse(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error personalizando narrativa ID: {request.NarrativeId}");
                throw;
            }
        }

        public async Task<IEnumerable<NarrativeSuggestion>> GetSuggestionsAsync(int reportId)
        {
            return await Task.FromResult(new List<NarrativeSuggestion>
            {
                new NarrativeSuggestion { Title = "Comparación temporal", Content = "Agregar una sección que compare los datos actuales con los del período anterior.", RelevanceScore = 0.95 },
                new NarrativeSuggestion { Title = "Gráfico de tendencias", Content = "Incluir un gráfico que muestre la evolución temporal.", RelevanceScore = 0.89 }
            });
        }

        private string BuildNarrativePrompt(NarrativeRequest request)
        {
            var dataJson = JsonSerializer.Serialize(request.Data);
            return $@"
             Genera una narrativa profesional para un reporte con las siguientes características:
            
             Template ID: {request.TemplateId}, Estilo: {request.Style}, Idioma: {request.Language}
             Contexto: {request.Context}, Datos: {dataJson}
            
             La narrativa debe incluir: Título, Resumen, Secciones, Puntos clave y Conclusiones.
            
             Formato de respuesta en JSON:
             {{
                 ""title"": ""título"", ""content"": ""contenido"", ""keyPoints"": [""punto 1""],
                 ""sections"": {{ ""resumen"": ""..."" }}
             }}
             ";
        }

        private string BuildCustomizationPrompt(CustomizeNarrativeRequest request)
        {
            var modificationsJson = JsonSerializer.Serialize(request.Modifications);
            return $@"
             Personaliza la narrativa existente con ID: {request.NarrativeId}.
             Modificaciones: {modificationsJson}, Revisor: {request.Reviewer}, Comentarios: {request.Comments}.
             Mantén la estructura JSON.
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
                        new ChatRequestSystemMessage("Eres un escritor profesional especializado en reportes empresariales. Generas narrativas claras, concisas y profesionales."),
                        new ChatRequestUserMessage(prompt)
                    },
                    Temperature = (float)_config.OpenAI.Temperature,
                    MaxTokens = _config.OpenAI.MaxTokens
                };

                Response<ChatCompletions> response = await _openAIClient.GetChatCompletionsAsync(chatCompletionsOptions);
                ChatResponseMessage responseMessage = response.Value.Choices[0].Message;
                return responseMessage.Content ?? string.Empty;
            }
            catch (RequestFailedException ex)
            {
                _logger.LogError(ex, "Error en la solicitud a OpenAI API para narrativa. Status Code: {StatusCode}, Error: {ErrorCode}", ex.Status, ex.ErrorCode);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inesperado llamando a OpenAI API para narrativa");
                throw;
            }
        }

        private NarrativeResult ParseNarrativeResponse(string response)
        {
            try
            {
                var jsonResponse = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(response);
                return new NarrativeResult
                {
                    Title = jsonResponse.TryGetValue("title", out var title) ? title.GetString() ?? "" : "",
                    Content = jsonResponse.TryGetValue("content", out var content) ? content.GetString() ?? "" : "",
                    KeyPoints = jsonResponse.TryGetValue("keyPoints", out var keyPoints) ? ParseKeyPoints(keyPoints) : new List<string>(),
                    Sections = jsonResponse.TryGetValue("sections", out var sections) ? ParseSections(sections) : new Dictionary<string, string>(),
                    GeneratedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error parseando respuesta de narrativa");
                return new NarrativeResult { Title = "Reporte Generado", Content = "Contenido generado." };
            }
        }

        private List<string> ParseKeyPoints(JsonElement keyPointsElement)
        {
            if (keyPointsElement.ValueKind == JsonValueKind.Array)
            {
                return JsonSerializer.Deserialize<List<string>>(keyPointsElement.GetRawText()) ?? new List<string>();
            }
            return new List<string>();
        }

        private Dictionary<string, string> ParseSections(JsonElement sectionsElement)
        {
            if (sectionsElement.ValueKind == JsonValueKind.Object)
            {
                return JsonSerializer.Deserialize<Dictionary<string, string>>(sectionsElement.GetRawText()) ?? new Dictionary<string, string>();
            }
            return new Dictionary<string, string>();
        }
    }
}