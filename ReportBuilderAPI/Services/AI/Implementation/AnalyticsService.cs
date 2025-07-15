using System.Text.Json;
using Azure;
using Microsoft.Extensions.Options;
using Azure.AI.OpenAI;
using ReportBuilderAPI.Configuration;
using ReportBuilderAPI.Services.AI.Interfaces;
using ReportBuilderAPI.Services.AI.Models;

namespace ReportBuilderAPI.Services.AI.Implementation
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly IDeepSeekService _deepSeekService; // Inyectamos el nuevo servicio
        private readonly AISettings _settings;
        private readonly ILogger<AnalyticsService> _logger;

        public AnalyticsService(IOptions<AISettings> settings, ILogger<AnalyticsService> logger, IDeepSeekService deepSeekService) // Inyectamos en el constructor
        {
            _deepSeekService = deepSeekService;
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task<AnalysisResult> AnalyzeExcelDataAsync(AnalysisRequest request)
        {
            try
            {
                // CORRECCIÓN: Se accede a las propiedades a través de request.Config.
                // ReportId ya no forma parte de esta solicitud, por lo que se usa información más relevante para el log.
                _logger.LogInformation("Iniciando análisis con DeepSeek de tipo: {AnalysisType}", request.Config.AnalysisType); // Mensaje actualizado
                // Usamos DeepSeekService directamente
                var analysisResult = await _deepSeekService.AnalyzeDataAsync(request);
                _logger.LogInformation("Análisis de tipo '{AnalysisType}' completado.", request.Config.AnalysisType);
                return analysisResult;
            }
            catch (Exception ex)
            {
                // CORRECCIÓN: Se elimina la referencia a la propiedad inexistente ReportId.
                _logger.LogError(ex, "Error durante el análisis de datos de Excel.");
                throw;
            }
        }

        public async Task<List<Insight>> GetInsightsAsync(int reportId)
        {
            try
            {
                var insights = new List<Insight>
                {
                    new Insight
                    {
                        Type = "Performance",
                        Title = "Incremento en Métricas Clave",
                        Description = "Se detectó un aumento del 15% en las métricas principales comparado con el período anterior",
                        Severity = "Info",
                        Confidence = 0.85
                    }
                };
                return await Task.FromResult(insights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error obteniendo insights para ReportId: {reportId}");
                return new List<Insight>();
            }
        }

        public async Task<List<Trend>> GetTrendsAsync(int areaId, DateTime startDate, DateTime endDate)
        {
            try
            {
                var trends = new List<Trend>
                {
                    new Trend
                    {
                        Metric = "Ventas",
                        Direction = "Up",
                        ChangePercentage = 12.5,
                        Period = $"{startDate:yyyy-MM-dd} a {endDate:yyyy-MM-dd}",
                        DataPoints = GenerateDataPoints(startDate, endDate)
                    }
                };
                return await Task.FromResult(trends);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error obteniendo tendencias para AreaId: {areaId}");
                return new List<Trend>();
            }
        }

        public async Task<AnalysisResult> ComparePeroidsAsync(int areaId, DateTime period1Start, DateTime period1End, DateTime period2Start, DateTime period2End)
        {
            try
            {
                var prompt = $@"
                 Compara los siguientes períodos para el área {areaId}:
                 Período 1: {period1Start:yyyy-MM-dd} a {period1End:yyyy-MM-dd}
                 Período 2: {period2Start:yyyy-MM-dd} a {period2End:yyyy-MM-dd}
                
                 Proporciona un análisis comparativo detallado incluyendo:
                 1. Diferencias principales
                 2. Tendencias identificadas
                 3. Recomendaciones
                 ";
                // Esta parte aún usa OpenAI, si se quiere migrar, se debe usar DeepSeek
                // var response = await _deepSeekService.GenerateTextAsync(prompt);
                // return ParseAnalysisResponse(response, areaId);
                _logger.LogWarning("ComparePeroidsAsync no está completamente migrado a DeepSeek.");
                return new AnalysisResult { Summary = "Función no implementada con DeepSeek" };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error en comparación de períodos para AreaId: {areaId}");
                throw;
            }
        }

        public async Task<bool> ProcessDataAsync(Dictionary<string, object> data)
        {
            try
            {
                _logger.LogInformation($"Procesando {data.Count} elementos de datos");
                await Task.Delay(100);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error procesando datos");
                return false;
            }
        }

        private List<DataPoint> GenerateDataPoints(DateTime startDate, DateTime endDate)
        {
            var dataPoints = new List<DataPoint>();
            var random = new Random();
            for (var date = startDate; date <= endDate; date = date.AddDays(1))
            {
                dataPoints.Add(new DataPoint
                {
                    Date = date,
                    Value = random.NextDouble() * 100,
                    Label = date.ToString("yyyy-MM-dd")
                });
            }
            return dataPoints;
        }
    }
}