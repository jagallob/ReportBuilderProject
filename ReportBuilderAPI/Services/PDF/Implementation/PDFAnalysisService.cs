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
Analiza el siguiente documento PDF y identifica sus secciones principales. 
Para cada sección, proporciona:

1. Título de la sección
2. Contenido principal
3. Número de página
4. Orden en el documento
5. Palabras clave relevantes
6. Tipo de contenido (texto, datos, gráficos, etc.)

Documento:
{content}

Responde en formato JSON con la siguiente estructura:
{{
    ""sections"": [
        {{
            ""title"": ""Título de la sección"",
            ""subtitle"": ""Subtítulo opcional"",
            ""content"": ""Contenido principal de la sección"",
            ""pageNumber"": 1,
            ""order"": 1,
            ""keywords"": [""palabra1"", ""palabra2""],
            ""contentType"": ""texto|datos|graficos|mixto""
        }}
    ]
}}";

                var response = await _anthropicService.GenerateTextAsync(prompt);
                var sections = new List<PDFSection>();

                try
                {
                    var jsonData = JsonSerializer.Deserialize<Dictionary<string, object>>(response);
                    if (jsonData != null && jsonData.ContainsKey("sections"))
                    {
                        // Procesar secciones identificadas
                        // Implementar lógica de parsing según la respuesta
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
                
                // Implementar parsing de la respuesta de AI
                // Por ahora, crear una sección básica
                sections.Add(new PDFSection
                {
                    Title = "Sección Analizada",
                    Content = aiResponse,
                    PageNumber = 1,
                    Order = 1,
                    Keywords = new List<string> { "análisis", "AI" }
                });

                return sections;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error parseando respuesta de AI");
                return new List<PDFSection>();
            }
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