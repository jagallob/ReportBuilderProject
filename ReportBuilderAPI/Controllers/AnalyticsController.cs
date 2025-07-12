using Microsoft.AspNetCore.Mvc;
using ReportBuilderAPI.Services.AI.Interfaces;
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

        [HttpPost("analyze-excel")]
        public async Task<ActionResult<AnalysisResult>> AnalyzeExcel([FromBody] AnalysisRequest request)
        {
            try
            {
                var result = await _analyticsService.AnalyzeExcelDataAsync(request);
                return Ok(result);
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

    public class ComparisonRequest
    {
        public int AreaId { get; set; }
        public DateTime Period1Start { get; set; }
        public DateTime Period1End { get; set; }
        public DateTime Period2Start { get; set; }
        public DateTime Period2End { get; set; }
    }
}