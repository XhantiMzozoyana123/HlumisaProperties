using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HlumisaProperties.Application.Dtos;

namespace HlumisaProperties.Application.Interfaces
{
    /// <summary>
    /// Persists the Books table as a CSV file on the API server using CsvHelper
    /// (no database involved). The dashboard reads the full CSV and PUTs the whole
    /// edited file back here.
    /// </summary>
    public interface IBooksCsvService
    {
        /// <summary>Whether the books.csv file already exists on disk.</summary>
        bool Exists();

        /// <summary>Reads the current CSV file content as raw text (creates + seeds it first if missing).</summary>
        Task<string> ReadCsvAsync();

        /// <summary>Parses the supplied CSV text with CsvHelper and writes it back to the file.</summary>
        Task<string> WriteCsvAsync(string csvText);

        /// <summary>Writes the given rows to the file with CsvHelper and returns the serialized CSV.</summary>
        Task<string> WriteRowsAsync(IEnumerable<BooksCsvRow> rows);
    }
}