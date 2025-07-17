using Microsoft.AspNetCore.Mvc;
using ReportBuilderAPI.Services.AI;
using ReportBuilderAPI.Services.AI.Interfaces;
using ReportBuilderAPI.Services.AI.Models;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace ReportBuilderAPI.Controllers
{
    /// <summary>
    /// Controlador para generación y manejo de narrativas
    /// </summary>
    [ApiController]
    [Route("api/narrative")]
    [Produces("application/json")]
    public class NarrativeController : ControllerBase
    {
        private readonly INarrativeService _narrativeService;
        private readonly ILogger<NarrativeController> _logger;

        public NarrativeController(
            INarrativeService narrativeService,
            ILogger<NarrativeController> logger)
        {
            _narrativeService = narrativeService;
            _logger = logger;
        }

        /// <summary>
        /// Genera una narrativa basada en un template y datos específicos
        /// </summary>
        /// <param name="request">Parámetros para generación</param>
        /// <response code="200">Narrativa generada</response>
        /// <response code="400">Solicitud inválida</response>
        [HttpPost("generate")]
        [ProducesResponseType(typeof(NarrativeResult), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Generate([FromBody] NarrativeRequest request)
        {
            try
            {
                _logger.LogInformation("Generando narrativa para template {TemplateId}", request.TemplateId);
                var result = await _narrativeService.GenerateNarrativeAsync(request);
                var json = System.Text.Json.JsonSerializer.Serialize(result, new JsonSerializerOptions { WriteIndented = true });
                return Content(json, "application/json");

            }
            catch (ValidationException ex)
            {
                _logger.LogWarning(ex, "Error de validación al generar narrativa");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generando narrativa");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene la lista de templates disponibles
        /// </summary>
        /// <response code="200">Lista de templates</response>
        [HttpGet("templates")]
        [ProducesResponseType(typeof(IEnumerable<NarrativeTemplate>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetTemplates()
        {
            try
            {
                var result = await _narrativeService.GetTemplatesAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo templates");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Personaliza una narrativa existente
        /// </summary>
        /// <param name="request">Parámetros de personalización</param>
        /// <response code="200">Narrativa personalizada</response>
        /// <response code="400">Solicitud inválida</response>
        [HttpPost("customize")]
        [ProducesResponseType(typeof(NarrativeResult), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Customize([FromBody] CustomizeNarrativeRequest request)
        {
            try
            {
                _logger.LogInformation("Personalizando narrativa {NarrativeId}", request.NarrativeId);
                var result = await _narrativeService.CustomizeNarrativeAsync(request);
                return Ok(result);
            }
            catch (ValidationException ex)
            {
                _logger.LogWarning(ex, "Error de validación al personalizar narrativa");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error personalizando narrativa");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene sugerencias para un reporte específico
        /// </summary>
        /// <param name="reportId">ID del reporte</param>
        /// <response code="200">Lista de sugerencias</response>
        /// <response code="404">Reporte no encontrado</response>
        [HttpGet("suggestions/{reportId:int}")]
        [ProducesResponseType(typeof(IEnumerable<NarrativeSuggestion>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetSuggestions([FromRoute, Range(1, int.MaxValue)] int reportId)
        {
            try
            {
                var result = await _narrativeService.GetSuggestionsAsync(reportId);
                if (result == null || !result.Any())
                {
                    return NotFound();
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo sugerencias para reporte {ReportId}", reportId);
                return StatusCode(500, "Error interno del servidor");
            }
        }
    }
}