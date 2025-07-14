namespace ReportBuilderAPI.DTOs
{
    public class ComparisonRequest
    {
        public int AreaId { get; set; }
        public DateTime Period1Start { get; set; }
        public DateTime Period1End { get; set; }
        public DateTime Period2Start { get; set; }
        public DateTime Period2End { get; set; }
    }
}