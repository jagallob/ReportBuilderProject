using System.Threading.Tasks;
namespace ReportBuilderAPI.Services.Data
{
    public class DataProcessingService : IDataProcessingService
    {
        public async Task<object> ExtractDataAsync(Stream excelStream)
        {
            // TODO: Implement data extraction from Excel
            return null;
        }
        public async Task<object> PreprocessDataAsync(object rawData)
        {
            // TODO: Implement data preprocessing
            return null;
        }
    }
}
