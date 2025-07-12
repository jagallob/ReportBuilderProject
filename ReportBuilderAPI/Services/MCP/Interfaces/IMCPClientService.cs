using ReportBuilderAPI.Services.MCP.Models;

namespace ReportBuilderAPI.Services.MCP.Interfaces
{
    public interface IMCPClientService
    {
        Task<MCPResponse> SendRequestAsync(MCPRequest request);
        Task<bool> UpdateContextAsync(MCPContextUpdateRequest request);
        Task<MCPContext> GetContextAsync(int reportId);
        Task<MCPHealth> HealthCheckAsync();
        Task<MCPQueryResult> QueryAsync(MCPQueryRequest request);
        Task<bool> InitializeAsync();
    }
}