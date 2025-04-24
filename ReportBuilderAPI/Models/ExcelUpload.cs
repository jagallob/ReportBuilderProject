using System.ComponentModel.DataAnnotations;

namespace ReportBuilderAPI.Models
{
    public class ExcelUpload
    {
        public int Id { get; set; }

        [Required]
        public int AreaId { get; set; }
        public Area? Area { get; set; }

        [Required]
        public string FileName { get; set; } = string.Empty;

        [Required]
        public string Period { get; set; } = string.Empty; // Ej: "Abril 2025"

        public DateTime UploadDate { get; set; } = DateTime.UtcNow;

        public string? ExtractedJsonData { get; set; } // KPIs/tablas en JSON
    }
}

