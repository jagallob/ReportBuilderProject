using Microsoft.AspNetCore.Mvc;
using ReportBuilderAPI.Services.AI;

namespace ReportBuilderAPI.Controllers
{
    [ApiController]
    [Route("api/narrative")]
    public class NarrativeController : ControllerBase
    {
        private readonly INarrativeService _narrativeService;
        public NarrativeController(INarrativeService narrativeService)
        {
            _narrativeService = narrativeService;
        }

        [HttpPost("generate")]
        public async Task<IActionResult> Generate([FromBody] object request)
        {
            var result = await _narrativeService.GenerateNarrativeAsync(request);
            return Ok(result);
        }

        [HttpGet("templates")]
        public async Task<IActionResult> GetTemplates()
        {
            var result = await _narrativeService.GetTemplatesAsync();
            return Ok(result);
        }

        [HttpPost("customize")]
        public async Task<IActionResult> Customize([FromBody] object request)
        {
            var result = await _narrativeService.CustomizeNarrativeAsync(request);
            return Ok(result);
        }

        [HttpGet("suggestions/{reportId}")]
        public async Task<IActionResult> GetSuggestions(int reportId)
        {
            var result = await _narrativeService.GetSuggestionsAsync(reportId);
            return Ok(result);
        }
    }
}
