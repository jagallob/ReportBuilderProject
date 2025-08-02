using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ReportBuilderAPI.Models
{
    /// <summary>
    /// Representa una plantilla consolidada generada por el administrador
    /// que combina secciones de diferentes áreas para crear un informe completo
    /// </summary>
    public class ConsolidatedTemplate
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Estado de la plantilla consolidada
        /// </summary>
        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "draft"; // draft, in_progress, completed, archived

        /// <summary>
        /// Período al que corresponde el informe consolidado
        /// </summary>
        [Required]
        [StringLength(50)]
        public string Period { get; set; } = string.Empty; // Ej: "Abril 2025"

        /// <summary>
        /// Fecha límite para completar todas las secciones
        /// </summary>
        public DateTime? Deadline { get; set; }

        /// <summary>
        /// Configuración JSON de la plantilla consolidada
        /// </summary>
        [Column(TypeName = "text")]
        public string ConfigurationJson { get; set; } = string.Empty;

        // Propiedades de auditoría
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Relación con el usuario administrador que creó la plantilla
        public int CreatedByUserId { get; set; }

        [ForeignKey("CreatedByUserId")]
        [JsonIgnore]
        public virtual User? CreatedByUser { get; set; }

        // Navegación a las secciones
        [JsonIgnore]
        public virtual ICollection<ConsolidatedTemplateSection> Sections { get; set; } = new List<ConsolidatedTemplateSection>();

        // Propiedades no mapeadas para trabajar con objetos
        [NotMapped]
        public ConsolidatedTemplateConfiguration Configuration
        {
            get => string.IsNullOrEmpty(ConfigurationJson)
                   ? new ConsolidatedTemplateConfiguration()
                   : JsonSerializer.Deserialize<ConsolidatedTemplateConfiguration>(ConfigurationJson) ?? new ConsolidatedTemplateConfiguration();
            set => ConfigurationJson = JsonSerializer.Serialize(value);
        }

        // Método para actualizar la fecha de modificación
        public void MarkAsUpdated()
        {
            UpdatedAt = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// Representa una sección específica de una plantilla consolidada
    /// que será asignada a un área particular
    /// </summary>
    public class ConsolidatedTemplateSection
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int ConsolidatedTemplateId { get; set; }

        [ForeignKey("ConsolidatedTemplateId")]
        [JsonIgnore]
        public virtual ConsolidatedTemplate? ConsolidatedTemplate { get; set; }

        [Required]
        public int AreaId { get; set; }

        [ForeignKey("AreaId")]
        public virtual Area? Area { get; set; }

        [Required]
        [StringLength(200)]
        public string SectionTitle { get; set; } = string.Empty;

        [StringLength(500)]
        public string SectionDescription { get; set; } = string.Empty;

        /// <summary>
        /// Estado de la sección
        /// </summary>
        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "pending"; // pending, assigned, in_progress, completed, reviewed

        /// <summary>
        /// Orden de la sección en el informe final
        /// </summary>
        public int Order { get; set; } = 1;

        /// <summary>
        /// Fecha límite específica para esta sección
        /// </summary>
        public DateTime? SectionDeadline { get; set; }

        /// <summary>
        /// Fecha cuando se asignó la sección al área
        /// </summary>
        public DateTime? AssignedAt { get; set; }

        /// <summary>
        /// Fecha cuando se completó la sección
        /// </summary>
        public DateTime? CompletedAt { get; set; }

        /// <summary>
        /// ID del usuario que completó la sección
        /// </summary>
        public int? CompletedByUserId { get; set; }

        [ForeignKey("CompletedByUserId")]
        [JsonIgnore]
        public virtual User? CompletedByUser { get; set; }

        /// <summary>
        /// Configuración específica de la sección
        /// </summary>
        [Column(TypeName = "text")]
        public string SectionConfigurationJson { get; set; } = string.Empty;

        // Propiedades de auditoría
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Propiedades no mapeadas
        [NotMapped]
        public SectionConfiguration SectionConfiguration
        {
            get => string.IsNullOrEmpty(SectionConfigurationJson)
                   ? new SectionConfiguration()
                   : JsonSerializer.Deserialize<SectionConfiguration>(SectionConfigurationJson) ?? new SectionConfiguration();
            set => SectionConfigurationJson = JsonSerializer.Serialize(value);
        }

        public void MarkAsUpdated()
        {
            UpdatedAt = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// Configuración de la plantilla consolidada
    /// </summary>
    public class ConsolidatedTemplateConfiguration
    {
        public string TemplateType { get; set; } = "consolidated";
        public string Version { get; set; } = "1.0.0";
        public string SourceType { get; set; } = "manual"; // manual, pdf, reports
        public string SourceFileName { get; set; } = string.Empty;
        public Dictionary<string, object> AnalysisMetadata { get; set; } = new();
        public List<string> RequiredAreas { get; set; } = new();
        public Dictionary<string, object> GlobalSettings { get; set; } = new();
        public ReportFormatSettings FormatSettings { get; set; } = new();
    }

    /// <summary>
    /// Configuración específica de una sección
    /// </summary>
    public class SectionConfiguration
    {
        public string SectionType { get; set; } = "standard";
        public List<string> RequiredComponents { get; set; } = new();
        public List<ComponentConfiguration> Components { get; set; } = new();
        public Dictionary<string, object> DisplayOptions { get; set; } = new();
        public bool IsRequired { get; set; } = true;
        public int MaxLength { get; set; } = 0; // 0 = sin límite
        public string Instructions { get; set; } = string.Empty;
    }

    /// <summary>
    /// Configuración de un componente específico
    /// </summary>
    public class ComponentConfiguration
    {
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool Required { get; set; } = true;
        public int Order { get; set; }
        public Dictionary<string, object> Configuration { get; set; } = new();
    }

    /// <summary>
    /// Configuración del formato del reporte
    /// </summary>
    public class ReportFormatSettings
    {
        public List<string> ExportFormats { get; set; } = new() { "pdf", "docx" };
        public string ColorScheme { get; set; } = "corporate";
        public bool IncludeTableOfContents { get; set; } = true;
        public bool IncludeExecutiveSummary { get; set; } = true;
    }
} 