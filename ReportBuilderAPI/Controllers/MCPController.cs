using Microsoft.AspNetCore.Mvc;
using ReportBuilderAPI.Services.AI;

namespace ReportBuilderAPI.Controllers
{
    [ApiController]
    [Route("api/mcp")]
    public class MCPController : ControllerBase
    {
        private readonly IMCPClientService _mcpService;
        public MCPController(IMCPClientService mcpService)
        {
            _mcpService = mcpService;
        }

        [HttpPost("context/update")]
        public async Task<IActionResult> UpdateContext([FromBody] object contextUpdateRequest)
        {
            await _mcpService.UpdateContextAsync(contextUpdateRequest);
            return Ok();
        }

        [HttpGet("context/{reportId}")]
        public async Task<IActionResult> GetContext(int reportId)
        {
            var result = await _mcpService.GetContextAsync(reportId);
            return Ok(result);
        }

        [HttpPost("query")]
        public async Task<IActionResult> Query([FromBody] object queryRequest)
        {
            var result = await _mcpService.QueryAsync(queryRequest);
            return Ok(result);
        }

        [HttpGet("health")]
        public async Task<IActionResult> Health()
        {
            var result = await _mcpService.HealthCheckAsync();
            return Ok(result);
        }
    }
}
