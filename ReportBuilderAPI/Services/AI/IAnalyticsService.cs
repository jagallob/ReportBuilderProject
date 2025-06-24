namespace ReportBuilderAPI.Services.AI
{
    public interface IAnalyticsService
    {
        Task AnalyzeExcelAsync(Stream excelStream);
        Task<object> GetInsightsAsync(int reportId);
        Task<object> GetTrendsAsync(int areaId);
        Task<object> ComparePeriodsAsync(object compareRequest);
    }
}
