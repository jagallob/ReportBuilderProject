using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReportBuilderAPI.Data;
using ReportBuilderAPI.DTOs;
using ReportBuilderAPI.Models;
using ReportBuilderAPI.Services;

namespace ReportBuilderAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExcelUploadsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ExcelUploadsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/ExcelUploads
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ExcelUpload>>> GetExcelUploads()
        {
            return await _context.ExcelUploads
                .Include(e => e.Area)
                .ToListAsync();
        }

        // GET: api/ExcelUploads/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ExcelUpload>> GetExcelUpload(int id)
        {
            var upload = await _context.ExcelUploads
                .Include(e => e.Area)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (upload == null)
            {
                return NotFound();
            }

            return upload;
        }

        // GET: api/ExcelUploads/byArea
        [HttpGet("byArea/{areaId}")]
        public async Task<ActionResult<IEnumerable<ExcelUpload>>> GetByArea(int areaId)
        {
            return await _context.ExcelUploads
                .Where(e => e.AreaId == areaId)
                .Include(e => e.Area)
                .ToListAsync();
        }

        // POST: api/ExcelUploads
        [HttpPost]
        public async Task<ActionResult<ExcelUpload>> CreateExcelUpload(ExcelUpload upload)
        {
            var areaExists = await _context.Areas.AnyAsync(a => a.Id == upload.AreaId);
            if (!areaExists)
            {
                return BadRequest("El área especificada no existe.");
            }

            _context.ExcelUploads.Add(upload);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetExcelUpload), new { id = upload.Id }, upload);
        }

        // PUT: api/ExcelUploads
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateExcelUpload(int id, ExcelUpload upload)
        {
            if (id != upload.Id)
                return BadRequest();

            var areaExists = await _context.Areas.AnyAsync(a => a.Id == upload.AreaId);
            if (!areaExists)
                return BadRequest("El área especificada no existe.");

            _context.Entry(upload).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.ExcelUploads.Any(e => e.Id == id))
                    return NotFound();
                throw;
            }

            return NoContent();
        }

        // DELETE: api/ExcelUploads
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExcelUpload(int id)
        {
            var upload = await _context.ExcelUploads.FindAsync(id);
            if (upload == null)
            {
                return NotFound();
            }

            _context.ExcelUploads.Remove(upload);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadExcel([FromForm] ExcelUploadRequest request)
        {
            if (request.File == null || request.File.Length == 0)
                return BadRequest("No se recibió ningún archivo.");

            var area = await _context.Areas.FindAsync(request.AreaId);
            if (area == null)
                return BadRequest("Área no encontrada.");

            var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(request.File.FileName)}";
            var filePath = Path.Combine(uploadPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await request.File.CopyToAsync(stream);
            }

            var extractedJson = ExcelProcessor.ExtractDataAsJson(filePath);

            var upload = new ExcelUpload
            {
                AreaId = request.AreaId,
                FileName = fileName,
                Period = request.Period,
                UploadDate = DateTime.UtcNow,
                ExtractedJsonData = extractedJson
            };

            _context.ExcelUploads.Add(upload);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Archivo subido correctamente", uploadId = upload.Id });
        }


    }
}

