using System.Collections.Concurrent;
using Microsoft.Extensions.Options;
using ReportBuilderAPI.Configuration;

using ReportBuilderAPI.Services.Vector.Interfaces;
using ReportBuilderAPI.Services.Vector.Models;
using Azure.AI.OpenAI;
using Azure;

namespace ReportBuilderAPI.Services.Vector.Implementation
{
    public class VectorService : IVectorService
    {
        private readonly OpenAIClient _openAIClient;
        private readonly AISettings _settings;
        private readonly ILogger<VectorService> _logger;
        private readonly ConcurrentDictionary<string, VectorDocument> _vectorStore;
        private bool _isInitialized;

        public VectorService(IOptions<AISettings> settings, ILogger<VectorService> logger)
        {
            _settings = settings.Value;
            _logger = logger;
            _openAIClient = new OpenAIClient(_settings.OpenAI.ApiKey);
            _vectorStore = new ConcurrentDictionary<string, VectorDocument>();
            _isInitialized = false;
        }

        public async Task<bool> InitializeAsync()
        {
            _logger.LogInformation("Inicializando Vector Store Service");
            _isInitialized = true;
            return await Task.FromResult(true);
        }

        public async Task<string> UpsertDocumentAsync(VectorDocument document)
        {
            if (!_isInitialized) await InitializeAsync();
            _logger.LogInformation($"Insertando documento: {document.Id}");
            if (document.Embedding == null || document.Embedding.Length == 0)
            {
                document.Embedding = await GenerateEmbeddingAsync(document.Content);
            }
            _vectorStore.AddOrUpdate(document.Id, document, (key, oldValue) => document);
            return document.Id;
        }

        public async Task<bool> DeleteDocumentAsync(string id)
        {
            _logger.LogInformation($"Eliminando documento: {id}");
            return await Task.FromResult(_vectorStore.TryRemove(id, out _));
        }

        public async Task<List<VectorSearchResult>> SearchAsync(VectorSearchRequest request)
        {
            if (!_isInitialized) await InitializeAsync();
            _logger.LogInformation($"Realizando búsqueda: {request.Query}");

            var queryEmbedding = request.QueryEmbedding ?? await GenerateEmbeddingAsync(request.Query);
            var results = new List<VectorSearchResult>();

            foreach (var doc in _vectorStore.Values)
            {
                var similarity = CalculateCosineSimilarity(queryEmbedding, doc.Embedding);
                if (similarity >= request.MinSimilarity)
                {
                    results.Add(new VectorSearchResult
                    {
                        Id = doc.Id,
                        Content = doc.Content,
                        Similarity = similarity,
                        Metadata = doc.Metadata
                    });
                }
            }

            return results.OrderByDescending(r => r.Similarity).Take(request.TopK).ToList();
        }

        public async Task<float[]> GenerateEmbeddingAsync(string text)
        {
            try
            {
                _logger.LogDebug($"Generando embedding para texto de {text.Length} caracteres");

                var embeddingsOptions = new EmbeddingsOptions(_settings.OpenAI.EmbeddingModel, new[] { text });

                Response<Embeddings> response = await _openAIClient.GetEmbeddingsAsync(embeddingsOptions);

                return response.Value.Data[0].Embedding.ToArray();
            }
            catch (RequestFailedException ex)
            {
                _logger.LogError(ex, "Error en la solicitud a OpenAI API para embedding. Status Code: {StatusCode}, Error: {ErrorCode}", ex.Status, ex.ErrorCode);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inesperado generando embedding");
                throw;
            }
        }

        public async Task<VectorStoreStats> GetStatsAsync()
        {
            try
            {
                return new VectorStoreStats
                {
                    TotalDocuments = _vectorStore.Count,
                    IndexSize = _vectorStore.Sum(kvp => kvp.Value.Content.Length),
                    LastUpdated = DateTime.UtcNow,
                    AdditionalInfo = new Dictionary<string, object>
                    {
                        ["provider"] = "InMemory"
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo estadísticas del vector store");
                throw;
            }
        }

        public async Task<bool> CreateIndexAsync(string indexName)
        {
            _logger.LogInformation($"Creando índice: {indexName}");
            return await Task.FromResult(true);
        }

        private double CalculateCosineSimilarity(float[] vector1, float[] vector2)
        {
            if (vector1.Length != vector2.Length)
                throw new ArgumentException("Los vectores deben tener la misma dimensión");

            double dotProduct = 0, norm1 = 0, norm2 = 0;
            for (int i = 0; i < vector1.Length; i++)
            {
                dotProduct += vector1[i] * vector2[i];
                norm1 += vector1[i] * vector1[i];
                norm2 += vector2[i] * vector2[i];
            }
            return dotProduct / (Math.Sqrt(norm1) * Math.Sqrt(norm2));
        }
    }
}