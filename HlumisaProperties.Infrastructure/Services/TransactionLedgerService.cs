using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Domain;
using HlumisaProperties.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HlumisaProperties.Infrastructure.Services
{
    public class TransactionLedgerService : ITransactionLedgerService
    {
        private readonly ApplicationDbContext _context;

        public TransactionLedgerService(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<TransactionLedger> CreateAsync(TransactionLedger entry)
        {
            if (entry == null)
                throw new ArgumentNullException(nameof(entry));

            entry.CreatedAt = DateTime.UtcNow;
            entry.UpdatedAt = DateTime.UtcNow;

            // Prefer the month provided by the client (the Books UI lets users assign
            // an entry to a specific month slot); otherwise derive it from the Date.
            if (string.IsNullOrWhiteSpace(entry.Month))
                entry.Month = entry.Date.ToString("MMMM").ToUpper();

            _context.Set<TransactionLedger>().Add(entry);
            await _context.SaveChangesAsync();

            return entry;
        }

        public async Task<TransactionLedger> GetByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Transaction Ledger ID must be greater than 0", nameof(id));

            return await _context.Set<TransactionLedger>()
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<IEnumerable<TransactionLedger>> GetAllAsync()
        {
            // Order by primary key (auto-increment Id) so the newest records land
            // at the BOTTOM of the ledger — matching the dashboard's expectation
            // that the latest entry appears last.
            return await _context.Set<TransactionLedger>()
                .AsNoTracking()
                .OrderBy(e => e.Id)
                .ToListAsync();
        }

        public async Task<IEnumerable<TransactionLedger>> GetByMonthAsync(string month)
        {
            if (string.IsNullOrWhiteSpace(month))
                throw new ArgumentException("Month cannot be null or empty", nameof(month));

            // Ascending by Id keeps the newest records at the bottom within each month.
            return await _context.Set<TransactionLedger>()
                .AsNoTracking()
                .Where(e => e.Month == month.Trim().ToUpperInvariant())
                .OrderBy(e => e.Id)
                .ToListAsync();
        }

        public async Task<TransactionLedger> UpdateAsync(TransactionLedger entry)
        {
            if (entry == null)
                throw new ArgumentNullException(nameof(entry));

            if (entry.Id <= 0)
                throw new ArgumentException("Transaction Ledger ID must be greater than 0", nameof(entry.Id));

            var existing = await _context.Set<TransactionLedger>().FindAsync(entry.Id);
            if (existing == null)
                return null;

            // Update all fields
            existing.Date = entry.Date;
            if (string.IsNullOrWhiteSpace(entry.Month))
                existing.Month = entry.Date.ToString("MMMM").ToUpper();
            else
                existing.Month = entry.Month.Trim().ToUpper();
            existing.Buyer = entry.Buyer;
            existing.Seller = entry.Seller;
            existing.OriginalAmount = entry.OriginalAmount;
            existing.DueToSeller = entry.DueToSeller;
            existing.Deposit = entry.Deposit;
            existing.LostDeed = entry.LostDeed;
            existing.Commission = entry.Commission;
            existing.TransferCosts = entry.TransferCosts;
            existing.MasterFees = entry.MasterFees;
            existing.ElecCert = entry.ElecCert;
            existing.WaterAccount = entry.WaterAccount;
            existing.Section118 = entry.Section118;
            existing.Balance = entry.Balance;
            existing.ErfNumber = entry.ErfNumber;
            existing.Area = entry.Area;
            existing.Status = entry.Status;
            existing.CellColors = entry.CellColors;
            existing.UpdatedAt = DateTime.UtcNow;

            _context.Set<TransactionLedger>().Update(existing);
            await _context.SaveChangesAsync();

            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Transaction Ledger ID must be greater than 0", nameof(id));

            var entry = await _context.Set<TransactionLedger>().FindAsync(id);
            if (entry == null)
                return false;

            _context.Set<TransactionLedger>().Remove(entry);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<int> ReplaceAllAsync(IEnumerable<TransactionLedger> entries)
        {
            if (entries == null)
                throw new ArgumentNullException(nameof(entries));

            var list = entries.ToList();

            // The dashboard submits rows as plain JSON without CreatedAt/UpdatedAt,
            // so they deserialize to DateTime.MinValue (0001-01-01). MySQL's
            // datetime(6) column cannot store that value and the insert would throw,
            // surfacing as HTTP 500 on "Save Changes". Stamp the audit fields here.
            var now = DateTime.UtcNow;
            foreach (var entry in list)
            {
                entry.CreatedAt = now;
                entry.UpdatedAt = now;

                // Defensive: the Date column is NOT NULL and Month drives the
                // varchar(20) index. Never let a client-supplied row slip through
                // with a null date or a blank month.
                if (entry.Date == null)
                    entry.Date = now;

                if (string.IsNullOrWhiteSpace(entry.Month))
                    entry.Month = entry.Date.ToString("MMMM").ToUpper();
            }

            // Program.cs registers the DbContext with EnableRetryOnFailure(...), which installs
            // MySqlRetryingExecutionStrategy. That strategy REJECTS user-initiated transactions:
            // BeginTransactionAsync() throws
            //   InvalidOperationException: "The configured execution strategy
            //   'MySqlRetryingExecutionStrategy' does not support user-initiated transactions."
            // so the previous BeginTransactionAsync()-wrapped delete+insert 500'd on EVERY save
            // (the "Fix books save 500" stamping change alone could not help — the strategy
            // exception fires before any row is written).
            //
            // The supported pattern (EF Core "connection resiliency and database retries") is to hand
            // the whole delete+insert unit to the execution strategy via ExecuteInTransactionAsync:
            // it opens the transaction through the strategy itself and, on a transient failure,
            // retries the entire unit. It is also atomic — if the insert fails (e.g. one bad row),
            // the delete is rolled back and the previous rows stay intact instead of leaving the
            // table empty and the dashboard with a 500.
            var executionStrategy = _context.Database.CreateExecutionStrategy();
            return await ExecutionStrategyExtensions.ExecuteInTransactionAsync<int>(
                executionStrategy,
                async (cancellationToken) =>
                {
                    await _context.Set<TransactionLedger>().ExecuteDeleteAsync();
                    _context.Set<TransactionLedger>().AddRange(list);
                    await _context.SaveChangesAsync();
                    return list.Count;
                },
                async (cancellationToken) => true,
                CancellationToken.None);
        }
    }
}
