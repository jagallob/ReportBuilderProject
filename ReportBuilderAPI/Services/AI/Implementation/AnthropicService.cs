using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ReportBuilderAPI.Configuration;
using ReportBuilderAPI.Services.AI.Interfaces;
using ReportBuilderAPI.Services.AI.Models;

namespace ReportBuilderAPI.Services.AI.Implementation
{
    public class AnthropicService : IAnthropicService
    {
        private readonly HttpClient _httpClient;
        private readonly AISettings _settings;
        private readonly ILogger<AnthropicService> _logger;

        public AnthropicService(
            HttpClient httpClient,
            IOptions<AISettings> settings,
            ILogger<AnthropicService> logger)
        {
            _httpClient = httpClient;
            _settings = settings.Value;
            _logger = logger;

            _httpClient.BaseAddress = new Uri("https://api.anthropic.com/");
            _httpClient.Timeout = TimeSpan.FromSeconds(_settings.Anthropic.TimeoutSeconds);
            _httpClient.DefaultRequestHeaders.Add("x-api-key", _settings.Anthropic.ApiKey);
            _httpClient.DefaultRequestHeaders.Add("anthropic-version", "2023-06-01");
        }

        public async Task<string> GenerateTextAsync(string prompt, string? model = null)
        {
            try
            {
                var requestModel = model ?? _settings.Anthropic.Model;
                _logger.LogInformation("Generando texto con Anthropic usando modelo: {Model}", requestModel);

                var requestBody = new
                {
                    model = requestModel,
                    max_tokens = _settings.Anthropic.MaxTokens,
                    temperature = _settings.Anthropic.Temperature,
                    messages = new[]
                    {
                        new
                        {
                            role = "user",
                            content = prompt
                        }
                    }
                };

                var json = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync("v1/messages", content);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Error en Anthropic API: {StatusCode} - {ErrorContent}",
                        response.StatusCode, errorContent);
                    throw new HttpRequestException($"Error en Anthropic API: {response.StatusCode}");
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                return responseContent;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en AnthropicService.GenerateTextAsync");
                throw;
            }
        }

