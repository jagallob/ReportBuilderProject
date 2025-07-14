using Microsoft.AspNetCore.Mvc;
using ReportBuilderAPI.Services.AI.Interfaces;
using ReportBuilderAPI.DTOs;
using ReportBuilderAPI.Services.AI.Models;

namespace ReportBuilderAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;
        private readonly ILogger<AnalyticsController> _logger;

        public AnalyticsController(IAnalyticsService analyticsService, ILogger<AnalyticsController> logger)
        {
            _analyticsService = analyticsService;
            _logger = logger;
        }

        [HttpPost("analyze")]
        public async Task<ActionResult<AnalysisResult>> AnalyzeExcel([FromBody] AnalysisRequest request)
        {
            try
            {
                // Log para confirmar que el binding del modelo fue exitoso.
                _logger.LogInformation("Solicitud de análisis recibida correctamente. Tipo de análisis: {AnalysisType}, Idioma: {Language}",
                    request.Config.AnalysisType,
                    request.Config.Language);

                // Devolvemos un resultado falso para probar que el flujo completo funciona.
                var fakeResult = new AnalysisResult
                {
                    ReportId = 1,
                    Summary = $"Este es un resumen de prueba para un análisis '{request.Config.AnalysisType}' en '{request.Config.Language}'.",
                    Metrics = new Dictionary<string, object>
                    {
                        { "Ventas Totales", 125000 },
                        { "Ticket Promedio", 85.50 },
                        { "Filas Recibidas", request.Data.Count }
                    },
                    Trends = new List<Trend> { new Trend { Metric = "Ventas", Direction = "Up", ChangePercentage = 15 } },
                    Insights = new List<Insight> { new Insight { Title = "Oportunidad Detectada", Description = "El producto 'X' tiene un rendimiento superior al promedio." } },
                    GeneratedAt = DateTime.UtcNow
                };

                await Task.Delay(1000);
                return Ok(fakeResult);

                // var result = await _analyticsService.AnalyzeExcelDataAsync(request);
                // return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en análisis de Excel");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpGet("insights/{reportId}")]
        public async Task<ActionResult<List<Insight>>> GetInsights(int reportId)
        {
            try
            {
                var insights = await _analyticsService.GetInsightsAsync(reportId);
                return Ok(insights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error obteniendo insights para reporte {reportId}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpGet("trends/{areaId}")]
        public async Task<ActionResult<List<Trend>>> GetTrends(int areaId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                var trends = await _analyticsService.GetTrendsAsync(areaId, startDate, endDate);
                return Ok(trends);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error obteniendo tendencias para área {areaId}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpPost("compare-periods")]
        public async Task<ActionResult<AnalysisResult>> ComparePeriods([FromBody] ComparisonRequest request)
        {
            try
            {
                var result = await _analyticsService.ComparePeroidsAsync(
                    request.AreaId,
                    request.Period1Start,
                    request.Period1End,
                    request.Period2Start,
                    request.Period2End);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en comparación de períodos");
                return StatusCode(500, "Error interno del servidor");
            }
        }
    }
}