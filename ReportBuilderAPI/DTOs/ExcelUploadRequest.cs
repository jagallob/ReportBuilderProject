using System.ComponentModel.DataAnnotations;

namespace ReportBuilderAPI.DTOs
{
    public class ExcelUploadRequest
    {
        [Required]
        public IFormFile? File { get; set; }

        [Required]
        public int AreaId { get; set; }

        [Required]
        public string Period { get; set; } = string.Empty;
    }
}
