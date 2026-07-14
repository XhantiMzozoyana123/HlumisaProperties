using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HlumisaProperties.Api.Controllers
{
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
    /// via <see cref="ITransactionLedgerService"/>.
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/transaction-ledger")]
    public class TransactionLedgerController : ControllerBase
    {
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
    }
}