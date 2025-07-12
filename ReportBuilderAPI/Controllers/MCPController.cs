using Microsoft.AspNetCore.Mvc;
using ReportBuilderAPI.Services.AI;
using ReportBuilderAPI.Services.MCP.Interfaces;
using ReportBuilderAPI.Services.MCP.Models;
using System.ComponentModel.DataAnnotations;

namespace ReportBuilderAPI.Controllers
{
    /// <summary>
    /// Controlador para interactuar con el servicio MCP (Model Context Protocol)
    /// </summary>
    [ApiController]
    [Route("api/mcp")]
    [Produces("application/json")]
    public class MCPController : ControllerBase
    {
        private readonly IMCPClientService _mcpService;
        private readonly ILogger<MCPController> _logger;

        public MCPController(
            IMCPClientService mcpService,
            ILogger<MCPController> logger)
        {
            _mcpService = mcpService;
            _logger = logger;
        }

        /// <summary>
        /// Actualiza el contexto para un reporte específico
        /// </summary>
        /// <param name="request">Datos para actualizar el contexto</param>
        /// <response code="200">Contexto actualizado correctamente</response>
        /// <response code="400">Solicitud inválida</response>
        [HttpPost("context/update")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UpdateContext([FromBody] MCPContextUpdateRequest request)
        {
            try
            {
                _logger.LogInformation("Actualizando contexto para reporte {ReportId}", request.ReportId);
                await _mcpService.UpdateContextAsync(request);
                return Ok();
            }
            catch (ValidationException ex)
            {
                _logger.LogWarning(ex, "Error de validación al actualizar contexto");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar contexto");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene el contexto para un reporte específico
        /// </summary>
        /// <param name="reportId">ID del reporte</param>
        /// <response code="200">Devuelve el contexto del reporte</response>
        /// <response code="404">Reporte no encontrado</response>
        [HttpGet("context/{reportId:int}")]
        [ProducesResponseType(typeof(MCPContext), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetContext([FromRoute, Range(1, int.MaxValue)] int reportId)
        {
            try
            {
                var result = await _mcpService.GetContextAsync(reportId);
                if (result == null)
                {
                    return NotFound();
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo contexto para reporte {ReportId}", reportId);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Ejecuta una consulta en el servicio MCP
        /// </summary>
        /// <param name="request">Consulta a ejecutar</param>
        /// <response code="200">Resultado de la consulta</response>
        /// <response code="400">Consulta inválida</response>
        [HttpPost("query")]
        [ProducesResponseType(typeof(MCPQueryResult), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Query([FromBody] MCPQueryRequest request)
        {
            try
            {
                var result = await _mcpService.QueryAsync(request);
                return Ok(result);
            }
            catch (ValidationException ex)
            {
                _logger.LogWarning(ex, "Error de validación en consulta MCP");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error ejecutando consulta MCP");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Verifica el estado del servicio MCP
        /// </summary>
        /// <response code="200">Estado del servicio</response>
        [HttpGet("health")]
        [ProducesResponseType(typeof(MCPHealth), StatusCodes.Status200OK)]
        public async Task<IActionResult> Health()
        {
            try
            {
                var result = await _mcpService.HealthCheckAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verificando salud de MCP");
                return StatusCode(500, new MCPHealth { Healthy = false, Message = ex.Message });
            }
        }
    }
}