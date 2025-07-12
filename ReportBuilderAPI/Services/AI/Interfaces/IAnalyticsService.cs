using ReportBuilderAPI.Services.AI.Models;

namespace ReportBuilderAPI.Services.AI.Interfaces
{
    public interface IAnalyticsService
    {
        Task<AnalysisResult> AnalyzeExcelDataAsync(AnalysisRequest request);
        Task<List<Insight>> GetInsightsAsync(int reportId);
        Task<List<Trend>> GetTrendsAsync(int areaId, DateTime startDate, DateTime endDate);
        Task<AnalysisResult> ComparePeroidsAsync(int areaId, DateTime period1Start, DateTime period1End, DateTime period2Start, DateTime period2End);
        Task<bool> ProcessDataAsync(Dictionary<string, object> data);
    }
}