using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Options;
using ReportBuilderAPI.Configuration;
using ReportBuilderAPI.Services.AI.Interfaces;
using ReportBuilderAPI.Services.AI.Models;

namespace ReportBuilderAPI.Services.AI.Implementation
{
    public class OllamaService : IOllamaService
    {
        private readonly HttpClient _httpClient;
        private readonly AISettings _settings;
        private readonly ILogger<OllamaService> _logger;

        public OllamaService(
            HttpClient httpClient,
            IOptions<AISettings> settings,
            ILogger<OllamaService> logger)
        {
            _httpClient = httpClient;
            _settings = settings.Value;
            _logger = logger;

            _httpClient.BaseAddress = new Uri(_settings.Ollama.Endpoint);
            _httpClient.Timeout = TimeSpan.FromSeconds(_settings.Ollama.TimeoutSeconds);
        }

        public async Task<string> GenerateTextAsync(string prompt, string? model = null)
        {
            try
            {
                var requestModel = model ?? _settings.Ollama.Model;
                _logger.LogInformation("Generando texto con Ollama usando modelo: {Model}", requestModel);

                var requestBody = new
                {
                    model = requestModel,
                    prompt = prompt,
                    stream = false,
                    format = "json",
                    options = new
                    {
                        temperature = Math.Min(_settings.Ollama.Temperature, 0.3),
                        num_predict = _settings.Ollama.MaxTokens,
                        top_p = 0.9,
                        repeat_penalty = 1.1
                    }
                };

                var json = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync("/api/generate", content);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Error en Ollama API: {StatusCode} - {ErrorContent}",
                        response.StatusCode, errorContent);
                    throw new HttpRequestException($"Error en Ollama API: {response.StatusCode}");
                }




                var responseContent = await response.Content.ReadAsStringAsync();
                _logger.LogDebug("Respuesta completa de Ollama: {Response}", responseContent);
                // Log temporal para diagnóstico (eliminar después de analizar)
                _logger.LogInformation("Respuesta cruda recibida de Ollama: {Response}", responseContent);

                // CORRECCIÓN: El JSON que queremos está dentro de la propiedad 'response' del JSON principal de Ollama.
                // 1. Deserializar el objeto de respuesta principal de Ollama.
                var ollamaResponse = JsonSerializer.Deserialize<OllamaGenerateResponse>(responseContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                // 2. Extraer la cadena de texto que contiene nuestro JSON.
                var generatedText = ollamaResponse?.Response;

                if (string.IsNullOrEmpty(generatedText))
                {
                    throw new InvalidOperationException("La propiedad 'response' en la respuesta de Ollama está vacía o es nula.");
                }

                // Extraer y validar JSON
                var cleanedJson = ExtractAndValidateJson(generatedText);

                return cleanedJson;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en OllamaService.GenerateTextAsync");
                throw;
            }
        }

        public async Task<AnalysisResult> AnalyzeDataAsync(AnalysisRequest request)
        {
            try
            {
                _logger.LogInformation("Iniciando análisis con Ollama para tipo: {AnalysisType}",
                    request.Config?.AnalysisType ?? "No especificado");

                // Se cambia al prompt simplificado, más adecuado para tinyllama
                var prompt = BuildSimplifiedAnalysisPrompt(request);
                var response = await GenerateTextAsync(prompt);

                return ParseAnalysisResponse(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en OllamaService.AnalyzeDataAsync");
                throw;
            }
        }

        public async Task<float[]> GenerateEmbeddingAsync(string text)
        {
            try
            {
                _logger.LogDebug("Generando embedding con Ollama para texto de {Length} caracteres", text.Length);

                var requestBody = new
                {
                    model = _settings.Ollama.EmbeddingModel,
                    prompt = text
                };

                var json = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync("/api/embeddings", content);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Error generando embedding: {StatusCode} - {ErrorContent}",
                        response.StatusCode, errorContent);
                    throw new HttpRequestException($"Error generando embedding: {response.StatusCode}");
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                var embeddingResponse = JsonSerializer.Deserialize<OllamaEmbeddingResponse>(responseContent);

                return embeddingResponse?.Embedding ?? new float[0];
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generando embedding con Ollama");
                throw;
            }
        }

