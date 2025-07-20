using System.Text.Json;
using Microsoft.Extensions.Options;
using ReportBuilderAPI.Configuration;
using ReportBuilderAPI.Services.AI.Interfaces;
using ReportBuilderAPI.Services.AI.Models;

namespace ReportBuilderAPI.Services.AI.Implementation
{
    public class NarrativeService : INarrativeService
    {
        private readonly IAnthropicService _anthropicService;
        private readonly AISettings _settings;
        private readonly ILogger<NarrativeService> _logger;

        public NarrativeService(
            IOptions<AISettings> settings,
            ILogger<NarrativeService> logger,
            IAnthropicService anthropicService)
        {
            _settings = settings.Value;
            _logger = logger;
            _anthropicService = anthropicService;
        }

        public async Task<NarrativeResult> GenerateNarrativeAsync(NarrativeRequest request)
        {
            try
            {
                _logger.LogInformation("Generando narrativa con Anthropic para TemplateId: {TemplateId}", request.TemplateId);
                
                // Usar Anthropic para generar la narrativa
                var narrativeResult = await _anthropicService.GenerateNarrativeAsync(request);
                
                _logger.LogInformation("Narrativa generada exitosamente para TemplateId: {TemplateId}", request.TemplateId);
                return narrativeResult;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generando narrativa con Anthropic");
                return new NarrativeResult { Title = "Error", Content = $"Error generando narrativa: {ex.Message}" };
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
                _logger.LogInformation("Personalizando narrativa ID: {NarrativeId} con Anthropic", request.NarrativeId);
                var prompt = BuildCustomizationPrompt(request);
                var response = await _anthropicService.GenerateTextAsync(prompt);
                var narrativeResult = ParseNarrativeResponse(response);
                _logger.LogInformation("Narrativa ID: {NarrativeId} personalizada con éxito.", request.NarrativeId);
                return narrativeResult;
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
             Mantén la estructura JSON.";
        }

        private NarrativeResult ParseNarrativeResponse(string response)
        {
            if (string.IsNullOrWhiteSpace(response))
            {
                _logger.LogWarning("La respuesta para parsear la narrativa está vacía.");
                return new NarrativeResult { Title = "Error de Formato", Content = "La respuesta del servicio estaba vacía." };
            }

            try
            {
                // Limpiar la respuesta para obtener solo el JSON en caso de que el modelo agregue texto adicional.
                var jsonStart = response.IndexOf('{');
                var jsonEnd = response.LastIndexOf('}');
                if (jsonStart == -1 || jsonEnd == -1 || jsonEnd < jsonStart)
                {
                    _logger.LogWarning("La respuesta del servicio no contenía un JSON válido: {response}", response);
                    return new NarrativeResult { Title = "Error de Formato", Content = $"La respuesta del servicio no contenía un JSON válido: {response}" };
                }
                var jsonResponseStr = response.Substring(jsonStart, jsonEnd - jsonStart + 1);


                var jsonResponse = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(jsonResponseStr);
                if (jsonResponse is null)
                {
                    _logger.LogWarning("La respuesta de la narrativa JSON se deserializó como nula. Respuesta original: {response}", response);
                    return new NarrativeResult { Title = "Error de Deserialización", Content = "La respuesta del servicio no pudo ser procesada." };
                }
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
                return new NarrativeResult { Title = "Error de Parseo", Content = $"Ocurrió una excepción: {ex.Message}" };
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