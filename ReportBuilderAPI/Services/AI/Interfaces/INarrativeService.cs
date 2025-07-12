using ReportBuilderAPI.Services.AI.Models;

namespace ReportBuilderAPI.Services.AI.Interfaces
{
    public interface INarrativeService
    {
        Task<NarrativeResult> GenerateNarrativeAsync(NarrativeRequest request);

        Task<IEnumerable<NarrativeTemplate>> GetTemplatesAsync();

        Task<NarrativeResult> CustomizeNarrativeAsync(CustomizeNarrativeRequest request);

        Task<IEnumerable<NarrativeSuggestion>> GetSuggestionsAsync(int reportId);
    }
}
