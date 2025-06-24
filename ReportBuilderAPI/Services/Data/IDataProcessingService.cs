namespace ReportBuilderAPI.Services.Data
{
    public interface IDataProcessingService
    {
        Task<object> ExtractDataAsync(Stream excelStream);
        Task<object> PreprocessDataAsync(object rawData);
    }
}
