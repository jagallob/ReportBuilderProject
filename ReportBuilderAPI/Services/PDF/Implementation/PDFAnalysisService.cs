using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using iTextSharp.text.pdf;
using iTextSharp.text.pdf.parser;
using Microsoft.Extensions.Logging;
using ReportBuilderAPI.Models;
using ReportBuilderAPI.Services.AI.Interfaces;
using ReportBuilderAPI.Services.PDF.Interfaces;

namespace ReportBuilderAPI.Services.PDF.Implementation
{
    public class PDFAnalysisService : IPDFAnalysisService
    {
        private readonly IAnthropicService _anthropicService;
        private readonly ILogger<PDFAnalysisService> _logger;

        public PDFAnalysisService(
            IAnthropicService anthropicService,
            ILogger<PDFAnalysisService> logger)
        {
            _anthropicService = anthropicService;
            _logger = logger;
        }

        public async Task<PDFAnalysisResult> AnalyzePDFAsync(string filePath, PDFAnalysisConfig config)
        {
            try
            {
                _logger.LogInformation("Iniciando análisis de PDF: {FilePath}", filePath);

                using var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
                return await AnalyzePDFFromStreamAsync(fileStream, config);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analizando PDF: {FilePath}", filePath);
                throw;
            }
        }

        public async Task<PDFAnalysisResult> AnalyzePDFFromStreamAsync(Stream pdfStream, PDFAnalysisConfig config)
        {
            try
            {
                _logger.LogInformation("Analizando PDF desde stream");

                var result = new PDFAnalysisResult();

                // Extraer texto estructurado
                var structuredText = await ExtractStructuredTextFromStreamAsync(pdfStream);
                result.DocumentTitle = ExtractDocumentTitle(structuredText);

                // Identificar secciones usando AI
                if (config.IdentifySections)
                {
                    result.Sections = await IdentifySectionsWithAIAsync(structuredText, config);
                }

                // Identificar componentes en cada sección
                if (config.IdentifyComponents)
                {
                    foreach (var section in result.Sections)
                    {
                        section.Components = await IdentifyComponentsAsync(section.Content, section.PageNumber);
                    }
                }

                // Sugerir asignaciones de áreas
                if (config.SuggestAreaAssignments)
                {
                    // Por ahora usamos áreas hardcodeadas, después se cargarán desde la BD
                    var availableAreas = GetDefaultAreas();
                    result.SuggestedAreaAssignments = await SuggestAreaAssignmentsAsync(result, availableAreas);
                }

                _logger.LogInformation("Análisis de PDF completado. Secciones identificadas: {SectionCount}", result.Sections.Count);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analizando PDF desde stream");
                throw;
            }
        }

        public async Task<List<GeneratedSectionTemplate>> GenerateSectionTemplatesAsync(PDFAnalysisResult analysis, List<Area> availableAreas)
        {
            try
            {
                _logger.LogInformation("Generando plantillas de secciones para {SectionCount} secciones", analysis.Sections.Count);

                var templates = new List<GeneratedSectionTemplate>();

                foreach (var section in analysis.Sections)
                {
                    var template = await GenerateSectionTemplateAsync(section, availableAreas);
                    if (template != null)
                    {
                        templates.Add(template);
                    }
                }

                return templates;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generando plantillas de secciones");
                throw;
            }
        }

        public async Task<List<AreaAssignment>> SuggestAreaAssignmentsAsync(PDFAnalysisResult analysis, List<Area> availableAreas)
        {
            try
            {
                _logger.LogInformation("Sugiriendo asignaciones de áreas para {SectionCount} secciones", analysis.Sections.Count);

                var assignments = new List<AreaAssignment>();

                foreach (var section in analysis.Sections)
                {
                    var assignment = await SuggestAreaAssignmentForSectionAsync(section, availableAreas);
                    if (assignment != null)
                    {
                        assignments.Add(assignment);
                    }
                }

                return assignments;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sugiriendo asignaciones de áreas");
                throw;
            }
        }

