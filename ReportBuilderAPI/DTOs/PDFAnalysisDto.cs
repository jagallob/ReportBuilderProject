using System.ComponentModel.DataAnnotations;
using ReportBuilderAPI.Models;

namespace ReportBuilderAPI.DTOs
{
    /// <summary>
    /// Solicitud para analizar un PDF y generar plantillas consolidadas
    /// </summary>
    public class AnalyzePDFRequest
    {
        [Required]
        public IFormFile? PDFFile { get; set; }

        [Required]
        [StringLength(200)]
        public string TemplateName { get; set; } = string.Empty;

        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Period { get; set; } = string.Empty;

        public DateTime? Deadline { get; set; }

        public PDFAnalysisConfig AnalysisConfig { get; set; } = new PDFAnalysisConfig();
    }

    /// <summary>
    /// Resultado del análisis de PDF
    /// </summary>
    public class PDFAnalysisResponse
    {
        public string DocumentTitle { get; set; } = string.Empty;
        public List<PDFSectionDto> Sections { get; set; } = new List<PDFSectionDto>();
        public List<AreaAssignmentDto> SuggestedAssignments { get; set; } = new List<AreaAssignmentDto>();
        public List<GeneratedSectionTemplateDto> GeneratedTemplates { get; set; } = new List<GeneratedSectionTemplateDto>();
        public Dictionary<string, object> Metadata { get; set; } = new Dictionary<string, object>();
        public DateTime AnalyzedAt { get; set; }
    }

    /// <summary>
    /// DTO para sección de PDF
    /// </summary>
    public class PDFSectionDto
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Subtitle { get; set; } = string.Empty;
        public int PageNumber { get; set; }
        public int Order { get; set; }
        public string Content { get; set; } = string.Empty;
        public List<PDFComponentDto> Components { get; set; } = new List<PDFComponentDto>();
        public List<string> Keywords { get; set; } = new List<string>();
        public string SuggestedArea { get; set; } = string.Empty;
        public double Confidence { get; set; }
    }

    /// <summary>
    /// DTO para componente de PDF
    /// </summary>
    public class PDFComponentDto
    {
        public string Id { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string Caption { get; set; } = string.Empty;
        public ComponentPositionDto Position { get; set; } = new ComponentPositionDto();
        public List<string> DataSources { get; set; } = new List<string>();
    }

    /// <summary>
    /// DTO para posición de componente
    /// </summary>
    public class ComponentPositionDto
    {
        public float X { get; set; }
        public float Y { get; set; }
        public float Width { get; set; }
        public float Height { get; set; }
        public int Page { get; set; }
    }

    /// <summary>
    /// DTO para asignación de área
    /// </summary>
    public class AreaAssignmentDto
    {
        public string SectionId { get; set; } = string.Empty;
        public string SectionTitle { get; set; } = string.Empty;
        public int AreaId { get; set; }
        public string AreaName { get; set; } = string.Empty;
        public double Confidence { get; set; }
        public List<string> Reasoning { get; set; } = new List<string>();
        public List<string> RequiredComponents { get; set; } = new List<string>();
    }

    /// <summary>
    /// DTO para plantilla de sección generada
    /// </summary>
    public class GeneratedSectionTemplateDto
    {
        public string SectionId { get; set; } = string.Empty;
        public string SectionTitle { get; set; } = string.Empty;
        public int AreaId { get; set; }
        public string AreaName { get; set; } = string.Empty;
        public List<ComponentTemplateDto> Components { get; set; } = new List<ComponentTemplateDto>();
        public string Instructions { get; set; } = string.Empty;
        public List<string> RequiredDataSources { get; set; } = new List<string>();
    }

    /// <summary>
    /// DTO para plantilla de componente
    /// </summary>
    public class ComponentTemplateDto
    {
        public string Id { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool Required { get; set; }
        public int Order { get; set; }
        public string DefaultValue { get; set; } = string.Empty;
        public List<string> DataFields { get; set; } = new List<string>();
    }

    /// <summary>
    /// Solicitud para crear plantilla consolidada desde PDF
    /// </summary>
    public class CreateConsolidatedTemplateFromPDFRequest
    {
        [Required]
        public IFormFile? PDFFile { get; set; }

        [Required]
        [StringLength(200)]
        public string TemplateName { get; set; } = string.Empty;

        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Period { get; set; } = string.Empty;

        public DateTime? Deadline { get; set; }

        public List<SectionAssignmentRequest> SectionAssignments { get; set; } = new List<SectionAssignmentRequest>();

        public PDFAnalysisConfig AnalysisConfig { get; set; } = new PDFAnalysisConfig();
    }

    /// <summary>
    /// Solicitud para asignar sección a área
    /// </summary>
    public class SectionAssignmentRequest
    {
        public string SectionId { get; set; } = string.Empty;
        public int AreaId { get; set; }
        public bool AcceptSuggestion { get; set; } = true;
    }

    /// <summary>
    /// Respuesta de creación de plantilla desde PDF
    /// </summary>
    public class CreateFromPDFResponse
    {
        public int ConsolidatedTemplateId { get; set; }
        public string TemplateName { get; set; } = string.Empty;
        public PDFAnalysisResponse Analysis { get; set; } = new PDFAnalysisResponse();
        public List<ConsolidatedTemplateSectionDto> CreatedSections { get; set; } = new List<ConsolidatedTemplateSectionDto>();
        public string Message { get; set; } = string.Empty;
    }
} 