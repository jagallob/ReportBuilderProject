namespace ReportBuilderAPI.Services.Vector
{
    public interface IVectorService
    {
        Task StoreEmbeddingAsync(object embeddingData);
        Task<IEnumerable<object>> SearchSimilarAsync(object queryVector);
    }
}
