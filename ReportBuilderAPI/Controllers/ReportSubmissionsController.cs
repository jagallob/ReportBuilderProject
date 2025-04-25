using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReportBuilderAPI.Data;
using ReportBuilderAPI.Models;

namespace ReportBuilderAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportSubmissionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReportSubmissionsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/ReportSubmissions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReportSubmission>>> GetReportSubmissions()
        {
            return await _context.ReportSubmissions
                .Include(r => r.Area)
                .ToListAsync();
        }

        // GET: api/ReportSubmissions/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ReportSubmission>> GetReportSubmission(int id)
        {
            var submission = await _context.ReportSubmissions
                .Include(r => r.Area)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (submission == null)
                return NotFound();

            return submission;
        }

        // GET: api/ReportSubmissions/byArea
        [HttpGet("byArea/{areaId}")]
        public async Task<ActionResult<IEnumerable<ReportSubmission>>> GetByArea(int areaId)
        {
            return await _context.ReportSubmissions
                .Where(r => r.AreaId == areaId)
                .Include(r => r.Area)
                .ToListAsync();
        }

        // GET: api/ReportSubmissions/byPeriod?period=Abril 2025
        [HttpGet("byPeriod")]
        public async Task<ActionResult<IEnumerable<ReportSubmission>>> GetByPeriod([FromQuery] string period)
        {
            return await _context.ReportSubmissions
                .Where(r => r.Period == period)
                .Include(r => r.Area)
                .ToListAsync();
        }

        // GET: api/ReportSubmissions/byAreaAndPeriod?areaId=3&period=Abril 2025
        [HttpGet("byAreaAndPeriod")]
        public async Task<ActionResult<ReportSubmission>> GetByAreaAndPeriod([FromQuery] int areaId, [FromQuery] string period)
        {
            var report = await _context.ReportSubmissions
                .Include(r => r.Area)
                .FirstOrDefaultAsync(r => r.AreaId == areaId && r.Period == period);

            if (report == null)
                return NotFound();

            return report;
        }


        // POST: api/ReportSubmissions
        [HttpPost]
        public async Task<ActionResult<ReportSubmission>> CreateSubmission(ReportSubmission submission)
        {
            var areaExists = await _context.Areas.AnyAsync(a => a.Id == submission.AreaId);
            if (!areaExists)
                return BadRequest("Área no válida.");

            _context.ReportSubmissions.Add(submission);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetReportSubmission), new { id = submission.Id }, submission);
        }

        // PUT: api/ReportSubmissions
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSubmission(int id, ReportSubmission updated)
        {
            if (id != updated.Id)
                return BadRequest();

            var areaExists = await _context.Areas.AnyAsync(a => a.Id == updated.AreaId);
            if (!areaExists)
                return BadRequest("Área no válida.");

            _context.Entry(updated).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.ReportSubmissions.Any(e => e.Id == id))
                    return NotFound();
                throw;
            }

            return NoContent();
        }

        // DELETE: api/ReportSubmissions
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSubmission(int id)
        {
            var submission = await _context.ReportSubmissions.FindAsync(id);
            if (submission == null)
                return NotFound();

            _context.ReportSubmissions.Remove(submission);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
