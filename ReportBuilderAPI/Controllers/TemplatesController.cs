using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReportBuilderAPI.Data;
using ReportBuilderAPI.Models;
using ReportBuilderAPI.DTOs;
using System.Text.Json;

namespace ReportBuilderAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TemplatesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<TemplatesController> _logger;

        public TemplatesController(AppDbContext context, ILogger<TemplatesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Obtiene todas las plantillas disponibles
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TemplateDto>>> GetTemplates()
        {
            try
            {
                var templates = await _context.Templates
                    .Include(t => t.Area)
                    .Select(t => new TemplateDto
                    {
                        Id = t.Id,
                        Name = t.Name,
                        Type = t.Type,
                        Version = t.Version,
                        AreaId = t.AreaId,
                        AreaName = t.Area != null ? t.Area.Name : null,
                        CreatedAt = t.CreatedAt,
                        UpdatedAt = t.UpdatedAt
                    })
                    .ToListAsync();

                return Ok(templates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener plantillas");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene una plantilla específica con su configuración completa
        /// </summary>
        /// <param name="id">ID de la plantilla</param>
        [HttpGet("{id}")]
        public async Task<ActionResult<TemplateDetailDto>> GetTemplate(int id)
        {
            try
            {
                var template = await _context.Templates
                    .Include(t => t.Area)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (template == null)
                {
                    return NotFound();
                }

                var result = new TemplateDetailDto
                {
                    Id = template.Id,
                    Name = template.Name,
                    AreaId = template.AreaId,
                    AreaName = template.Area?.Name,
                    Configuration = template.Configuration,
                    CreatedAt = template.CreatedAt,
                    UpdatedAt = template.UpdatedAt
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener plantilla con ID {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene plantillas filtradas por tipo
        /// </summary>
        /// <param name="type">Tipo de plantilla (technical, financial, etc.)</param>
        [HttpGet("byType/{type}")]
        public async Task<ActionResult<IEnumerable<TemplateDto>>> GetTemplatesByType(string type)
        {
            try
            {
                var templates = await _context.Templates
                    .Where(t => t.Type == type)
                    .Include(t => t.Area)
                    .Select(t => new TemplateDto
                    {
                        Id = t.Id,
                        Name = t.Name,
                        Type = t.Type,
                        Version = t.Version,
                        AreaId = t.AreaId,
                        AreaName = t.Area.Name
                    })
                    .ToListAsync();

                return Ok(templates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener plantillas de tipo {type}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Crea una nueva plantilla
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<TemplateDetailDto>> CreateTemplate([FromBody] TemplateCreateDto templateDto)
        {
            try
            {
                // Validar configuración JSON
                if (templateDto.Configuration == null)
                {
                    return BadRequest("La configuración de la plantilla es requerida");
                }

                var template = new Template
                {
                    Name = templateDto.Name,
                    AreaId = templateDto.AreaId,
                    Configuration = templateDto.Configuration
                };

                _context.Templates.Add(template);
                await _context.SaveChangesAsync();

                var result = new TemplateDetailDto
                {
                    Id = template.Id,
                    Name = template.Name,
                    AreaId = template.AreaId,
                    Configuration = template.Configuration,
                    CreatedAt = template.CreatedAt,
                    UpdatedAt = template.UpdatedAt
                };

                return CreatedAtAction(nameof(GetTemplate), new { id = template.Id }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear plantilla");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Actualiza una plantilla existente
        /// </summary>
        /// <param name="id">ID de la plantilla a actualizar</param>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTemplate(int id, [FromBody] TemplateUpdateDto templateDto)
        {
            try
            {
                if (id != templateDto.Id)
                {
                    return BadRequest("ID de plantilla no coincide");
                }

                var existingTemplate = await _context.Templates.FindAsync(id);
                if (existingTemplate == null)
                {
                    return NotFound();
                }

                existingTemplate.Name = templateDto.Name;
                existingTemplate.AreaId = templateDto.AreaId;
                existingTemplate.Configuration = templateDto.Configuration;
                existingTemplate.UpdatedAt = DateTime.UtcNow;

                _context.Entry(existingTemplate).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                if (!TemplateExists(id))
                {
                    return NotFound();
                }
                _logger.LogError(ex, $"Error de concurrencia al actualizar plantilla ID {id}");
                return StatusCode(409, "Conflicto de concurrencia");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al actualizar plantilla ID {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Elimina una plantilla
        /// </summary>
        /// <param name="id">ID de la plantilla a eliminar</param>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTemplate(int id)
        {
            try
            {
                var template = await _context.Templates.FindAsync(id);
                if (template == null)
                {
                    return NotFound();
                }

                _context.Templates.Remove(template);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al eliminar plantilla ID {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene la configuración JSON completa de una plantilla
        /// </summary>
        /// <param name="id">ID de la plantilla</param>
        [HttpGet("{id}/configuration")]
        public async Task<ActionResult<string>> GetTemplateConfiguration(int id)
        {
            try
            {
                var template = await _context.Templates.FindAsync(id);
                if (template == null || string.IsNullOrEmpty(template.ConfigurationJson))
                {
                    return NotFound();
                }

                return Content(template.ConfigurationJson, "application/json");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener configuración de plantilla ID {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        private bool TemplateExists(int id)
        {
            return _context.Templates.Any(e => e.Id == id);
        }
    }
}