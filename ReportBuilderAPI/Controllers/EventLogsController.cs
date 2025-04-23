using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReportBuilderAPI.Data;
using ReportBuilderAPI.Models;

namespace ReportBuilderAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventLogsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EventLogsController(AppDbContext context)
        {
            _context = context;
        }

       
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventLog>>> GetEventLogs()
        {
            return await _context.EventLogs.Include(e => e.Area).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EventLog>> GetEventLog(int id)
        {
            var eventLog = await _context.EventLogs
                .Include(e => e.Area)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (eventLog == null)
            {
                return NotFound();
            }

            return eventLog;
        }

      
        [HttpGet("byArea/{areaId}")]
        public async Task<ActionResult<IEnumerable<EventLog>>> GetEventLogsByArea(int areaId)
        {
            return await _context.EventLogs
                .Where(e => e.AreaId == areaId)
                .Include(e => e.Area)
                .ToListAsync();
        }

        // GET: api/EventLogs/byDate?startDate=2025-04-01&endDate=2025-04-30
        [HttpGet("byDate")]
        public async Task<ActionResult<IEnumerable<EventLog>>> GetEventLogsByDateRange(DateTime startDate, DateTime endDate)
        {
            return await _context.EventLogs
                .Where(e => e.EventDate >= startDate && e.EventDate <= endDate)
                .Include(e => e.Area)
                .ToListAsync();
        }

       
        [HttpPost]
        public async Task<ActionResult<EventLog>> CreateEventLog(EventLog eventLog)
        {
            // Verificar si el área existe
            var area = await _context.Areas.FindAsync(eventLog.AreaId);
            if (area == null)
            {
                return BadRequest("El área especificada no existe");
            }

            _context.EventLogs.Add(eventLog);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEventLog), new { id = eventLog.Id }, eventLog);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEventLog(int id, EventLog eventLog)
        {
            if (id != eventLog.Id)
            {
                return BadRequest();
            }

            // Verificar si el área existe
            var area = await _context.Areas.FindAsync(eventLog.AreaId);
            if (area == null)
            {
                return BadRequest("El área especificada no existe");
            }

            _context.Entry(eventLog).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EventLogExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

       
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEventLog(int id)
        {
            var eventLog = await _context.EventLogs.FindAsync(id);
            if (eventLog == null)
            {
                return NotFound();
            }

            _context.EventLogs.Remove(eventLog);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool EventLogExists(int id)
        {
            return _context.EventLogs.Any(e => e.Id == id);
        }
    }
}
