using Microsoft.AspNetCore.Mvc;
using ReportBuilderAPI.Services.AI.Interfaces;
using ReportBuilderAPI.Services.AI.Models;
using System.ComponentModel.DataAnnotations;

namespace ReportBuilderAPI.Controllers
{
    /// <summary>
    /// Controlador para análisis de datos con IA
    /// </summary>
    [ApiController]
    [Route("api/analytics")]
    [Produces("application/json")]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;
        private readonly ILogger<AnalyticsController> _logger;

        public AnalyticsController(
            IAnalyticsService analyticsService,
            ILogger<AnalyticsController> logger)
        {
            _analyticsService = analyticsService;
            _logger = logger;
        }

        /// <summary>
        /// Analiza datos de Excel usando IA
        /// </summary>
        /// <param name="request">Datos y configuración para el análisis</param>
        /// <response code="200">Análisis completado</response>
        /// <response code="400">Solicitud inválida</response>
        [HttpPost("analyze")]
        [ProducesResponseType(typeof(AnalysisResult), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> AnalyzeData([FromBody] AnalysisRequest request)
        {
            try
            {
                _logger.LogInformation("Iniciando análisis de datos con configuración: {Config}", 
                    request.Config?.AnalysisType ?? "No especificado");

                var result = await _analyticsService.AnalyzeExcelDataAsync(request);
                
                _logger.LogInformation("Análisis completado exitosamente");
                return Ok(result);
            }
            catch (ValidationException ex)
            {
                _logger.LogWarning(ex, "Error de validación en análisis de datos");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error durante el análisis de datos");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene insights para un reporte específico
        /// </summary>
        /// <param name="reportId">ID del reporte</param>
        /// <response code="200">Lista de insights</response>
        /// <response code="404">Reporte no encontrado</response>
        [HttpGet("insights/{reportId:int}")]
        [ProducesResponseType(typeof(List<Insight>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetInsights([FromRoute, Range(1, int.MaxValue)] int reportId)
        {
            try
            {
                var insights = await _analyticsService.GetInsightsAsync(reportId);
                return Ok(insights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo insights para reporte {ReportId}", reportId);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene tendencias para un área específica
        /// </summary>
        /// <param name="areaId">ID del área</param>
        /// <param name="startDate">Fecha de inicio</param>
        /// <param name="endDate">Fecha de fin</param>
        /// <response code="200">Lista de tendencias</response>
        /// <response code="400">Parámetros inválidos</response>
        [HttpGet("trends/{areaId:int}")]
        [ProducesResponseType(typeof(List<Trend>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetTrends(
            [FromRoute, Range(1, int.MaxValue)] int areaId,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                var trends = await _analyticsService.GetTrendsAsync(areaId, startDate, endDate);
                return Ok(trends);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo tendencias para área {AreaId}", areaId);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Compara dos períodos de datos
        /// </summary>
        /// <param name="areaId">ID del área</param>
        /// <param name="period1Start">Inicio del período 1</param>
        /// <param name="period1End">Fin del período 1</param>
        /// <param name="period2Start">Inicio del período 2</param>
        /// <param name="period2End">Fin del período 2</param>
        /// <response code="200">Análisis comparativo</response>
        /// <response code="400">Parámetros inválidos</response>
        [HttpGet("compare/{areaId:int}")]
        [ProducesResponseType(typeof(AnalysisResult), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ComparePeriods(
            [FromRoute, Range(1, int.MaxValue)] int areaId,
            [FromQuery] DateTime period1Start,
            [FromQuery] DateTime period1End,
            [FromQuery] DateTime period2Start,
            [FromQuery] DateTime period2End)
        {
            try
            {
                var comparison = await _analyticsService.ComparePeroidsAsync(
                    areaId, period1Start, period1End, period2Start, period2End);
                return Ok(comparison);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error comparando períodos para área {AreaId}", areaId);
                return StatusCode(500, "Error interno del servidor");
            }
        }
    }
}