        public async Task<List<PDFComponent>> IdentifyComponentsAsync(string content, int pageNumber)
        {
            try
            {
                var components = new List<PDFComponent>();

                // Identificar tablas usando patrones regex
                var tablePatterns = new[]
                {
                    @"(\|[^\n]*\|[\s\S]*?)(?=\n\n|\n[^|]|$)",
                    @"(\+[-=]+\+[\s\S]*?)(?=\n\n|\n[^+]|$)"
                };

                foreach (var pattern in tablePatterns)
                {
                    var matches = Regex.Matches(content, pattern, RegexOptions.Multiline);
                    foreach (Match match in matches)
                    {
                        components.Add(new PDFComponent
                        {
                            Type = ComponentType.Table,
                            Content = match.Value,
                            Caption = "Tabla identificada",
                            Position = new ComponentPosition { Page = pageNumber }
                        });
                    }
                }

                // Identificar KPIs usando AI
                var kpiPrompt = $@"
Analiza el siguiente contenido y identifica posibles KPIs o métricas importantes:

{content}

Responde en formato JSON con la siguiente estructura:
{{
    ""kpis"": [
        {{
            ""name"": ""nombre del KPI"",
            ""value"": ""valor identificado"",
            ""description"": ""descripción del KPI""
        }}
    ]
}}";

                try
                {
                    var kpiResponse = await _anthropicService.GenerateTextAsync(kpiPrompt);
                    var kpiData = JsonSerializer.Deserialize<Dictionary<string, object>>(kpiResponse);
                    
                    if (kpiData != null && kpiData.ContainsKey("kpis"))
                    {
                        // Procesar KPIs identificados
                        // Implementar lógica de parsing según la respuesta
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Error identificando KPIs con AI");
                }

                return components;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error identificando componentes");
                return new List<PDFComponent>();
            }
        }

        public async Task<string> ExtractStructuredTextAsync(string filePath)
        {
            try
            {
                using var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
                return await ExtractStructuredTextFromStreamAsync(fileStream);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error extrayendo texto estructurado");
                throw;
            }
        }

        private async Task<string> ExtractStructuredTextFromStreamAsync(Stream pdfStream)
        {
            try
            {
                var textBuilder = new StringBuilder();
                var reader = new PdfReader(pdfStream);

                for (int page = 1; page <= reader.NumberOfPages; page++)
                {
                    var strategy = new LocationTextExtractionStrategy();
                    var pageText = PdfTextExtractor.GetTextFromPage(reader, page, strategy);
                    
                    textBuilder.AppendLine($"=== PÁGINA {page} ===");
                    textBuilder.AppendLine(pageText);
                    textBuilder.AppendLine();
                }

                reader.Close();
                return textBuilder.ToString();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error extrayendo texto del PDF");
                throw;
            }
        }

        private string ExtractDocumentTitle(string content)
        {
            try
            {
                // Buscar el título en las primeras líneas
                var lines = content.Split('\n', StringSplitOptions.RemoveEmptyEntries);
                foreach (var line in lines.Take(10))
                {
                    var trimmedLine = line.Trim();
                    if (!string.IsNullOrEmpty(trimmedLine) && 
                        !trimmedLine.StartsWith("===") && 
                        trimmedLine.Length > 5 && 
                        trimmedLine.Length < 100)
                    {
                        return trimmedLine;
                    }
                }
                return "Documento sin título";
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error extrayendo título del documento");
                return "Documento sin título";
            }
        }

        private async Task<List<PDFSection>> IdentifySectionsWithAIAsync(string content, PDFAnalysisConfig config)
        {
            try
            {
                var prompt = $@"
Analiza el siguiente documento PDF de Informe Periódico de Fin de Ejercicio y identifica sus secciones principales de manera estructurada.

INSTRUCCIONES ESPECÍFICAS:
1. Identifica las secciones principales del informe (incluyendo aspectos financieros, ambientales, sociales, de gobernanza, jurídicos, de sostenibilidad, de riesgo, operacionales, etc.)
2. Para cada sección, extrae el título exacto y subtítulos si existen
3. Identifica el contenido principal de cada sección (máximo 300 caracteres para evitar truncamiento)
4. Determina el número de página donde aparece cada sección
5. Establece el orden lógico de las secciones en el documento
6. Identifica palabras clave relevantes para cada sección (máximo 3 palabras clave)
7. Clasifica el tipo de contenido (texto|datos|graficos|tablas|mixto)

TIPOS DE SECCIONES ESPERADAS EN INFORMES PERIÓDICOS DE FIN DE EJERCICIO:
- Aspectos Generales de la Operación
- Desempeño Bursátil y Financiero
- Prácticas de Sostenibilidad e Inversión Responsable
- Información Ambiental y de Sostenibilidad
- Aspectos Sociales y de Recursos Humanos
- Gobernanza Corporativa
- Gestión de Riesgos
- Información Jurídica y Regulatoria
- Estados Financieros y Análisis Financiero
- Indicadores de Sostenibilidad (ESG)
- Información de Mercado y Competencia
- Anexos y Documentación Complementaria

Documento a analizar:
{content}

IMPORTANTE: 
- Responde ÚNICAMENTE en formato JSON válido
- Limita el contenido a 300 caracteres máximo por sección
- Usa máximo 3 palabras clave por sección
- Asegúrate de que el JSON sea válido y completo

Estructura JSON:
{{
    ""sections"": [
        {{
            ""title"": ""Título exacto de la sección"",
            ""subtitle"": ""Subtítulo si existe, o cadena vacía"",
            ""content"": ""Contenido principal (máximo 300 caracteres)"",
            ""pageNumber"": 1,
            ""order"": 1,
            ""keywords"": [""palabra1"", ""palabra2"", ""palabra3""],
            ""contentType"": ""texto|datos|graficos|tablas|mixto""
        }}
    ]
}}";

                var response = await _anthropicService.GenerateTextAsync(prompt);
                var sections = new List<PDFSection>();

                try
                {
                    _logger.LogInformation("Primer intento de parsing - Respuesta de AI: {Response}", response.Length > 500 ? response.Substring(0, 500) + "..." : response);
                    
                    var jsonData = JsonSerializer.Deserialize<Dictionary<string, object>>(response);
                    _logger.LogInformation("JSON deserializado exitosamente. Propiedades: {Properties}", jsonData != null ? string.Join(", ", jsonData.Keys) : "null");
                    
                    if (jsonData != null && jsonData.ContainsKey("sections"))
                    {
                        _logger.LogInformation("Propiedad 'sections' encontrada, llamando a ParseSectionsFromAIResponse");
                        sections = ParseSectionsFromAIResponse(response);
                    }
                    else
                    {
                        _logger.LogWarning("Propiedad 'sections' NO encontrada en el primer intento. Llamando a ParseSectionsFromAIResponse como fallback");
                        sections = ParseSectionsFromAIResponse(response);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Error parseando respuesta de AI para secciones");
                    // Fallback: crear sección básica
                    sections.Add(new PDFSection
                    {
                        Title = "Contenido Principal",
                        Content = content.Substring(0, Math.Min(1000, content.Length)),
                        PageNumber = 1,
                        Order = 1
                    });
                }

                return sections;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error identificando secciones con AI");
                return new List<PDFSection>();
            }
        }

        private List<PDFSection> ParseSectionsFromAIResponse(string aiResponse)
        {
            try
            {
                var sections = new List<PDFSection>();
                
                _logger.LogInformation("Respuesta de AI recibida (primeros 500 chars): {Response}", aiResponse.Length > 500 ? aiResponse.Substring(0, 500) + "..." : aiResponse);
                
                // Limpiar la respuesta para extraer solo el JSON
                var jsonStart = aiResponse.IndexOf('{');
                var jsonEnd = aiResponse.LastIndexOf('}');
                
                if (jsonStart == -1 || jsonEnd == -1 || jsonEnd <= jsonStart)
                {
                    _logger.LogWarning("No se encontró JSON válido en la respuesta de AI");
                    return CreateFallbackSection(aiResponse);
                }
                
                var jsonContent = aiResponse.Substring(jsonStart, jsonEnd - jsonStart + 1);
                _logger.LogInformation("JSON extraído: {JsonContent}", jsonContent);
                
                try
                {
                    var jsonData = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(jsonContent);
                    
                    // Verificar si es una respuesta de Anthropic con estructura de mensaje
                    if (jsonData != null && jsonData.ContainsKey("content") && jsonData["content"].ValueKind == JsonValueKind.Array)
                    {
                        var contentArray = jsonData["content"];
                        if (contentArray.GetArrayLength() > 0)
                        {
                            var firstContent = contentArray[0];
                            if (firstContent.TryGetProperty("text", out var textElement))
                            {
                                var textContent = textElement.GetString();
                                _logger.LogInformation("Contenido de texto encontrado en respuesta de Anthropic: {TextContent}", textContent?.Length > 200 ? textContent.Substring(0, 200) + "..." : textContent);
                                
                                // Extraer JSON del texto (eliminar ```json y ```)
                                var jsonText = textContent?.Replace("```json", "").Replace("```", "").Trim();
                                if (!string.IsNullOrEmpty(jsonText))
                                {
                                    var actualJsonData = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(jsonText);
                                    if (actualJsonData != null && actualJsonData.ContainsKey("sections"))
                                    {
                                        var sectionsArray = actualJsonData["sections"];
                                        _logger.LogInformation("Secciones encontradas en JSON real: {SectionsCount}", sectionsArray.ValueKind == JsonValueKind.Array ? sectionsArray.GetArrayLength() : 0);
                                        
                                        if (sectionsArray.ValueKind == JsonValueKind.Array)
                                        {
                                            foreach (var sectionElement in sectionsArray.EnumerateArray())
                                            {
                                                var section = ParseSectionFromJson(sectionElement);
                                                if (section != null)
                                                {
                                                    sections.Add(section);
                                                    _logger.LogInformation("Sección parseada: {Title}", section.Title);
                                                }
                                                else
                                                {
                                                    _logger.LogWarning("Sección no pudo ser parseada");
                                                }
                                            }
                                        }
                                        else
                                        {
                                            _logger.LogWarning("La propiedad 'sections' no es un array: {ValueKind}", sectionsArray.ValueKind);
                                        }
                                    }
                                    else
                                    {
                                        _logger.LogWarning("No se encontró la propiedad 'sections' en el JSON real. Propiedades disponibles: {Properties}", actualJsonData != null ? string.Join(", ", actualJsonData.Keys) : "null");
                                    }
                                }
                                else
                                {
                                    _logger.LogWarning("El contenido de texto está vacío después de limpiar");
                                }
                            }
                            else
                            {
                                _logger.LogWarning("No se encontró la propiedad 'text' en el primer elemento de content");
                            }
                        }
                        else
                        {
                            _logger.LogWarning("El array 'content' está vacío");
                        }
                    }
                    else if (jsonData != null && jsonData.ContainsKey("sections"))
                    {
                        // Formato directo (fallback)
                        var sectionsArray = jsonData["sections"];
                        _logger.LogInformation("Secciones encontradas en JSON directo: {SectionsCount}", sectionsArray.ValueKind == JsonValueKind.Array ? sectionsArray.GetArrayLength() : 0);
                        
                        if (sectionsArray.ValueKind == JsonValueKind.Array)
                        {
                            foreach (var sectionElement in sectionsArray.EnumerateArray())
                            {
                                var section = ParseSectionFromJson(sectionElement);
                                if (section != null)
                                {
                                    sections.Add(section);
                                    _logger.LogInformation("Sección parseada: {Title}", section.Title);
                                }
                                else
                                {
                                    _logger.LogWarning("Sección no pudo ser parseada");
                                }
                            }
                        }
                    }
                    else
                    {
                        _logger.LogWarning("No se encontró la estructura esperada. Propiedades disponibles: {Properties}", jsonData != null ? string.Join(", ", jsonData.Keys) : "null");
                    }
                }
                catch (JsonException ex)
                {
                    _logger.LogError(ex, "Error deserializando JSON de AI: {JsonContent}", jsonContent);
                    return CreateFallbackSection(aiResponse);
                }
                
                if (sections.Count == 0)
                {
                    _logger.LogWarning("No se pudieron parsear secciones válidas, usando fallback");
                    return CreateFallbackSection(aiResponse);
                }
                
                _logger.LogInformation("Secciones parseadas exitosamente: {Count}", sections.Count);
                return sections;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error parseando respuesta de AI");
                return CreateFallbackSection(aiResponse);
            }
        }
        
        private PDFSection? ParseSectionFromJson(JsonElement sectionElement)
        {
            try
            {
                var section = new PDFSection();
                
                if (sectionElement.TryGetProperty("title", out var titleElement))
                    section.Title = titleElement.GetString() ?? "Sin título";
                
                if (sectionElement.TryGetProperty("subtitle", out var subtitleElement))
                    section.Subtitle = subtitleElement.GetString() ?? "";
                
                if (sectionElement.TryGetProperty("content", out var contentElement))
                    section.Content = contentElement.GetString() ?? "";
                
                if (sectionElement.TryGetProperty("pageNumber", out var pageElement))
                    section.PageNumber = pageElement.GetInt32();
                
                if (sectionElement.TryGetProperty("order", out var orderElement))
                    section.Order = orderElement.GetInt32();
                
                if (sectionElement.TryGetProperty("keywords", out var keywordsElement) && keywordsElement.ValueKind == JsonValueKind.Array)
                {
                    section.Keywords = keywordsElement.EnumerateArray()
                        .Select(k => k.GetString())
                        .Where(k => !string.IsNullOrEmpty(k))
                        .ToList();
                }
                else
                {
                    section.Keywords = new List<string>();
                }
                
                if (sectionElement.TryGetProperty("contentType", out var contentTypeElement))
                    section.ContentType = contentTypeElement.GetString() ?? "texto";
                
                // Generar ID único para la sección
                section.Id = Guid.NewGuid().ToString();
                
                return section;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error parseando sección individual del JSON");
                return null;
            }
        }
        
        private List<PDFSection> CreateFallbackSection(string aiResponse)
        {
            return new List<PDFSection>
            {
                new PDFSection
                {
                    Id = Guid.NewGuid().ToString(),
                    Title = "Contenido del Informe",
                    Content = aiResponse.Length > 1000 ? aiResponse.Substring(0, 1000) + "..." : aiResponse,
                    PageNumber = 1,
                    Order = 1,
                    Keywords = new List<string> { "informe", "financiero", "análisis" },
                    ContentType = "texto"
                }
            };
        }

        private async Task<GeneratedSectionTemplate> GenerateSectionTemplateAsync(PDFSection section, List<Area> availableAreas)
        {
            try
            {
                var prompt = $@"
Basándote en la siguiente sección de un documento, genera una plantilla de componentes para crear una sección similar:

Título: {section.Title}
Contenido: {section.Content}
Componentes identificados: {string.Join(", ", section.Components.Select(c => c.Type))}

Genera una plantilla JSON con la siguiente estructura:
{{
    ""sectionTitle"": ""Título de la sección"",
    ""components"": [
        {{
            ""type"": ""Text|Table|Chart|Image|KPI"",
            ""title"": ""Título del componente"",
            ""description"": ""Descripción del componente"",
            ""required"": true,
            ""order"": 1,
            ""configuration"": {{}}
        }}
    ],
    ""instructions"": ""Instrucciones para completar esta sección""
}}";

                var response = await _anthropicService.GenerateTextAsync(prompt);
                
                // Parsear respuesta y crear template
                // Implementar lógica de parsing
                
                return new GeneratedSectionTemplate
                {
                    SectionId = section.Id,
                    SectionTitle = section.Title,
                    AreaId = 1, // Asignar área apropiada
                    AreaName = "Área General",
                    Components = new List<ComponentTemplate>(),
                    Instructions = "Completar sección según el contenido original"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generando plantilla para sección: {SectionTitle}", section.Title);
                return null;
            }
        }

        private async Task<AreaAssignment> SuggestAreaAssignmentForSectionAsync(PDFSection section, List<Area> availableAreas)
        {
            try
            {
                var prompt = $@"
Analiza la siguiente sección y sugiere a qué área debería asignarse:

Título: {section.Title}
Contenido: {section.Content}
Palabras clave: {string.Join(", ", section.Keywords)}

Áreas disponibles:
{string.Join("\n", availableAreas.Select(a => $"- {a.Id}: {a.Name}"))}

Responde en formato JSON:
{{
    ""areaId"": 1,
    ""areaName"": ""Nombre del área"",
    ""confidence"": 0.85,
    ""reasoning"": [""Razón 1"", ""Razón 2""],
    ""requiredComponents"": [""Text"", ""Table""]
}}";

                var response = await _anthropicService.GenerateTextAsync(prompt);
                
                // Parsear respuesta y crear asignación
                // Implementar lógica de parsing
                
                return new AreaAssignment
                {
                    SectionId = section.Id,
                    SectionTitle = section.Title,
                    AreaId = 1,
                    AreaName = "Área General",
                    Confidence = 0.8,
                    Reasoning = new List<string> { "Asignación automática" },
                    RequiredComponents = new List<ComponentType> { ComponentType.Text }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sugiriendo asignación para sección: {SectionTitle}", section.Title);
                return null;
            }
        }

        private List<Area> GetDefaultAreas()
        {
            // Áreas por defecto para testing
            return new List<Area>
            {
                new Area { Id = 1, Name = "Finanzas" },
                new Area { Id = 2, Name = "Recursos Humanos" },
                new Area { Id = 3, Name = "Operaciones" },
                new Area { Id = 4, Name = "Marketing" },
                new Area { Id = 5, Name = "Tecnología" }
            };
        }
    }
} 