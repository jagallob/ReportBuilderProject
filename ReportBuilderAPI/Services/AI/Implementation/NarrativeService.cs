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
        private readonly IDeepSeekService _deepSeekService;
        private readonly AISettings _settings;
        private readonly ILogger<NarrativeService> _logger;

        public NarrativeService(IOptions<AISettings> settings, ILogger<NarrativeService> logger, IDeepSeekService deepSeekService)
        {
            _settings = settings.Value;
            _logger = logger;
            _deepSeekService = deepSeekService;
        }

        public async Task<NarrativeResult> GenerateNarrativeAsync(NarrativeRequest request)
        {
            try
            {
                _logger.LogInformation($"Generando narrativa con DeepSeek para TemplateId: {request.TemplateId}");
                var prompt = BuildNarrativePrompt(request);
                var response = await _deepSeekService.GenerateTextAsync(prompt); // Usamos DeepSeek
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
                var response = await _deepSeekService.GenerateTextAsync(prompt); // Usamos DeepSeek
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
            // The new request model contains the result of the analysis, not raw data.
            var analysisJson = JsonSerializer.Serialize(request.Analysis);
            return $@"
             Genera una narrativa profesional para un reporte con las siguientes características:
            
             Template ID: {request.TemplateId}, Tono: {request.Config.Tone}, Idioma: {request.Config.Language}
             Datos del Análisis: {analysisJson}
            
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