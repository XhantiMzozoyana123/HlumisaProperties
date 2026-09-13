using HlumisaProperties.Application.Dtos;
using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Domain;
using HlumisaProperties.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HlumisaProperties.Api.Controllers
{
    /// <summary>
    /// Serves the Books section from the physical TransactionLedgers database table
    /// (MySQL) while keeping the CSV contract the dashboard expects: GET returns the
    /// table serialized as CSV, PUT replaces the table with the supplied CSV rows.
    /// The books.csv file on disk is only used as a one-time import source at startup.
    /// Rows load via the IX_TransactionLedgers_Date index (ordered, AsNoTracking).
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/books-csv")]
    public class BooksCsvController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IBooksCsvService _booksCsvService;

        public BooksCsvController(ApplicationDbContext context, IBooksCsvService booksCsvService)
        {
            _context = context;
            _booksCsvService = booksCsvService;
        }

        /// <summary>
        /// Returns the Books table (from the database) serialized as CSV. The dashboard
        /// reads this, parses it client-side, and lets the user edit every cell.
        /// </summary>
        [HttpGet]
        [Produces("text/csv")]
        public async Task<IActionResult> GetCsv()
        {
            var rows = await LoadRowsFromDatabaseAsync();
            var csv = await _booksCsvService.RowsToCsvAsync(rows);
            return Content(csv, "text/csv; charset=utf-8");
        }

        /// <summary>
        /// Returns the Books table (from the database) as a downloadable CSV attachment.
        /// </summary>
        [HttpGet("download")]
        public async Task<IActionResult> DownloadCsv()
        {
            var rows = await LoadRowsFromDatabaseAsync();
            var csv = await _booksCsvService.RowsToCsvAsync(rows);
            var bytes = System.Text.Encoding.UTF8.GetBytes(csv);
            return File(bytes, "text/csv; charset=utf-8", "books.csv");
        }

        /// <summary>
        /// Persists the edited Books table to the database: the supplied CSV is parsed,
        /// the TransactionLedgers table is replaced (single transaction, set-based
        /// delete + bulk insert), and the normalized CSV is returned so the dashboard
        /// can reload the canonical version.
        /// </summary>
        [HttpPut]
        public async Task<IActionResult> SaveCsv([FromBody] BooksCsvSaveRequest request)
        {
            if (string.IsNullOrWhiteSpace(request?.Csv))
                return BadRequest(new { message = "CSV content is required." });

            try
            {
                var rows = await _booksCsvService.ParseRowsAsync(request.Csv);
                var entities = rows.Select(BooksCsvMapper.FromRow).ToList();

                await using var transaction = await _context.Database.BeginTransactionAsync();
                await _context.TransactionLedgers.ExecuteDeleteAsync();
                _context.TransactionLedgers.AddRange(entities);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var normalized = await _booksCsvService.RowsToCsvAsync(rows);
                return Ok(new { message = $"Books saved to the database ({entities.Count} rows).", csv = normalized });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Failed to save books: {ex.Message}" });
            }
        }

        /// <summary>
        /// Loads every Book row from the database, newest first (covered by
        /// IX_TransactionLedgers_Date), mapped to CSV row shape with no tracking.
        /// </summary>
        private async Task<List<BooksCsvRow>> LoadRowsFromDatabaseAsync()
        {
            var entries = await _context.TransactionLedgers
                .AsNoTracking()
                .OrderByDescending(t => t.Date)
                .ToListAsync();

            return entries.Select(BooksCsvMapper.ToRow).ToList();
        }
    }

    /// <summary>Request body for PUT /api/books-csv.</summary>
    public class BooksCsvSaveRequest
    {
        public string Csv { get; set; } = string.Empty;
    }
}