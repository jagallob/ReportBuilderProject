namespace ReportBuilderAPI.Services.Data.Interfaces
{
    public interface IDataProcessingService
    {
        Task<Dictionary<string, object>> ProcessExcelDataAsync(byte[] fileData, string fileName);
        Task<bool> StoreProcessedDataAsync(int reportId, Dictionary<string, object> data);
        Task<Dictionary<string, object>> GetProcessedDataAsync(int reportId);
        Task<bool> ValidateDataAsync(Dictionary<string, object> data);
    }
}