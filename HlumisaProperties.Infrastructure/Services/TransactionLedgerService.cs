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

            // Auto-set the Month field based on the Date
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
            return await _context.Set<TransactionLedger>()
                .AsNoTracking()
                .OrderByDescending(e => e.Date)
                .ToListAsync();
        }

        public async Task<IEnumerable<TransactionLedger>> GetByMonthAsync(string month)
        {
            if (string.IsNullOrWhiteSpace(month))
                throw new ArgumentException("Month cannot be null or empty", nameof(month));

            return await _context.Set<TransactionLedger>()
                .AsNoTracking()
                .Where(e => e.Month.ToUpper() == month.ToUpper())
                .OrderByDescending(e => e.Date)
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
            existing.Month = entry.Date.ToString("MMMM").ToUpper();
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
    }
}