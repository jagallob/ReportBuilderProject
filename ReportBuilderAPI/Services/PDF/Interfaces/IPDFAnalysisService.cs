using ReportBuilderAPI.Models;

namespace ReportBuilderAPI.Services.PDF.Interfaces
{
    public interface IPDFAnalysisService
    {
        /// <summary>
        /// Analiza un archivo PDF para extraer su estructura y componentes
        /// </summary>
        Task<PDFAnalysisResult> AnalyzePDFAsync(string filePath, PDFAnalysisConfig config);

        /// <summary>
        /// Analiza un archivo PDF desde un stream
        /// </summary>
        Task<PDFAnalysisResult> AnalyzePDFFromStreamAsync(Stream pdfStream, PDFAnalysisConfig config);

        /// <summary>
        /// Genera plantillas de secciones basadas en el análisis del PDF
        /// </summary>
        Task<List<GeneratedSectionTemplate>> GenerateSectionTemplatesAsync(PDFAnalysisResult analysis, List<Area> availableAreas);

        /// <summary>
        /// Sugiere asignaciones de áreas basadas en el contenido del PDF
        /// </summary>
        Task<List<AreaAssignment>> SuggestAreaAssignmentsAsync(PDFAnalysisResult analysis, List<Area> availableAreas);

        /// <summary>
        /// Identifica componentes específicos en el PDF
        /// </summary>
        Task<List<PDFComponent>> IdentifyComponentsAsync(string content, int pageNumber);

        /// <summary>
        /// Extrae texto estructurado del PDF
        /// </summary>
        Task<string> ExtractStructuredTextAsync(string filePath);
    }
} 