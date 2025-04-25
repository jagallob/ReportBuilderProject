using ClosedXML.Excel;
using Newtonsoft.Json;


namespace ReportBuilderAPI.Services
{
    public class ExcelProcessor
    {
        public static string ExtractDataAsJson(string filePath)
        {
            using var workbook = new XLWorkbook(filePath);
            var sheet = workbook.Worksheets.First();

            var data = new List<Dictionary<string, string>>();

            var headers = sheet.Row(1).Cells().Select(c => c.GetValue<string>()).ToList();

            foreach (var row in sheet.RowsUsed().Skip(1))
            {
                var rowDict = new Dictionary<string, string>();
                for (int i = 0; i < headers.Count; i++)
                {
                    var cell = row.Cell(i + 1);
                    rowDict[headers[i]] = cell.GetValue<string>();
                }
                data.Add(rowDict);
            }

            return JsonConvert.SerializeObject(data, Formatting.Indented);
        }
    }
}
