using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ReportBuilderAPI.Data;
using ReportBuilderAPI.Models;
using ReportBuilderAPI.DTOs;
using ReportBuilderAPI.Services.PDF.Interfaces;
using System.Security.Claims;
using System.Text.Json;

namespace ReportBuilderAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,admin")]
    public class ConsolidatedTemplatesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ConsolidatedTemplatesController> _logger;
        private readonly IPDFAnalysisService _pdfAnalysisService;

        public ConsolidatedTemplatesController(
            AppDbContext context, 
            ILogger<ConsolidatedTemplatesController> logger,
            IPDFAnalysisService pdfAnalysisService)
        {
            _context = context;
            _logger = logger;
            _pdfAnalysisService = pdfAnalysisService;
        }

        /// <summary>
        /// Endpoint de prueba para verificar autenticación
        /// </summary>
        [HttpGet("test-auth")]
        [Authorize] // Solo requiere autenticación, no rol específico
        public ActionResult<object> TestAuth()
        {
            return Ok(new
            {
                IsAuthenticated = User.Identity?.IsAuthenticated,
                UserName = User.Identity?.Name,
                Roles = User.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value).ToList(),
                Claims = User.Claims.Select(c => new { Type = c.Type, Value = c.Value }).ToList()
            });
        }

        /// <summary>
        /// Obtiene todas las plantillas consolidadas
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ConsolidatedTemplateDto>>> GetConsolidatedTemplates()
        {
            try
            {
                var isAdmin = User.IsInRole("Admin");
                if (!isAdmin)
                {
                    Console.WriteLine("Usuario no tiene rol Admin");
                    return Forbid();
                }
                var templates = await _context.ConsolidatedTemplates
                    .Include(ct => ct.CreatedByUser)
                    .Include(ct => ct.Sections)
                    .ThenInclude(s => s.Area)
                    .Select(ct => new ConsolidatedTemplateDto
                    {
                        Id = ct.Id,
                        Name = ct.Name,
                        Description = ct.Description,
                        Status = ct.Status,
                        Period = ct.Period,
                        Deadline = ct.Deadline,
                        CreatedAt = ct.CreatedAt,
                        UpdatedAt = ct.UpdatedAt,
                        CreatedByUserName = ct.CreatedByUser != null ? ct.CreatedByUser.FullName ?? "N/A" : "N/A",
                        SectionsCount = ct.Sections.Count,
                        CompletedSectionsCount = ct.Sections.Count(s => s.Status == "completed" || s.Status == "reviewed")
                    })
                    .ToListAsync();

                return Ok(templates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener plantillas consolidadas");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene una plantilla consolidada específica con sus secciones
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ConsolidatedTemplateDetailDto>> GetConsolidatedTemplate(int id)
        {
            try
            {
                var template = await _context.ConsolidatedTemplates
                    .Include(ct => ct.CreatedByUser)
                    .Include(ct => ct.Sections)
                    .ThenInclude(s => s.Area)
                    .Include(ct => ct.Sections)
                    .ThenInclude(s => s.CompletedByUser)
                    .FirstOrDefaultAsync(ct => ct.Id == id);

                if (template == null)
                {
                    return NotFound("Plantilla consolidada no encontrada");
                }

                var result = new ConsolidatedTemplateDetailDto
                {
                    Id = template.Id,
                    Name = template.Name,
                    Description = template.Description,
                    Status = template.Status,
                    Period = template.Period,
                    Deadline = template.Deadline,
                    Configuration = template.Configuration,
                    CreatedAt = template.CreatedAt,
                    UpdatedAt = template.UpdatedAt,
                    CreatedByUserName = template.CreatedByUser != null ? template.CreatedByUser.FullName ?? "N/A" : "N/A",
                    Sections = template.Sections.Select(s => new ConsolidatedTemplateSectionDto
                    {
                        Id = s.Id,
                        AreaId = s.AreaId,
                        AreaName = s.Area != null ? s.Area.Name ?? "N/A" : "N/A",
                        SectionTitle = s.SectionTitle,
                        SectionDescription = s.SectionDescription,
                        Status = s.Status,
                        Order = s.Order,
                        SectionDeadline = s.SectionDeadline,
                        AssignedAt = s.AssignedAt,
                        CompletedAt = s.CompletedAt,
                        CompletedByUserName = s.CompletedByUser != null ? s.CompletedByUser.FullName : null,
                        SectionConfiguration = s.SectionConfiguration,
                        CreatedAt = s.CreatedAt,
                        UpdatedAt = s.UpdatedAt
                    }).OrderBy(s => s.Order).ToList()
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener plantilla consolidada con ID {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Crea una nueva plantilla consolidada basada en informes anteriores
        /// </summary>
        [HttpPost("from-reports")]
        public async Task<ActionResult<ConsolidatedTemplateDetailDto>> CreateFromReports([FromBody] CreateConsolidatedTemplateRequest request)
        {
            try
            {
                // Obtener el ID del usuario actual
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int currentUserId))
                {
                    return BadRequest("Usuario no válido");
                }

                // Verificar que el usuario existe
                var user = await _context.Users.FindAsync(currentUserId);
                if (user == null)
                {
                    return BadRequest("Usuario no encontrado");
                }

                // Verificar que las áreas existen
                var areaIds = request.Sections.Select(s => s.AreaId).Distinct().ToList();
                var areas = await _context.Areas.Where(a => areaIds.Contains(a.Id)).ToListAsync();
                if (areas.Count != areaIds.Count)
                {
                    return BadRequest("Una o más áreas no existen");
                }

                // Crear la plantilla consolidada
                var consolidatedTemplate = new ConsolidatedTemplate
                {
                    Name = request.Name,
                    Description = request.Description,
                    Period = request.Period,
                    Deadline = request.Deadline,
                    Status = "draft",
                    CreatedByUserId = currentUserId,
                    Configuration = request.Configuration
                };

                _context.ConsolidatedTemplates.Add(consolidatedTemplate);
                await _context.SaveChangesAsync();

                // Crear las secciones
                var sections = new List<ConsolidatedTemplateSection>();
                foreach (var sectionRequest in request.Sections.OrderBy(s => s.Order))
                {
                    var section = new ConsolidatedTemplateSection
                    {
                        ConsolidatedTemplateId = consolidatedTemplate.Id,
                        AreaId = sectionRequest.AreaId,
                        SectionTitle = sectionRequest.SectionTitle,
                        SectionDescription = sectionRequest.SectionDescription,
                        Order = sectionRequest.Order,
                        SectionDeadline = sectionRequest.SectionDeadline,
                        Status = "pending",
                        SectionConfiguration = sectionRequest.SectionConfiguration
                    };
                    sections.Add(section);
                }

                _context.ConsolidatedTemplateSections.AddRange(sections);
                await _context.SaveChangesAsync();

                // Retornar la plantilla creada
                return await GetConsolidatedTemplate(consolidatedTemplate.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear plantilla consolidada desde informes");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Actualiza una plantilla consolidada
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateConsolidatedTemplate(int id, [FromBody] UpdateConsolidatedTemplateRequest request)
        {
            try
            {
                var template = await _context.ConsolidatedTemplates.FindAsync(id);
                if (template == null)
                {
                    return NotFound("Plantilla consolidada no encontrada");
                }

                if (!string.IsNullOrEmpty(request.Name))
                    template.Name = request.Name;
                
                if (!string.IsNullOrEmpty(request.Description))
                    template.Description = request.Description;
                
                if (!string.IsNullOrEmpty(request.Status))
                    template.Status = request.Status;
                
                if (request.Deadline.HasValue)
                    template.Deadline = request.Deadline;
                
                if (request.Configuration != null)
                    template.Configuration = request.Configuration;

                template.MarkAsUpdated();
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al actualizar plantilla consolidada con ID {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Asigna una sección a un área específica
        /// </summary>
        [HttpPost("{id}/sections/{sectionId}/assign")]
        public async Task<IActionResult> AssignSection(int id, int sectionId, [FromBody] AssignSectionRequest request)
        {
            try
            {
                var section = await _context.ConsolidatedTemplateSections
                    .Include(s => s.ConsolidatedTemplate)
                    .FirstOrDefaultAsync(s => s.Id == sectionId && s.ConsolidatedTemplateId == id);

                if (section == null)
                {
                    return NotFound("Sección no encontrada");
                }

                // Verificar que el área existe
                var area = await _context.Areas.FindAsync(request.AreaId);
                if (area == null)
                {
                    return BadRequest("Área no encontrada");
                }

                section.AreaId = request.AreaId;
                section.Status = "assigned";
                section.AssignedAt = DateTime.UtcNow;
                if (request.SectionDeadline.HasValue)
                    section.SectionDeadline = request.SectionDeadline;

                section.MarkAsUpdated();
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al asignar sección {sectionId} de plantilla {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Actualiza el estado de una sección
        /// </summary>
        [HttpPut("{id}/sections/{sectionId}/status")]
        public async Task<IActionResult> UpdateSectionStatus(int id, int sectionId, [FromBody] UpdateSectionStatusRequest request)
        {
            try
            {
                var section = await _context.ConsolidatedTemplateSections
                    .FirstOrDefaultAsync(s => s.Id == sectionId && s.ConsolidatedTemplateId == id);

                if (section == null)
                {
                    return NotFound("Sección no encontrada");
                }

                section.Status = request.Status;
                
                if (request.Status == "completed" || request.Status == "reviewed")
                {
                    section.CompletedAt = DateTime.UtcNow;
                    
                    // Obtener el ID del usuario actual
                    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    if (int.TryParse(userIdClaim, out int currentUserId))
                    {
                        section.CompletedByUserId = currentUserId;
                    }
                }

                section.MarkAsUpdated();
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al actualizar estado de sección {sectionId} de plantilla {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene el estado detallado de una plantilla consolidada
        /// </summary>
        [HttpGet("{id}/status")]
        public async Task<ActionResult<ConsolidatedTemplateStatusDto>> GetTemplateStatus(int id)
        {
            try
            {
                var template = await _context.ConsolidatedTemplates
                    .Include(ct => ct.Sections)
                    .ThenInclude(s => s.Area)
                    .Include(ct => ct.Sections)
                    .ThenInclude(s => s.CompletedByUser)
                    .FirstOrDefaultAsync(ct => ct.Id == id);

                if (template == null)
                {
                    return NotFound("Plantilla consolidada no encontrada");
                }

                var sections = template.Sections.ToList();
                var now = DateTime.UtcNow;

                var status = new ConsolidatedTemplateStatusDto
                {
                    Id = template.Id,
                    Name = template.Name,
                    Status = template.Status,
                    TotalSections = sections.Count,
                    PendingSections = sections.Count(s => s.Status == "pending"),
                    AssignedSections = sections.Count(s => s.Status == "assigned"),
                    InProgressSections = sections.Count(s => s.Status == "in_progress"),
                    CompletedSections = sections.Count(s => s.Status == "completed"),
                    ReviewedSections = sections.Count(s => s.Status == "reviewed"),
                    CompletionPercentage = sections.Count > 0 ? 
                        (double)(sections.Count(s => s.Status == "completed" || s.Status == "reviewed")) / sections.Count * 100 : 0,
                    SectionStatuses = sections.Select(s => new SectionStatusDto
                    {
                        Id = s.Id,
                        SectionTitle = s.SectionTitle,
                        AreaName = s.Area != null ? s.Area.Name ?? "N/A" : "N/A",
                        Status = s.Status,
                        AssignedAt = s.AssignedAt,
                        SectionDeadline = s.SectionDeadline,
                        CompletedAt = s.CompletedAt,
                        CompletedByUserName = s.CompletedByUser != null ? s.CompletedByUser.FullName : null,
                        IsOverdue = s.SectionDeadline.HasValue && s.SectionDeadline < now && s.Status != "completed" && s.Status != "reviewed"
                    }).OrderBy(s => s.SectionTitle).ToList()
                };

                return Ok(status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener estado de plantilla consolidada {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Elimina una plantilla consolidada
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteConsolidatedTemplate(int id)
        {
            try
            {
                var template = await _context.ConsolidatedTemplates.FindAsync(id);
                if (template == null)
                {
                    return NotFound("Plantilla consolidada no encontrada");
                }

                _context.ConsolidatedTemplates.Remove(template);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al eliminar plantilla consolidada {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Analiza un PDF y sugiere estructura para plantilla consolidada
        /// </summary>
        [HttpPost("analyze-pdf")]
        public async Task<ActionResult<PDFAnalysisResponse>> AnalyzePDF([FromForm] AnalyzePDFRequest request)
        {
            try
            {
                // Debug: Log authentication information
                _logger.LogInformation("User authenticated: {IsAuthenticated}", User.Identity?.IsAuthenticated);
                _logger.LogInformation("User name: {UserName}", User.Identity?.Name);
                _logger.LogInformation("User roles: {Roles}", string.Join(", ", User.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value)));
                _logger.LogInformation("User claims: {Claims}", string.Join(", ", User.Claims.Select(c => $"{c.Type}={c.Value}")));

                if (request.PDFFile == null || request.PDFFile.Length == 0)
                {
                    return BadRequest("No se proporcionó archivo PDF");
                }

                if (!request.PDFFile.ContentType.Equals("application/pdf", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest("El archivo debe ser un PDF");
                }

                _logger.LogInformation("Iniciando análisis de PDF: {FileName}", request.PDFFile.FileName);

                // Guardar archivo temporalmente
                var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "pdf-analysis");
                if (!Directory.Exists(uploadPath))
                    Directory.CreateDirectory(uploadPath);

                var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(request.PDFFile.FileName)}";
                var filePath = Path.Combine(uploadPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await request.PDFFile.CopyToAsync(stream);
                }

                try
                {
                    // Analizar PDF
                    var analysisResult = await _pdfAnalysisService.AnalyzePDFAsync(filePath, request.AnalysisConfig);

                    // Obtener áreas disponibles
                    var availableAreas = await _context.Areas.ToListAsync();

                    // Generar plantillas de secciones
                    var sectionTemplates = await _pdfAnalysisService.GenerateSectionTemplatesAsync(analysisResult, availableAreas);

                    // Sugerir asignaciones de áreas
                    var areaAssignments = await _pdfAnalysisService.SuggestAreaAssignmentsAsync(analysisResult, availableAreas);

                    // Convertir a DTOs
                    var response = new PDFAnalysisResponse
                    {
                        DocumentTitle = analysisResult.DocumentTitle,
                        Sections = analysisResult.Sections.Select(s => new PDFSectionDto
                        {
                            Id = s.Id,
                            Title = s.Title,
                            Subtitle = s.Subtitle,
                            PageNumber = s.PageNumber,
                            Order = s.Order,
                            Content = s.Content,
                            Components = s.Components.Select(c => new PDFComponentDto
                            {
                                Id = c.Id,
                                Type = c.Type.ToString(),
                                Content = c.Content,
                                Caption = c.Caption,
                                Position = new ComponentPositionDto
                                {
                                    X = c.Position.X,
                                    Y = c.Position.Y,
                                    Width = c.Position.Width,
                                    Height = c.Position.Height,
                                    Page = c.Position.Page
                                },
                                DataSources = c.DataSources
                            }).ToList(),
                            Keywords = s.Keywords,
                            SuggestedArea = s.SuggestedArea,
                            Confidence = s.Confidence
                        }).ToList(),
                        SuggestedAssignments = areaAssignments.Select(a => new AreaAssignmentDto
                        {
                            SectionId = a.SectionId,
                            SectionTitle = a.SectionTitle,
                            AreaId = a.AreaId,
                            AreaName = a.AreaName,
                            Confidence = a.Confidence,
                            Reasoning = a.Reasoning,
                            RequiredComponents = a.RequiredComponents.Select(c => c.ToString()).ToList()
                        }).ToList(),
                        GeneratedTemplates = sectionTemplates.Select(t => new GeneratedSectionTemplateDto
                        {
                            SectionId = t.SectionId,
                            SectionTitle = t.SectionTitle,
                            AreaId = t.AreaId,
                            AreaName = t.AreaName,
                            Components = t.Components.Select(c => new ComponentTemplateDto
                            {
                                Id = c.Id,
                                Type = c.Type.ToString(),
                                Title = c.Title,
                                Description = c.Description,
                                Required = c.Required,
                                Order = c.Order,
                                DefaultValue = c.DefaultValue,
                                DataFields = c.DataFields
                            }).ToList(),
                            Instructions = t.Instructions,
                            RequiredDataSources = t.RequiredDataSources
                        }).ToList(),
                        AnalyzedAt = analysisResult.AnalyzedAt
                    };

                    _logger.LogInformation("Análisis de PDF completado. Secciones identificadas: {SectionCount}", response.Sections.Count);
                    return Ok(response);
                }
                finally
                {
                    // Limpiar archivo temporal
                    if (System.IO.File.Exists(filePath))
                    {
                        System.IO.File.Delete(filePath);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analizando PDF");
                return StatusCode(500, "Error interno del servidor durante el análisis del PDF");
            }
        }

        /// <summary>
        /// Crea una plantilla consolidada desde un PDF analizado
        /// </summary>
        [HttpPost("from-pdf")]
        public async Task<ActionResult<CreateFromPDFResponse>> CreateFromPDF([FromForm] CreateConsolidatedTemplateFromPDFRequest request)
        {
            try
            {
                if (request.PDFFile == null || request.PDFFile.Length == 0)
                {
                    return BadRequest("No se proporcionó archivo PDF");
                }

                _logger.LogInformation("Creando plantilla consolidada desde PDF: {TemplateName}", request.TemplateName);

                // Obtener ID del usuario actual
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized("Usuario no identificado");
                }

                // Guardar archivo temporalmente
                var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "pdf-analysis");
                if (!Directory.Exists(uploadPath))
                    Directory.CreateDirectory(uploadPath);

                var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(request.PDFFile.FileName)}";
                var filePath = Path.Combine(uploadPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await request.PDFFile.CopyToAsync(stream);
                }

                try
                {
                    // Analizar PDF
                    var analysisResult = await _pdfAnalysisService.AnalyzePDFAsync(filePath, request.AnalysisConfig);

                    // Obtener áreas disponibles
                    var availableAreas = await _context.Areas.ToListAsync();

                    // Crear plantilla consolidada
                    var consolidatedTemplate = new ConsolidatedTemplate
                    {
                        Name = request.TemplateName,
                        Description = request.Description,
                        Status = "draft",
                        Period = request.Period,
                        Deadline = request.Deadline,
                        CreatedByUserId = userId,
                        Configuration = new ConsolidatedTemplateConfiguration
                        {
                            SourceType = "pdf",
                            SourceFileName = request.PDFFile.FileName,
                            AnalysisMetadata = analysisResult.Metadata
                        }
                    };

                    _context.ConsolidatedTemplates.Add(consolidatedTemplate);
                    await _context.SaveChangesAsync();

                    // Crear secciones basadas en el análisis
                    var createdSections = new List<ConsolidatedTemplateSectionDto>();
                    var order = 1;

                    foreach (var section in analysisResult.Sections)
                    {
                        // Buscar asignación sugerida
                        var assignment = request.SectionAssignments.FirstOrDefault(a => a.SectionId == section.Id);
                        var areaId = assignment?.AreaId ?? 1; // Área por defecto si no hay asignación

                        var templateSection = new ConsolidatedTemplateSection
                        {
                            ConsolidatedTemplateId = consolidatedTemplate.Id,
                            AreaId = areaId,
                            SectionTitle = section.Title,
                            SectionDescription = section.Subtitle,
                            Status = "pending",
                            Order = order++,
                            SectionDeadline = request.Deadline?.AddDays(-7), // Una semana antes del deadline principal
                            SectionConfiguration = new SectionConfiguration
                            {
                                Components = section.Components.Select(c => new ComponentConfiguration
                                {
                                    Type = c.Type.ToString(),
                                    Title = c.Caption,
                                    Required = true,
                                    Order = c.Position.Page
                                }).ToList(),
                                Instructions = $"Completar sección '{section.Title}' basada en el análisis del PDF"
                            }
                        };

                        _context.ConsolidatedTemplateSections.Add(templateSection);
                        createdSections.Add(new ConsolidatedTemplateSectionDto
                        {
                            Id = templateSection.Id,
                            AreaId = templateSection.AreaId,
                            AreaName = availableAreas.FirstOrDefault(a => a.Id == areaId)?.Name ?? "N/A",
                            SectionTitle = templateSection.SectionTitle,
                            SectionDescription = templateSection.SectionDescription,
                            Status = templateSection.Status,
                            Order = templateSection.Order,
                            SectionDeadline = templateSection.SectionDeadline,
                            AssignedAt = templateSection.AssignedAt,
                            CompletedAt = templateSection.CompletedAt
                        });
                    }

                    await _context.SaveChangesAsync();

                    var response = new CreateFromPDFResponse
                    {
                        ConsolidatedTemplateId = consolidatedTemplate.Id,
                        TemplateName = consolidatedTemplate.Name,
                        Analysis = new PDFAnalysisResponse
                        {
                            DocumentTitle = analysisResult.DocumentTitle,
                            Sections = analysisResult.Sections.Select(s => new PDFSectionDto
                            {
                                Id = s.Id,
                                Title = s.Title,
                                Subtitle = s.Subtitle,
                                PageNumber = s.PageNumber,
                                Order = s.Order,
                                Content = s.Content,
                                Components = s.Components.Select(c => new PDFComponentDto
                                {
                                    Id = c.Id,
                                    Type = c.Type.ToString(),
                                    Content = c.Content,
                                    Caption = c.Caption,
                                    Position = new ComponentPositionDto
                                    {
                                        X = c.Position.X,
                                        Y = c.Position.Y,
                                        Width = c.Position.Width,
                                        Height = c.Position.Height,
                                        Page = c.Position.Page
                                    },
                                    DataSources = c.DataSources
                                }).ToList(),
                                Keywords = s.Keywords,
                                SuggestedArea = s.SuggestedArea,
                                Confidence = s.Confidence
                            }).ToList(),
                            AnalyzedAt = analysisResult.AnalyzedAt
                        },
                        CreatedSections = createdSections,
                        Message = $"Plantilla consolidada '{request.TemplateName}' creada exitosamente con {createdSections.Count} secciones"
                    };

                    _logger.LogInformation("Plantilla consolidada creada desde PDF. ID: {TemplateId}, Secciones: {SectionCount}", 
                        consolidatedTemplate.Id, createdSections.Count);

                    return Ok(response);
                }
                finally
                {
                    // Limpiar archivo temporal
                    if (System.IO.File.Exists(filePath))
                    {
                        System.IO.File.Delete(filePath);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creando plantilla consolidada desde PDF");
                return StatusCode(500, "Error interno del servidor durante la creación de la plantilla");
            }
        }
    }
} 