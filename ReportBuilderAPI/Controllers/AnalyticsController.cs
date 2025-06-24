using Microsoft.AspNetCore.Mvc;
using ReportBuilderAPI.Services.AI;

namespace ReportBuilderAPI.Controllers
{
    [ApiController]
    [Route("api/analytics")]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;
        public AnalyticsController(IAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        [HttpPost("analyze-excel")]
        public async Task<IActionResult> AnalyzeExcel([FromForm] IFormFile file)
        {
            using var stream = file.OpenReadStream();
            await _analyticsService.AnalyzeExcelAsync(stream);
            return Ok();
        }

        [HttpGet("insights/{reportId}")]
        public async Task<IActionResult> GetInsights(int reportId)
        {
            var result = await _analyticsService.GetInsightsAsync(reportId);
            return Ok(result);
        }

        [HttpGet("trends/{areaId}")]
        public async Task<IActionResult> GetTrends(int areaId)
        {
            var result = await _analyticsService.GetTrendsAsync(areaId);
            return Ok(result);
        }

        [HttpPost("compare-periods")]
        public async Task<IActionResult> ComparePeriods([FromBody] object compareRequest)
        {
            var result = await _analyticsService.ComparePeriodsAsync(compareRequest);
            return Ok(result);
        }
    }
}
