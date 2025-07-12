using ReportBuilderAPI.Services.Vector.Models;

namespace ReportBuilderAPI.Services.Vector.Interfaces
{
    public interface IVectorService
    {
        Task<bool> InitializeAsync();
        Task<string> UpsertDocumentAsync(VectorDocument document);
        Task<bool> DeleteDocumentAsync(string id);
        Task<List<VectorSearchResult>> SearchAsync(VectorSearchRequest request);
        Task<float[]> GenerateEmbeddingAsync(string text);
        Task<VectorStoreStats> GetStatsAsync();
        Task<bool> CreateIndexAsync(string indexName);
    }
}