        public async Task<bool> IsHealthyAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync("/api/tags");
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verificando estado de Ollama");
                return false;
            }
        }

        public async Task<List<string>> GetAvailableModelsAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync("/api/tags");

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Error obteniendo modelos disponibles: {StatusCode}", response.StatusCode);
                    return new List<string>();
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                var modelsResponse = JsonSerializer.Deserialize<OllamaModelsResponse>(responseContent);

                return modelsResponse?.Models?.Select(m => m.Name).ToList() ?? new List<string>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo modelos disponibles");
                return new List<string>();
            }
        }

        private string BuildSimplifiedAnalysisPrompt(AnalysisRequest request)
        {
            var tableData = ConvertToMarkdownTable(request.Data, 5); // Limitar a 5 filas para ser más conciso

            return $@"
Eres un analista de datos. Analiza los siguientes datos.

=== DATOS ===
{tableData}

=== INSTRUCCIONES ===
1. Responde SOLAMENTE con un objeto JSON.
2. No añadas texto antes o después del JSON.
3. El JSON debe ser válido.

=== FORMATO JSON REQUERIDO ===
{{
  ""title"": ""Título del Análisis"",
  ""summary"": ""Un resumen de 2 o 3 frases sobre los datos."",
  ""recommendations"": [
    ""Recomendación 1"",
    ""Recomendación 2""
  ]
}}

=== CONTEXTO ===
- Idioma: {request.Config?.Language ?? "es"}
- Tono: {request.Config?.Tone ?? "profesional"}

Genera el JSON ahora:";
        }


        /*
        ================================================================================================
        PROMPT ORIGINAL - Demasiado complejo para modelos pequeños como tinyllama
        ================================================================================================
        Este prompt solicita una estructura anidada y compleja que los modelos más pequeños
        a menudo no pueden generar de manera consistente, resultando en JSON inválido o incompleto.
        Se mantiene aquí como referencia.
        ================================================================================================

        private string BuildImprovedAnalysisPrompt(AnalysisRequest request)
        {
            var tableData = ConvertToMarkdownTable(request.Data);
            var sampleData = GetSampleDataForContext(request.Data);

            return $@"
Eres un analista de datos experto. Analiza los siguientes datos y genera una narrativa comprensiva.

=== DATOS A ANALIZAR ===
{tableData}

=== MUESTRA DE DATOS ===
{sampleData}

=== INSTRUCCIONES CRÍTICAS ===
1. Responde ÚNICAMENTE con un JSON válido
2. No incluyas texto antes o después del JSON
3. No uses comillas triples ni markdown
4. Asegúrate de que todos los objetos y arrays estén cerrados correctamente

=== FORMATO DE RESPUESTA REQUERIDO ===
{{
  ""title"": ""Análisis de Datos - [Título Descriptivo]"",
  ""summary"": ""Resumen ejecutivo de máximo 300 palabras que explique los hallazgos principales..."",
  ""insights"": [
    {{
      ""title"": ""Título del Insight"",
      ""description"": ""Descripción detallada del hallazgo"",
      ""severity"": ""Alta"",
      ""confidence"": 0.85,
      ""impact"": ""Descripción del impacto""
    }}
  ],
  ""trends"": [
    {{
      ""metric"": ""Nombre de la métrica"",
      ""direction"": ""up"",
      ""change"": 15.5,
      ""description"": ""Descripción de la tendencia""
    }}
  ],
  ""recommendations"": [
    ""Recomendación específica y accionable 1"",
    ""Recomendación específica y accionable 2""
  ],
  ""keyMetrics"": {{
    ""totalRecords"": 0,
    ""dateRange"": ""Rango de fechas"",
    ""mainCategories"": []
  }},
  ""narrative"": {{
    ""introduction"": ""Introducción al análisis..."",
    ""mainFindings"": ""Principales hallazgos..."",
    ""conclusions"": ""Conclusiones y próximos pasos...""
  }}
}}

=== CONTEXTO ESPECÍFICO ===
- Tipo de análisis: {request.Config?.AnalysisType ?? "general"}
- Idioma: {request.Config?.Language ?? "es"}
- Tono: {request.Config?.Tone ?? "profesional"}
- Enfoque: Genera insights accionables y narrativa comprensible

Genera el JSON ahora:";
        }
        */

        private string GetSampleDataForContext(List<List<object>> data)
        {
            if (data == null || data.Count < 2) return "Sin datos de muestra";

            var sample = new StringBuilder();
            sample.AppendLine("Primeras 5 filas de datos:");

            var rowsToShow = Math.Min(6, data.Count); // Headers + 5 filas
            for (int i = 0; i < rowsToShow; i++)
            {
                sample.AppendLine($"Fila {i}: {string.Join(", ", data[i])}");
            }

            if (data.Count > 6)
            {
                sample.AppendLine($"... y {data.Count - 6} filas adicionales");
            }

            return sample.ToString();
        }

        private string ExtractAndValidateJson(string rawResponse)
        {
            try
            {
                // Intentar encontrar JSON en la respuesta
                var jsonMatch = Regex.Match(rawResponse, @"\{.*\}", RegexOptions.Singleline);

                if (!jsonMatch.Success)
                {
                    _logger.LogWarning("No se encontró JSON en la respuesta: {Response}", rawResponse);
                    return GenerateFallbackResponse(rawResponse);
                }

                var jsonString = jsonMatch.Value;

                // Validar que el JSON sea válido
                using (var doc = JsonDocument.Parse(jsonString))
                {
                    // Si llegamos aquí, el JSON es válido
                    _logger.LogDebug("JSON válido extraído: {Json}", jsonString);
                    return jsonString;
                }
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "JSON inválido encontrado. Respuesta original: {Response}", rawResponse);
                return GenerateFallbackResponse(rawResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inesperado procesando JSON");
                return GenerateFallbackResponse(rawResponse);
            }
        }

        private string GenerateFallbackResponse(string originalResponse)
        {
            return JsonSerializer.Serialize(new
            {
                title = "Análisis de Datos",
                summary = $"Se procesaron los datos pero hubo un problema con el formato de respuesta. Respuesta original: {originalResponse?.Substring(0, Math.Min(200, originalResponse.Length))}...",
                insights = new[]
                {
                    new
                    {
                        title = "Error de Procesamiento",
                        description = "El modelo no pudo generar una respuesta en el formato esperado",
                        severity = "Media",
                        confidence = 0.5,
                        impact = "Se requiere revisión manual"
                    }
                },
                trends = new object[0],
                recommendations = new[]
                {
                    "Verificar la configuración del modelo",
                    "Revisar el prompt utilizado",
                    "Considerar usar un modelo diferente"
                },
                keyMetrics = new
                {
                    totalRecords = 0,
                    dateRange = "No disponible",
                    mainCategories = new string[0]
                },
                narrative = new
                {
                    introduction = "Hubo un problema procesando los datos.",
                    mainFindings = "No se pudieron extraer hallazgos debido a un error de formato.",
                    conclusions = "Se recomienda revisar la configuración del sistema."
                }
            });
        }

        private string ConvertToMarkdownTable(List<List<object>> data, int maxRows = 10)
        {
            if (data == null || data.Count == 0)
                return "No hay datos disponibles";

            var table = new StringBuilder();

            // Limitar las filas para evitar prompts muy largos
            var rowsToProcess = Math.Min(data.Count, maxRows);

            // Encabezados
            table.AppendLine("| " + string.Join(" | ", data[0]) + " |");
            table.AppendLine("|" + string.Join("|", data[0].Select(_ => "---")) + "|");

            // Filas de datos
            for (int i = 1; i < rowsToProcess; i++)
            {
                table.AppendLine("| " + string.Join(" | ", data[i]) + " |");
            }

            if (data.Count > maxRows)
            {
                table.AppendLine($"... y {data.Count - 10} filas adicionales");
            }

            return table.ToString();
        }
        private AnalysisResult ParseAnalysisResponse(string response)
        {
            try
            {
                _logger.LogDebug("Parseando respuesta de análisis: {Response}", response);

                var parsed = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(response);

                if (parsed == null)
                {
                    throw new InvalidOperationException("No se pudo parsear la respuesta JSON");
                }

                // Comprobación de integridad del JSON
                if (!parsed.ContainsKey("title") || !parsed.ContainsKey("summary") || !parsed.ContainsKey("recommendations"))
                {
                    _logger.LogWarning("La respuesta JSON extraída de Ollama es válida pero está incompleta. Faltan campos clave del prompt simplificado ('title', 'summary', 'recommendations'). Respuesta recibida: {Response}", response);
                }

                return new AnalysisResult
                {
                    Summary = ExtractStringValue(parsed, "summary") ?? "Sin resumen disponible",
                    Insights = ExtractInsights(parsed),
                    Trends = ExtractTrends(parsed),
                    Recommendations = ExtractRecommendations(parsed),
                    GeneratedAt = DateTime.UtcNow,
                    // Campos adicionales si existen
                    Title = ExtractStringValue(parsed, "title"),
                    KeyMetrics = ExtractKeyMetrics(parsed),
                    Narrative = ExtractNarrative(parsed)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error parseando respuesta de análisis");

                return new AnalysisResult
                {
                    Summary = "Error al procesar la respuesta del análisis",
                    Insights = new List<Insight>(),
                    Trends = new List<Trend>(),
                    Recommendations = new List<string> { "Revisar configuración del modelo" },
                    GeneratedAt = DateTime.UtcNow
                };
            }
        }

        private string? ExtractStringValue(Dictionary<string, JsonElement> parsed, string key)
        {
            return parsed.TryGetValue(key, out var element) && element.ValueKind == JsonValueKind.String
                ? element.GetString()
                : null;
        }

        private List<Insight> ExtractInsights(Dictionary<string, JsonElement> parsed)
        {
            try
            {
                if (parsed.TryGetValue("insights", out var insightsElement) &&
                    insightsElement.ValueKind == JsonValueKind.Array)
                {
                    return JsonSerializer.Deserialize<List<Insight>>(insightsElement.GetRawText()) ?? new();
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error extrayendo insights");
            }
            return new List<Insight>();
        }

        private List<Trend> ExtractTrends(Dictionary<string, JsonElement> parsed)
        {
            try
            {
                if (parsed.TryGetValue("trends", out var trendsElement) &&
                    trendsElement.ValueKind == JsonValueKind.Array)
                {
                    return JsonSerializer.Deserialize<List<Trend>>(trendsElement.GetRawText()) ?? new();
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error extrayendo trends");
            }
            return new List<Trend>();
        }

        private List<string> ExtractRecommendations(Dictionary<string, JsonElement> parsed)
        {
            try
            {
                if (parsed.TryGetValue("recommendations", out var recElement) &&
                    recElement.ValueKind == JsonValueKind.Array)
                {
                    return JsonSerializer.Deserialize<List<string>>(recElement.GetRawText()) ?? new();
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error extrayendo recommendations");
            }
            return new List<string>();
        }

        private object? ExtractKeyMetrics(Dictionary<string, JsonElement> parsed)
        {
            try
            {
                if (parsed.TryGetValue("keyMetrics", out var metricsElement))
                {
                    return JsonSerializer.Deserialize<object>(metricsElement.GetRawText());
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error extrayendo keyMetrics");
            }
            return null;
        }

        private object? ExtractNarrative(Dictionary<string, JsonElement> parsed)
        {
            try
            {
                if (parsed.TryGetValue("narrative", out var narrativeElement))
                {
                    return JsonSerializer.Deserialize<object>(narrativeElement.GetRawText());
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error extrayendo narrative");
            }
            return null;
        }


    }


}