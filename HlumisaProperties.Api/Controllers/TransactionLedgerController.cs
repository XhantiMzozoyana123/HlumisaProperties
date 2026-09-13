using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration;
using CsvHelper.Configuration.Attributes;
using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HlumisaProperties.Api.Controllers
{
    /// <summary>
    /// Internal CSV row shape for Books import/export (no separate DTO file kept around).
    /// Column headers match what the dashboard writes.
    /// </summary>
    internal sealed class CsvRowDto
    {
        [Name("Date")] public string Date { get; set; } = string.Empty;
        [Name("Month")] public string Month { get; set; } = string.Empty;
        [Name("Buyer")] public string Buyer { get; set; } = string.Empty;
        [Name("Seller")] public string Seller { get; set; } = string.Empty;
        [Name("Original Amount")] public string OriginalAmount { get; set; } = string.Empty;
        [Name("Due to Seller")] public string DueToSeller { get; set; } = string.Empty;
        [Name("Deposit")] public string Deposit { get; set; } = string.Empty;
        [Name("Lost Deed")] public string LostDeed { get; set; } = string.Empty;
        [Name("Commission")] public string Commission { get; set; } = string.Empty;
        [Name("Transfer Costs")] public string TransferCosts { get; set; } = string.Empty;
        [Name("Master Fees")] public string MasterFees { get; set; } = string.Empty;
        [Name("Elec Cert")] public string ElecCert { get; set; } = string.Empty;
        [Name("Water Account")] public string WaterAccount { get; set; } = string.Empty;
        [Name("Section 118")] public string Section118 { get; set; } = string.Empty;
        [Name("Outstanding Balance")] public string Balance { get; set; } = string.Empty;
        [Name("ERF")] public string ErfNumber { get; set; } = string.Empty;
        [Name("Area")] public string Area { get; set; } = string.Empty;
        [Name("Status")] public string Status { get; set; } = string.Empty;
        [Name("Cell Colors")] public string CellColors { get; set; } = string.Empty;
        }

    /// <summary>
    /// Manages the transaction ledger — records all property deals handled by Hlumisa Properties.
    /// Each row represents a single deal between a buyer and a seller.
    ///
    /// Entity: TransactionLedger (inherits BaseEntity)
    /// Columns:
    ///   - Id (int)              : Primary key (from BaseEntity).
    ///   - UserId (string)       : Owning application user id (from BaseEntity).
    ///   - CreatedAt (DateTime)  : Record creation timestamp (from BaseEntity).
    ///   - UpdatedAt (DateTime)  : Last modification timestamp (from BaseEntity).
    ///   - Date (DateTime)       : The date the entry was created.
    ///   - Month (string)        : Read-only month derived from Date (e.g. JANUARY). Used for filtering.
    ///   - Buyer (string)        : Name of the buyer.
    ///   - Seller (string)       : Name of the seller.
    ///   - OriginalAmount (decimal) : Reference field — does NOT affect calculations.
    ///   - DueToSeller (decimal)  : Money passed on to the seller.
    ///   - Deposit (decimal)     : Deposit paid by the buyer.
    ///   - LostDeed (decimal)    : Costs for lost/missing title deeds.
    ///   - Commission (decimal)  : Commission Hlumisa Properties earns.
    ///   - TransferCosts (decimal) : Legal/admin costs for property transfer.
    ///   - MasterFees (decimal)  : Fees paid to Master of the High Court.
    ///   - ElecCert (decimal)    : Electrical certificate costs.
    ///   - WaterAccount (decimal) : Outstanding water account amounts.
    ///   - Section118 (decimal)  : Section 118 clearance amount.
    ///   - Balance (decimal)     : Remaining amount after deductions. Manually editable.
    ///   - ErfNumber (string)    : Property ERF (stand) number.
    ///   - Area (string)         : Suburb/area where the property is located.
    ///   - Status (string)       : Row status — Pending, Declined, or Done.
    ///   - CellColors (string)   : JSON string storing per-cell color assignments.
    ///
    /// Responsibility: exposes CRUD plus month-filter queries for the transaction ledger
    /// via <see cref="ITransactionLedgerService"/>. The dashboard Books page uses the
    /// JSON list + bulk-replace + CSV-file-import endpoints here (no CSV data over the wire).
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/transaction-ledger")]
    public class TransactionLedgerController : ControllerBase
    {
        private static readonly CultureInfo CsvCulture = CultureInfo.InvariantCulture;

        private readonly ITransactionLedgerService _transactionLedgerService;

        public TransactionLedgerController(ITransactionLedgerService transactionLedgerService)
        {
            _transactionLedgerService = transactionLedgerService;
        }

        // ====== CREATE ======

        /// <summary>
        /// Creates a new transaction ledger entry and returns it with a 201 Created location.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TransactionLedger entry)
        {
            if (entry == null)
                return BadRequest("Transaction ledger payload is required.");

            var created = await _transactionLedgerService.CreateAsync(entry);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // ====== READ ======

        /// <summary>
        /// Retrieves a single transaction ledger entry by its primary key (Id). Returns 404 if not found.
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var entry = await _transactionLedgerService.GetByIdAsync(id);
            if (entry == null)
                return NotFound();

            return Ok(entry);
        }

        /// <summary>
        /// Retrieves every transaction ledger entry in the system.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var entries = await _transactionLedgerService.GetAllAsync();
            return Ok(entries);
        }

        /// <summary>
        /// Retrieves transaction ledger entries filtered by month (e.g. JANUARY, FEBRUARY).
        /// </summary>
        [HttpGet("by-month/{month}")]
        public async Task<IActionResult> GetByMonth(string month)
        {
            var entries = await _transactionLedgerService.GetByMonthAsync(month);
            return Ok(entries);
        }

        /// <summary>
        /// Retrieves all available months (distinct) from the transaction ledger.
        /// </summary>
        [HttpGet("months")]
        public async Task<IActionResult> GetMonths()
        {
            var entries = await _transactionLedgerService.GetAllAsync();
            var months = entries
                .Select(e => e.Month)
                .Distinct()
                .OrderBy(m => Array.IndexOf(
                    new[] { "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
                            "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER" }, m))
                .ToList();

            return Ok(months);
        }

        // ====== UPDATE ======

        /// <summary>
        /// Updates an existing transaction ledger entry. The route Id is applied to the body before saving.
        /// Returns 404 if the entry does not exist.
        /// </summary>
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] TransactionLedger entry)
        {
            if (entry == null)
                return BadRequest("Transaction ledger payload is required.");

            entry.Id = id;
            var updated = await _transactionLedgerService.UpdateAsync(entry);
            if (updated == null)
                return NotFound();

            return Ok(updated);
        }

        // ====== DELETE ======

        /// <summary>
        /// Deletes a transaction ledger entry by its primary key (Id). Returns 404 if not found.
        /// </summary>
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _transactionLedgerService.DeleteAsync(id);
            if (!success)
                return NotFound();

            return NoContent();
        }

        // ====== BULK + IMPORT (used by the dashboard Books page) ======

        /// <summary>
        /// Replaces the entire Books table with the supplied entries (JSON body).
        /// Rows with Id &gt; 0 keep their identity; rows with Id 0 are inserted new.
        /// The dashboard "Save Changes" button posts the full edited table here.
        /// </summary>
        [HttpPut("bulk")]
        public async Task<IActionResult> BulkReplace([FromBody] List<TransactionLedger> entries)
        {
            if (entries == null)
                return BadRequest(new { message = "Transaction ledger payload is required." });

            var count = await _transactionLedgerService.ReplaceAllAsync(entries);
            return Ok(new { count, message = $"Books table now contains {count} rows." });
        }

        /// <summary>
        /// Imports a CSV file (the same column format the dashboard exports) and
        /// REPLACES the entire Books table with its rows. Parsed server-side with
        /// CsvHelper — no CSV travels to or from the dashboard as data.
        /// </summary>
        [HttpPost("import-csv")]
        public async Task<IActionResult> ImportCsv(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Attach a CSV file to import." });

            try
            {
                using var reader = new StreamReader(file.OpenReadStream());
                var csvText = await reader.ReadToEndAsync();

                var rows = ParseCsv(csvText);
                var entities = rows.Select(FromRow).ToList();
                var count = await _transactionLedgerService.ReplaceAllAsync(entities);

                return Ok(new { imported = count, message = $"Imported {count} rows from {file.FileName} into the database." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Failed to import CSV: {ex.Message}" });
            }
        }

        /// <summary>
        /// Parses CSV text into CsvRowDto records using CsvHelper (in-memory, no file I/O).
        /// Column headers are matched case-insensitively via the [Name] attributes.
        /// </summary>
        private static List<CsvRowDto> ParseCsv(string csvText)
        {
            var config = new CsvConfiguration(CsvCulture)
            {
                Delimiter = ",",
                HasHeaderRecord = true,
                MissingFieldFound = null,
                HeaderValidated = null,
                BadDataFound = null,
            };

            using var reader = new StringReader(csvText);
            using var csv = new CsvReader(reader, config);

            if (!csv.Read() || !csv.ReadHeader())
                return new List<CsvRowDto>();

            var rows = new List<CsvRowDto>();
            while (csv.Read())
            {
                rows.Add(csv.GetRecord<CsvRowDto>());
            }
            return rows;
        }

        /// <summary>
        /// Maps a parsed CsvRowDto onto a new TransactionLedger entity (Id = 0 so EF inserts it).
        /// Months are normalized to UPPERCASE to keep the IX_TransactionLedgers_Month_Date index lookups consistent.
        /// </summary>
        private static TransactionLedger FromRow(CsvRowDto row)
        {
            var date = ParseDate(row.Date);
            var month = string.IsNullOrWhiteSpace(row.Month)
                ? date.ToString("MMMM").ToUpperInvariant()
                : row.Month.Trim().ToUpperInvariant();

            return new TransactionLedger
            {
                Date = date,
                Month = month,
                Buyer = row.Buyer ?? string.Empty,
                Seller = row.Seller ?? string.Empty,
                OriginalAmount = ParseDecimal(row.OriginalAmount),
                DueToSeller = ParseDecimal(row.DueToSeller),
                Deposit = ParseDecimal(row.Deposit),
                LostDeed = ParseDecimal(row.LostDeed),
                Commission = ParseDecimal(row.Commission),
                TransferCosts = ParseDecimal(row.TransferCosts),
                MasterFees = ParseDecimal(row.MasterFees),
                ElecCert = ParseDecimal(row.ElecCert),
                WaterAccount = ParseDecimal(row.WaterAccount),
                Section118 = ParseDecimal(row.Section118),
                Balance = ParseDecimal(row.Balance),
                ErfNumber = row.ErfNumber ?? string.Empty,
                Area = row.Area ?? string.Empty,
                Status = string.IsNullOrWhiteSpace(row.Status) ? "white" : row.Status.Trim(),
                CellColors = string.IsNullOrWhiteSpace(row.CellColors) ? "{}" : row.CellColors,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };
        }

        private static decimal ParseDecimal(string val) =>
            decimal.TryParse(val, NumberStyles.Number, CsvCulture, out var result) ? result : 0m;

                        private static DateTime ParseDate(string value)
        {
            var formats = new[] { "yyyy-MM-dd", "yyyy/MM/dd", "dd/MM/yyyy", "MM/dd/yyyy" };
            if (DateTime.TryParseExact(value, formats, CsvCulture, DateTimeStyles.None, out var parsed))
                return DateTime.SpecifyKind(parsed, DateTimeKind.Utc);

            if (DateTime.TryParse(value, CsvCulture, DateTimeStyles.None, out parsed))
                return DateTime.SpecifyKind(parsed, DateTimeKind.Utc);

            return DateTime.UtcNow.Date;
        }
    }
}