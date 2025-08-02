using ReportBuilderAPI.Models;
using System.ComponentModel.DataAnnotations;

namespace ReportBuilderAPI.DTOs
{
    public class ConsolidatedTemplateDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Period { get; set; } = string.Empty;
        public DateTime? Deadline { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string CreatedByUserName { get; set; } = string.Empty;
        public int SectionsCount { get; set; }
        public int CompletedSectionsCount { get; set; }
        public double CompletionPercentage => SectionsCount > 0 ? (double)CompletedSectionsCount / SectionsCount * 100 : 0;
    }

    public class ConsolidatedTemplateDetailDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Period { get; set; } = string.Empty;
        public DateTime? Deadline { get; set; }
        public ConsolidatedTemplateConfiguration Configuration { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string CreatedByUserName { get; set; } = string.Empty;
        public List<ConsolidatedTemplateSectionDto> Sections { get; set; } = new();
    }

    public class ConsolidatedTemplateSectionDto
    {
        public int Id { get; set; }
        public int AreaId { get; set; }
        public string AreaName { get; set; } = string.Empty;
        public string SectionTitle { get; set; } = string.Empty;
        public string SectionDescription { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int Order { get; set; }
        public DateTime? SectionDeadline { get; set; }
        public DateTime? AssignedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string? CompletedByUserName { get; set; }
        public SectionConfiguration SectionConfiguration { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateConsolidatedTemplateRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        
        [Required]
        public string Period { get; set; } = string.Empty;
        
        public DateTime? Deadline { get; set; }
        
        [Required]
        public List<int> SourceReportIds { get; set; } = new(); // IDs de informes anteriores como base
        
        [Required]
        public List<CreateSectionRequest> Sections { get; set; } = new();
        
        public ConsolidatedTemplateConfiguration Configuration { get; set; } = new();
    }

    public class CreateSectionRequest
    {
        [Required]
        public int AreaId { get; set; }
        
        [Required]
        public string SectionTitle { get; set; } = string.Empty;
        
        public string SectionDescription { get; set; } = string.Empty;
        
        public int Order { get; set; } = 1;
        
        public DateTime? SectionDeadline { get; set; }
        
        public SectionConfiguration SectionConfiguration { get; set; } = new();
    }

    public class UpdateConsolidatedTemplateRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; }
        public DateTime? Deadline { get; set; }
        public ConsolidatedTemplateConfiguration? Configuration { get; set; }
    }

    public class AssignSectionRequest
    {
        [Required]
        public int AreaId { get; set; }
        
        public DateTime? SectionDeadline { get; set; }
        
        public string? AdditionalInstructions { get; set; }
    }

    public class UpdateSectionStatusRequest
    {
        [Required]
        public string Status { get; set; } = string.Empty;
        
        public string? Comments { get; set; }
    }

    public class ConsolidatedTemplateStatusDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int TotalSections { get; set; }
        public int PendingSections { get; set; }
        public int AssignedSections { get; set; }
        public int InProgressSections { get; set; }
        public int CompletedSections { get; set; }
        public int ReviewedSections { get; set; }
        public double CompletionPercentage { get; set; }
        public DateTime? EstimatedCompletionDate { get; set; }
        public List<SectionStatusDto> SectionStatuses { get; set; } = new();
    }

    public class SectionStatusDto
    {
        public int Id { get; set; }
        public string SectionTitle { get; set; } = string.Empty;
        public string AreaName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime? AssignedAt { get; set; }
        public DateTime? SectionDeadline { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string? CompletedByUserName { get; set; }
        public bool IsOverdue { get; set; }
    }
} 