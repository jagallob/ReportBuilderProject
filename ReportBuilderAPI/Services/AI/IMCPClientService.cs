namespace ReportBuilderAPI.Services.AI
{
    public interface IMCPClientService
    {
        Task UpdateContextAsync(object contextUpdateRequest);
        Task<object> GetContextAsync(int reportId);
        Task<object> QueryAsync(object queryRequest);
        Task<bool> HealthCheckAsync();
    }
}