        public async Task<AnalysisResult> AnalyzeDataAsync(AnalysisRequest request)
        {
            try
            {
                if (request.Data == null || request.Data.Count == 0)
                {
                    _logger.LogWarning("Datos de análisis vacíos o nulos");
                    return new AnalysisResult { Title = "Error", Summary = "No se proporcionaron datos para analizar" };
                }

                _logger.LogInformation("Iniciando análisis con Anthropic para tipo: {AnalysisType}",
                    request.Config?.AnalysisType ?? "No especificado");

                var prompt = BuildAnalysisPrompt(request);
                var response = await GenerateTextAsync(prompt);

                return ParseAnalysisResponse(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en AnthropicService.AnalyzeDataAsync");
                throw;
            }
        }

        public async Task<NarrativeResult> GenerateNarrativeAsync(NarrativeRequest request)
        {
            try
            {
                _logger.LogInformation("Generando narrativa con Anthropic para template: {TemplateId}", request.TemplateId);

                var prompt = BuildNarrativePrompt(request);
                var response = await GenerateTextAsync(prompt);

                return ParseNarrativeResponse(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en AnthropicService.GenerateNarrativeAsync");
                throw;
            }
        }

        public async Task<float[]> GenerateEmbeddingAsync(string text)
        {
            try
            {
                _logger.LogDebug("Generando embedding con Anthropic para texto de {Length} caracteres", text.Length);

                var requestBody = new
                {
                    model = "claude-3-sonnet-20240229",
                    input = text
                };

                var json = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync("v1/embeddings", content);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Error generando embedding: {StatusCode} - {ErrorContent}",
                        response.StatusCode, errorContent);
                    throw new HttpRequestException($"Error generando embedding: {response.StatusCode}");
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                var embeddingResponse = JsonSerializer.Deserialize<AnthropicEmbeddingResponse>(responseContent);

                return embeddingResponse?.Data?.FirstOrDefault()?.Embedding ?? Array.Empty<float>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generando embedding con Anthropic");
                throw;
            }
        }

        public async Task<bool> IsHealthyAsync()
        {
            try
            {
                // Anthropic no tiene un endpoint de health check, así que hacemos una prueba simple
                var testPrompt = "Hello";
                var response = await GenerateTextAsync(testPrompt);
                return !string.IsNullOrEmpty(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verificando estado de Anthropic");
                return false;
            }
        }

        private string BuildAnalysisPrompt(AnalysisRequest request)
        {
            var tableData = ConvertToMarkdownTable(request.Data, 10);
            var analysisType = request.Config?.AnalysisType ?? "comprehensive";

            return $@"
IMPORTANTE: Debes responder EXCLUSIVAMENTE con un JSON válido siguiendo EXACTAMENTE la estructura especificada.
No incluyas ningún texto fuera del JSON. No uses markdown. No uses ```json```.

=== ESTRUCTURA REQUERIDA ===
{{
    ""title"": ""string"",
    ""summary"": ""string"",
    ""keyMetrics"": {{...}},
    ""insights"": [...],
    ""trends"": [...],
    ""recommendations"": [...],
    ""narrative"": ""string""
}}

=== DATOS ===
{tableData}

=== INSTRUCCIONES ===
Analiza los datos y completa TODOS los campos del JSON requerido.
El tipo de análisis debe ser: '{analysisType}'
";
        }

        private string BuildNarrativePrompt(NarrativeRequest request)
        {
            var analysisJson = JsonSerializer.Serialize(request.Analysis);
            var tone = request.Config?.Tone ?? "professional";
            var language = request.Config?.Language ?? "es";
            
            // Convertir los datos del Excel a tabla markdown
            var dataTable = ConvertToMarkdownTable(request.ExcelData, 20);

            return $@"
Eres un analista de datos experto en crear narrativas profesionales para reportes ejecutivos.

=== CONTEXTO ===
Template ID: {request.TemplateId}
Tono: {tone}
Idioma: {language}

=== DATOS ORIGINALES DEL EXCEL ===
{dataTable}

=== ANÁLISIS PREVIO ===
Antes de generar la narrativa, identifica el tipo de datos proporcionados:

**SECTORES COMERCIALES:**
- Ventas, ingresos, productos → Análisis comercial/financiero
- Consumo, energía, gas, electricidad → Análisis de consumo energético
- Transporte, viajes, logística → Análisis de transporte y movilidad
- Turismo, hoteles, reservas → Análisis turístico
- Restaurantes, comida, servicios gastronómicos → Análisis gastronómico

**SECTORES PÚBLICOS:**
- Gobierno, servicios públicos, administración → Análisis del sector público
- Educación, escuelas, universidades → Análisis educativo
- Salud, hospitales, médicos → Análisis de salud
- Seguridad, policía, emergencias → Análisis de seguridad pública

**SECTORES OPERACIONALES:**
- Empleados, departamentos, recursos humanos → Análisis de RRHH
- Métricas, KPIs, indicadores → Análisis de rendimiento
- Tiempo, fechas, períodos → Análisis temporal
- Producción, manufactura, operaciones → Análisis operacional

**OTROS SECTORES:**
- Cualquier otro tipo de datos → Análisis general adaptado al contexto

=== INSTRUCCIONES ===
Analiza los datos del Excel proporcionados y genera una narrativa profesional que incluya:

1. **Título**: Un título atractivo y descriptivo basado en el tipo de datos analizados
2. **Contenido Principal**: Una narrativa completa que explique los patrones, tendencias y hallazgos encontrados en los datos del Excel
3. **Puntos Clave**: Lista de los hallazgos más importantes extraídos del análisis de los datos
4. **Secciones**: Objeto con secciones organizadas que estructure la información de manera lógica

IMPORTANTE: 
- Analiza directamente los datos del Excel proporcionados
- Identifica patrones, tendencias y anomalías en los datos
- Usa terminología y métricas apropiadas para el sector identificado
- Enfócate en los patrones y tendencias relevantes para ese tipo de negocio o actividad
- Genera insights específicos basados en los datos reales del Excel
- Menciona valores específicos, rangos, promedios y hallazgos concretos de los datos

=== ESTRUCTURA JSON EXACTA ===
Responde EXCLUSIVAMENTE con un JSON válido siguiendo esta estructura exacta:

{{
    ""title"": ""Título de la narrativa"",
    ""content"": ""El análisis de los datos del Excel muestra los patrones y tendencias identificados en la información proporcionada. Los resultados indican las características principales y hallazgos relevantes del conjunto de datos analizado. Durante el período analizado, se observaron patrones significativos que revelan información valiosa sobre el rendimiento y las tendencias del conjunto de datos evaluado."",
    
}}

IMPORTANTE: 
- El campo content debe contener SOLO texto narrativo plano y legible
- NO uses ```json, ```text, o cualquier formato de código markdown
- NO incluyas arrays o objetos JSON dentro del contenido
- NO devuelvas JSON dentro de bloques de código
- El contenido debe ser texto narrativo puro y legible
- No incluyas campos adicionales
- Responde ÚNICAMENTE con el JSON especificado, sin explicaciones adicionales
";
        }

        private string ConvertToMarkdownTable(List<List<object>> data, int maxRows = 10)
        {
            if (data == null || !data.Any())
                return "No hay datos disponibles.";

            var limitedData = data.Take(maxRows).ToList();
            List<string> headers = new List<string>();
            bool useFirstRowAsHeaders = false;

            if (data.FirstOrDefault()?.All(cell =>
                cell != null &&
                (cell is string str && !string.IsNullOrWhiteSpace(str) && !decimal.TryParse(str, out _)) == true) ?? false)
            {
                headers = data.First().Select(cell => cell?.ToString()?.Trim() ?? "").ToList();
                limitedData = data.Skip(1).Take(maxRows).ToList();
                useFirstRowAsHeaders = true;
            }
            else
            {
                headers = data.FirstOrDefault()?.Select((_, index) => $"Columna {index + 1}").ToList() ?? new List<string>();
            }

            var table = new StringBuilder();
            table.AppendLine("| " + string.Join(" | ", headers) + " |");
            table.AppendLine("| " + string.Join(" | ", headers.Select(_ => "---")) + " |");

            foreach (var row in limitedData)
            {
                var formattedRow = row.Select(cell => cell?.ToString() ?? "").ToList();
                table.AppendLine("| " + string.Join(" | ", formattedRow) + " |");
            }

            if (data.Count > maxRows)
            {
                table.AppendLine($"\n*Mostrando {maxRows} de {data.Count} registros*");
            }

            if (useFirstRowAsHeaders)
            {
                table.AppendLine("\n*Nota: La primera fila del dataset se usó como encabezados*");
            }

            return table.ToString();
        }

        private AnalysisResult ParseAnalysisResponse(string response)
        {
            try
            {
                var cleanedResponse = response.Trim();
                var jsonStart = cleanedResponse.IndexOf('{');
                var jsonEnd = cleanedResponse.LastIndexOf('}');

                if (jsonStart >= 0 && jsonEnd > jsonStart)
                {
                    cleanedResponse = cleanedResponse.Substring(jsonStart, jsonEnd - jsonStart + 1);
                }

                var jsonDocument = JsonDocument.Parse(cleanedResponse);
                var jsonResponse = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(cleanedResponse);

                if (jsonResponse != null)
                {
                    return new AnalysisResult
                    {
                        Title = ExtractStringValue(jsonResponse, "title") ?? "Análisis de Datos",
                        Summary = ExtractStringValue(jsonResponse, "summary") ?? "No se generó resumen",
                        Insights = ExtractInsights(jsonResponse),
                        Trends = ExtractTrends(jsonResponse),
                        Recommendations = ExtractRecommendations(jsonResponse),
                        KeyMetrics = ExtractKeyMetrics(jsonResponse),
                        Narrative = ExtractStringValue(jsonResponse, "narrative"),
                        GeneratedAt = DateTime.UtcNow
                    };
                }

                _logger.LogWarning("Respuesta no contiene JSON válido, procesando como texto plano: {Response}", response);
                return ParsePlainTextResponse(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error parseando respuesta de análisis");
                return new AnalysisResult { Title = "Error", Summary = $"Error: {ex.Message}" };
            }
        }

        private NarrativeResult ParseNarrativeResponse(string response)
        {
            try
            {
                _logger.LogInformation("Respuesta original de AI: {Response}", response.Substring(0, Math.Min(500, response.Length)));
                
                // La respuesta de Anthropic viene en formato: {"id":"...","content":[{"type":"text","text":"{...}"}]}
                var anthropicResponse = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(response);
                
                if (anthropicResponse != null && anthropicResponse.TryGetValue("content", out var contentElement))
                {
                    if (contentElement.ValueKind == JsonValueKind.Array)
                    {
                        var contentArray = contentElement.EnumerateArray().ToList();
                        if (contentArray.Count > 0 && contentArray[0].TryGetProperty("text", out var textElement))
                        {
                            var narrativeJson = textElement.GetString();
                            _logger.LogInformation("JSON de narrativa extraído: {NarrativeJson}", narrativeJson?.Substring(0, Math.Min(500, narrativeJson?.Length ?? 0)));
                            
                            if (!string.IsNullOrEmpty(narrativeJson))
                            {
                                var narrativeResponse = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(narrativeJson);
                                
                                if (narrativeResponse != null)
                                {
                                    var content = ExtractStringValue(narrativeResponse, "content") ?? "No se generó contenido";
                                    _logger.LogInformation("Contenido final extraído: {Content}", content.Substring(0, Math.Min(200, content.Length)));
                                    
                                    return new NarrativeResult
                                    {
                                        Title = ExtractStringValue(narrativeResponse, "title") ?? "Narrativa Generada",
                                        Content = content,
                                        KeyPoints = ExtractKeyPoints(narrativeResponse),
                                        Sections = ExtractSections(narrativeResponse),
                                        GeneratedAt = DateTime.UtcNow
                                    };
                                }
                            }
                        }
                    }
                }

                _logger.LogWarning("Respuesta no contiene JSON válido, procesando como texto plano: {Response}", response);
                return new NarrativeResult
                {
                    Title = "Narrativa Generada",
                    Content = response.Trim(),
                    KeyPoints = new List<string>(),
                    Sections = new Dictionary<string, string>(),
                    GeneratedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error parseando respuesta de narrativa");
                return new NarrativeResult { Title = "Error", Content = $"Error: {ex.Message}" };
            }
        }

        private AnalysisResult ParsePlainTextResponse(string text)
        {
            return new AnalysisResult
            {
                Title = "Análisis de Datos",
                Summary = text.Trim(),
                Insights = new List<Insight>(),
                Trends = new List<Trend>(),
                Recommendations = new List<string>(),
                KeyMetrics = null,
                Narrative = text.Trim(),
                GeneratedAt = DateTime.UtcNow
            };
        }

        private string? ExtractStringValue(Dictionary<string, JsonElement> parsed, string key)
        {
            if (!parsed.TryGetValue(key, out var element))
                return null;

            try
            {
                switch (element.ValueKind)
                {
                    case JsonValueKind.String:
                        return element.GetString();
                    case JsonValueKind.Array:
                        // Si es un array, intentar convertir a string
                        var arrayText = element.GetRawText();
                        return arrayText.Length > 100 ? arrayText.Substring(0, 100) + "..." : arrayText;
                    case JsonValueKind.Object:
                        // Si es un objeto, intentar convertir a string
                        var objectText = element.GetRawText();
                        return objectText.Length > 100 ? objectText.Substring(0, 100) + "..." : objectText;
                    case JsonValueKind.Number:
                        return element.GetDecimal().ToString();
                    case JsonValueKind.True:
                        return "true";
                    case JsonValueKind.False:
                        return "false";
                    case JsonValueKind.Null:
                        return null;
                    default:
                        return element.GetRawText();
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Error extrayendo valor string para clave '{Key}': {Error}", key, ex.Message);
                return element.GetRawText();
            }
        }

        private List<Insight> ExtractInsights(Dictionary<string, JsonElement> parsed)
        {
            if (!parsed.TryGetValue("insights", out var insightsElement) || insightsElement.ValueKind != JsonValueKind.Array)
                return new List<Insight>();

            try
            {
                return JsonSerializer.Deserialize<List<Insight>>(insightsElement.GetRawText()) ?? new List<Insight>();
            }
            catch
            {
                return new List<Insight>();
            }
        }

        private List<Trend> ExtractTrends(Dictionary<string, JsonElement> parsed)
        {
            if (!parsed.TryGetValue("trends", out var trendsElement) || trendsElement.ValueKind != JsonValueKind.Array)
                return new List<Trend>();

            try
            {
                return JsonSerializer.Deserialize<List<Trend>>(trendsElement.GetRawText()) ?? new List<Trend>();
            }
            catch
            {
                return new List<Trend>();
            }
        }

        private List<string> ExtractRecommendations(Dictionary<string, JsonElement> parsed)
        {
            if (!parsed.TryGetValue("recommendations", out var recommendationsElement) || recommendationsElement.ValueKind != JsonValueKind.Array)
                return new List<string>();

            try
            {
                return JsonSerializer.Deserialize<List<string>>(recommendationsElement.GetRawText()) ?? new List<string>();
            }
            catch
            {
                return new List<string>();
            }
        }

        private List<string> ExtractKeyPoints(Dictionary<string, JsonElement> parsed)
        {
            if (!parsed.TryGetValue("keyPoints", out var keyPointsElement) || keyPointsElement.ValueKind != JsonValueKind.Array)
                return new List<string>();

            try
            {
                return JsonSerializer.Deserialize<List<string>>(keyPointsElement.GetRawText()) ?? new List<string>();
            }
            catch
            {
                return new List<string>();
            }
        }

        private Dictionary<string, string> ExtractSections(Dictionary<string, JsonElement> parsed)
        {
            if (!parsed.TryGetValue("sections", out var sectionsElement) || sectionsElement.ValueKind != JsonValueKind.Object)
                return new Dictionary<string, string>();

            try
            {
                return JsonSerializer.Deserialize<Dictionary<string, string>>(sectionsElement.GetRawText()) ?? new Dictionary<string, string>();
            }
            catch
            {
                return new Dictionary<string, string>();
            }
        }

        private object? ExtractKeyMetrics(Dictionary<string, JsonElement> parsed)
        {
            return parsed.TryGetValue("keyMetrics", out var metricsElement) ? metricsElement : null;
        }
    }

    public class AnthropicEmbeddingResponse
    {
        public List<AnthropicEmbeddingData> Data { get; set; } = new List<AnthropicEmbeddingData>();
    }

    public class AnthropicEmbeddingData
    {
        public float[] Embedding { get; set; } = Array.Empty<float>();
    }
}