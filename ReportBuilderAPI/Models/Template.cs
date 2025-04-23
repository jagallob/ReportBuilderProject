namespace ReportBuilderAPI.Models
{
    public class Template
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? ConfigurationJson { get; set; } // Guarda estructura dinámica en JSON
    }
}
