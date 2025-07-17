using System.Text.Json;
using Microsoft.Extensions.Options;
using ReportBuilderAPI.Configuration;
using ReportBuilderAPI.Services.AI.Interfaces;
using ReportBuilderAPI.Services.AI.Models;

namespace ReportBuilderAPI.Services.AI.Implementation
{
    public class NarrativeService : INarrativeService
    {
        private readonly IOllamaService _ollamaService;
        private readonly AISettings _settings;
        private readonly ILogger<NarrativeService> _logger;

        public NarrativeService(
            IOptions<AISettings> settings,
            ILogger<NarrativeService> logger,
            IOllamaService ollamaService)
        {
            _settings = settings.Value;
            _logger = logger;
            _ollamaService = ollamaService;
        }

        public async Task<NarrativeResult> GenerateNarrativeAsync(NarrativeRequest request)
        {
            // =========================================================================================
            // CORRECCIÓN: Se elimina la segunda llamada a la IA.
            // En lugar de pedirle a Ollama que genere una narrativa a partir del análisis,
            // vamos a construir el resultado de la narrativa directamente desde el análisis ya hecho.
            // Esto simplifica el flujo y es más robusto para modelos pequeños.
            // =========================================================================================
            _logger.LogInformation("Transformando AnalysisResult a NarrativeResult para TemplateId: {TemplateId}", request.TemplateId);

            // Se asume que request.Analysis contiene el resultado del AnalyticsService
            var analysis = request.Analysis;
            if (analysis == null)
            {
                _logger.LogError("El objeto de análisis en la solicitud de narrativa es nulo.");
                return new NarrativeResult { Title = "Error", Content = "No se proporcionó un análisis base." };
            }

            var narrativeResult = new NarrativeResult
            {
                Title = analysis.Title ?? "Análisis de Datos",
                Content = analysis.Summary ?? "No se generó un resumen.",
                // Puedes mapear más campos si es necesario, por ejemplo, insights a keyPoints.
                KeyPoints = analysis.Insights?.Select(i => i.Title ?? "Insight sin título").ToList() ?? new List<string>(),
                Sections = new Dictionary<string, string> { { "Resumen Ejecutivo", analysis.Summary ?? "" } },
                GeneratedAt = DateTime.UtcNow
            };

            _logger.LogInformation("Narrativa construida exitosamente para TemplateId: {TemplateId}", request.TemplateId);

            // La tarea debe ser asíncrona para que coincida con la firma del método.
            return await Task.FromResult(narrativeResult);
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
                _logger.LogInformation("Personalizando narrativa ID: {NarrativeId} con Ollama", request.NarrativeId);
                var prompt = BuildCustomizationPrompt(request);
                var response = await _ollamaService.GenerateTextAsync(prompt);
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