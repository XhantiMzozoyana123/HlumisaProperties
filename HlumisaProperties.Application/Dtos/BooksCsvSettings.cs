namespace HlumisaProperties.Application.Dtos;

/// <summary>
/// Settings for the Books CSV file stored on the API server.
/// Binds to the "BooksCsv" configuration section (e.g. BooksCsv__FilePath).
/// </summary>
public class BooksCsvSettings
{
    /// <summary>Filesystem path of the books.csv file. Relative paths resolve from the app working directory.</summary>
    public string FilePath { get; set; } = "data/books.csv";
}