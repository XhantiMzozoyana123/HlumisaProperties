using System.Globalization;
using System.Text;
using CsvHelper;
using CsvHelper.Configuration;
using HlumisaProperties.Application.Dtos;
using HlumisaProperties.Application.Interfaces;

namespace HlumisaProperties.Infrastructure.Services
{
    /// <summary>
    /// Stores the Books table as a CSV file on the API server using CsvHelper.
    /// Reads/writes the whole file, so it behaves like an editable spreadsheet file
    /// rather than a database. The file path comes from <see cref="BooksCsvSettings"/>.
    /// </summary>
    public class BooksCsvService : IBooksCsvService
    {
        private static readonly CultureInfo CsvCulture = CultureInfo.InvariantCulture;

        private readonly string _filePath;

        public BooksCsvService(BooksCsvSettings settings)
        {
            var path = string.IsNullOrWhiteSpace(settings?.FilePath) ? "data/books.csv" : settings.FilePath;
            _filePath = Path.GetFullPath(path);
        }

        public bool Exists() => File.Exists(_filePath);

        public async Task<string> ReadCsvAsync()
        {
            if (!File.Exists(_filePath))
                throw new FileNotFoundException("books.csv has not been created yet.", _filePath);
            return await File.ReadAllTextAsync(_filePath);
        }

        public async Task<string> WriteCsvAsync(string csvText)
        {
            if (string.IsNullOrWhiteSpace(csvText))
                throw new ArgumentException("CSV content cannot be empty.", nameof(csvText));

            var rows = ParseCsv(csvText);
            return await WriteRowsAsync(rows);
        }

        public async Task<string> WriteRowsAsync(IEnumerable<BooksCsvRow> rows)
        {
            var csvText = ToCsv(rows);
            await WriteFileAsync(csvText);
            return csvText;
        }

        public Task<List<BooksCsvRow>> ParseRowsAsync(string csvText)
        {
            return Task.FromResult(ParseCsv(csvText));
        }

        public Task<string> RowsToCsvAsync(IEnumerable<BooksCsvRow> rows)
        {
            return Task.FromResult(ToCsv(rows));
        }

        /// <summary>
        /// Parses the incoming CSV text with CsvHelper so we validate it and normalize
        /// the formatting before persisting. Column headers are matched case-insensitively
        /// against the <see cref="BooksCsvRow"/> attributes.
        /// </summary>
        private List<BooksCsvRow> ParseCsv(string csvText)
        {
            var config = new CsvConfiguration(CsvCulture)
            {
                Delimiter = ",",
                HasHeaderRecord = true,
                MissingFieldFound = null, // tolerate absent columns
                HeaderValidated = null,   // tolerate unknown/extra columns
                BadDataFound = null,
            };

            using var reader = new StringReader(csvText);
            using var csv = new CsvReader(reader, config);

            if (!csv.Read() || !csv.ReadHeader())
                return new List<BooksCsvRow>();

            var rows = new List<BooksCsvRow>();
            while (csv.Read())
            {
                rows.Add(csv.GetRecord<BooksCsvRow>());
            }
            return rows;
        }

        /// <summary>Serializes rows to a CSV string using CsvHelper (canonical header row included).</summary>
        private static string ToCsv(IEnumerable<BooksCsvRow> rows)
        {
            var config = new CsvConfiguration(CsvCulture)
            {
                Delimiter = ",",
                HasHeaderRecord = true,
            };

            using var textWriter = new StringWriter();
            using var csv = new CsvWriter(textWriter, config);
            csv.WriteRecords(rows.ToList());
            return textWriter.ToString();
        }

        private async Task WriteFileAsync(string csvText)
        {
            var dir = Path.GetDirectoryName(_filePath);
            if (!string.IsNullOrWhiteSpace(dir))
                Directory.CreateDirectory(dir);

            // UTF-8 with BOM so Excel opens the file correctly.
            await File.WriteAllTextAsync(_filePath, csvText, new UTF8Encoding(true));
        }
    }
}