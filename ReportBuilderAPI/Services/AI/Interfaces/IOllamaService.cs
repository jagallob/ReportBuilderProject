using ReportBuilderAPI.Services.AI.Models;

namespace ReportBuilderAPI.Services.AI.Interfaces
{
    public interface IOllamaService
    {
        Task<string> GenerateTextAsync(string prompt, string? model = null);
        Task<AnalysisResult> AnalyzeDataAsync(AnalysisRequest request);
        Task<float[]> GenerateEmbeddingAsync(string text);
        Task<bool> IsHealthyAsync();
        Task<List<string>> GetAvailableModelsAsync();
    }
}