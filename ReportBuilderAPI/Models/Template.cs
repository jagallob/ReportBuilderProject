using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ReportBuilderAPI.Models
{
    /// <summary>
    /// Representa una plantilla para la generación de informes dinámicos
    /// </summary>
    public class Template
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        [Column(TypeName = "text")]
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Almacena la configuración completa de la plantilla en formato JSON.
        /// </summary>
        [Column(TypeName = "text")]
        public string ConfigurationJson { get; set; } = string.Empty;

        // Propiedades de auditoría
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Relación con áreas
        public int? AreaId { get; set; }

        [ForeignKey("AreaId")]
        [JsonIgnore]
        public virtual Area? Area { get; set; }

        // Propiedades no mapeadas para trabajar con objetos
        [NotMapped]
        public TemplateConfiguration Configuration
        {
            get => string.IsNullOrEmpty(ConfigurationJson)
                   ? new TemplateConfiguration()
                   : JsonSerializer.Deserialize<TemplateConfiguration>(ConfigurationJson) ?? new TemplateConfiguration();
            set => ConfigurationJson = JsonSerializer.Serialize(value);
        }

        [NotMapped]
        public string Type => Configuration?.Metadata?.TemplateType ?? "generic";

        [NotMapped]
        public string Version => Configuration?.Metadata?.Version ?? "1.0.0";

        // Método para actualizar la fecha de modificación
        public void MarkAsUpdated()
        {
            UpdatedAt = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// Clase que representa la estructura de configuración de la plantilla
    /// </summary>
    public class TemplateConfiguration
    {
        public TemplateMetadata Metadata { get; set; } = new();
        public List<ReportSection> Sections { get; set; } = new();
        public ReportHeader Header { get; set; } = new();
        public ReportFooter Footer { get; set; } = new();
        public ReportSettings Settings { get; set; } = new();
    }

    public class TemplateMetadata
    {
        public string TemplateType { get; set; } = "generic";
        public string Description { get; set; } = string.Empty;
        public string Version { get; set; } = "1.0.0";
        public string DefaultPeriod { get; set; } = "monthly";
        public List<string> AllowedPeriods { get; set; } = new() { "monthly" };
    }

    public class ReportSection
    {
        public string SectionId { get; set; } = Guid.NewGuid().ToString();
        public string Title { get; set; } = string.Empty;
        public string Type { get; set; } = "text";
        public int Order { get; set; } = 1;
        public bool Required { get; set; } = true;
        public List<SectionComponent> Components { get; set; } = new();
        public string Layout { get; set; } = "full-width";
    }

    public class SectionComponent
    {
        public string ComponentId { get; set; } = Guid.NewGuid().ToString();
        public string Type { get; set; } = string.Empty;
        public ComponentDataSource DataSource { get; set; } = new();
        public Dictionary<string, object> DisplayOptions { get; set; } = new();
    }

    public class ComponentDataSource
    {
        public string SourceType { get; set; } = "excel";
        public string SourceName { get; set; } = string.Empty;
        public string Worksheet { get; set; } = string.Empty;
        public string Range { get; set; } = string.Empty;
        public Dictionary<string, string> Mappings { get; set; } = new();
    }

    public class ReportHeader
    {
        public string TitleFormat { get; set; } = "{TemplateName} - {Period}";
        public bool ShowLogo { get; set; } = true;
        public List<MetadataField> MetadataFields { get; set; } = new();
    }

    public class ReportFooter
    {
        public string Content { get; set; } = "© {Year} Company Name";
        public bool ShowPageNumbers { get; set; } = true;
    }

    public class ReportSettings
    {
        public List<string> ExportFormats { get; set; } = new() { "pdf" };
        public string ColorScheme { get; set; } = "default";
    }

    public class MetadataField
    {
        public string Name { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public string FieldType { get; set; } = "text";
    }
}