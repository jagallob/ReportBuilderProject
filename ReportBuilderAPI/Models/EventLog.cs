namespace ReportBuilderAPI.Models
{
    public class EventLog
    {
        public int Id { get; set; }
        public DateTime EventDate { get; set; }
        public string? Title { get; set; }          // Título corto del evento
        public string? Description { get; set; }    // Descripción larga para el informe
        public int AreaId { get; set; }
        public Area? Area { get; set; }  // Relación con el área que reporta
    }
}
