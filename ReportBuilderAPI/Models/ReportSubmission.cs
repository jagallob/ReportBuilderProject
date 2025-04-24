using System.ComponentModel.DataAnnotations;

namespace ReportBuilderAPI.Models
{
    public class ReportSubmission
    {
        public int Id { get; set; }

        [Required]
        public int AreaId { get; set; }
        public Area? Area { get; set; }

        [Required]
        public string Period { get; set; } = string.Empty; // Ej: "Abril 2025"

        public string Narrative { get; set; } = string.Empty; // Análisis narrativo

        public string? GeneratedIndicators { get; set; } // KPIs generados (JSON)

        public string? ChartsConfigJson { get; set; } // Configuración de gráficos

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsSubmitted { get; set; } = false; // Si ya se consolidó
    }
}

