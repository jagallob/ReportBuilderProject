namespace ReportBuilderAPI.Services.Vector.Models
{
    public class VectorDocument
    {
        public string Id { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public float[] Embedding { get; set; } = Array.Empty<float>();
        public Dictionary<string, object> Metadata { get; set; } = new();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class VectorSearchRequest
    {
        public string Query { get; set; } = string.Empty;
        public float[] QueryEmbedding { get; set; } = Array.Empty<float>();
        public int TopK { get; set; } = 5;
        public Dictionary<string, object> Filter { get; set; } = new();
        public double MinSimilarity { get; set; } = 0.7;
    }

    public class VectorSearchResult
    {
        public string Id { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public double Similarity { get; set; }
        public Dictionary<string, object> Metadata { get; set; } = new();
    }

    public class VectorStoreStats
    {
        public long TotalDocuments { get; set; }
        public long IndexSize { get; set; }
        public DateTime LastUpdated { get; set; }
        public Dictionary<string, object> AdditionalInfo { get; set; } = new();
    }
}