using ReportBuilderAPI.Services.AI.Models;

namespace ReportBuilderAPI.Services.AI.Interfaces
{
    public interface IAnthropicService
    {
        Task<string> GenerateTextAsync(string prompt, string? model = null);
        Task<AnalysisResult> AnalyzeDataAsync(AnalysisRequest request);
        Task<NarrativeResult> GenerateNarrativeAsync(NarrativeRequest request);
        Task<float[]> GenerateEmbeddingAsync(string text);
        Task<bool> IsHealthyAsync();
    }
} 