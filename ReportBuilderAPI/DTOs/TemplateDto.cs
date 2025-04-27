using ReportBuilderAPI.Models;
using System.ComponentModel.DataAnnotations;

namespace ReportBuilderAPI.DTOs
{
    public class TemplateDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public string Version { get; set; }
        public int? AreaId { get; set; }
        public string AreaName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class TemplateDetailDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int? AreaId { get; set; }
        public string AreaName { get; set; }
        public TemplateConfiguration Configuration { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class TemplateCreateDto
    {
        [Required]
        public string Name { get; set; }

        public int? AreaId { get; set; }

        [Required]
        public TemplateConfiguration Configuration { get; set; }
    }

    public class TemplateUpdateDto
    {
        public int Id { get; set; }

        [Required]
        public string? Name { get; set; }

        public int? AreaId { get; set; }

        [Required]
        public TemplateConfiguration? Configuration { get; set; }
    }
}