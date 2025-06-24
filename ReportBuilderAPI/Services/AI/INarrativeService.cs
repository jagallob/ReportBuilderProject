namespace ReportBuilderAPI.Services.AI
{
    public interface INarrativeService
    {
        Task<string> GenerateNarrativeAsync(object request);
        Task<IEnumerable<string>> GetTemplatesAsync();
        Task<string> CustomizeNarrativeAsync(object request);
        Task<IEnumerable<string>> GetSuggestionsAsync(int reportId);
    }
}
