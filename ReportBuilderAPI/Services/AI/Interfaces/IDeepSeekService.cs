using ReportBuilderAPI.Services.AI.Models;
using System.Threading.Tasks;

namespace ReportBuilderAPI.Services.AI.Interfaces
{
    public interface IDeepSeekService
    {
        Task<string> GenerateTextAsync(string prompt);
        Task<AnalysisResult> AnalyzeDataAsync(AnalysisRequest request);
    }
}