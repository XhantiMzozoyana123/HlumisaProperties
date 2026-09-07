using HlumisaProperties.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HlumisaProperties.Api.Controllers
{
    /// <summary>
    /// Serves the Books section as an editable CSV file stored on the API server
    /// (read/write via <see cref="IBooksCsvService"/>, which uses CsvHelper — no database).
    /// The dashboard loads the whole CSV text and PUTs the edited file back.
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/books-csv")]
    public class BooksCsvController : ControllerBase
    {
        private readonly IBooksCsvService _booksCsvService;

        public BooksCsvController(IBooksCsvService booksCsvService)
        {
            _booksCsvService = booksCsvService;
        }

        /// <summary>
        /// Returns the current books.csv file as text/csv. The dashboard reads this,
        /// parses it client-side, and lets the user edit every cell.
        /// </summary>
        [HttpGet]
        [Produces("text/csv")]
        public async Task<IActionResult> GetCsv()
        {
            var csv = await _booksCsvService.ReadCsvAsync();
            return Content(csv, "text/csv; charset=utf-8");
        }

        /// <summary>
        /// Returns the books.csv file as a downloadable attachment (Content-Disposition: attachment).
        /// </summary>
        [HttpGet("download")]
        public async Task<IActionResult> DownloadCsv()
        {
            var csv = await _booksCsvService.ReadCsvAsync();
            var bytes = System.Text.Encoding.UTF8.GetBytes(csv);
            return File(bytes, "text/csv; charset=utf-8", "books.csv");
        }

        /// <summary>
        /// Persists the edited CSV file. The whole file is replaced with the supplied
        /// content (parsed + normalized through CsvHelper before writing). Returns the
        /// normalized CSV so the dashboard can reload the canonical version.
        /// </summary>
        [HttpPut]
        public async Task<IActionResult> SaveCsv([FromBody] BooksCsvSaveRequest request)
        {
            if (string.IsNullOrWhiteSpace(request?.Csv))
                return BadRequest(new { message = "CSV content is required." });

            try
            {
                var normalized = await _booksCsvService.WriteCsvAsync(request.Csv);
                return Ok(new { message = "books.csv saved to the server.", csv = normalized });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Failed to save books.csv: {ex.Message}" });
            }
        }
    }

    /// <summary>Request body for PUT /api/books-csv.</summary>
    public class BooksCsvSaveRequest
    {
        public string Csv { get; set; } = string.Empty;
    }
}