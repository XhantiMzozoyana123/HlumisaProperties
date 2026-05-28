using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Domain;
using HlumisaProperties.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Text;

namespace HlumisaProperties.Infrastructure.Services
{
    public class AgentBankAccountService : IAgentBankAccountService
    {
        private readonly ApplicationDbContext _context;

        public AgentBankAccountService(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        // ====== CREATE OPERATIONS ======
        public async Task<AgentBankAccount> CreateBankAccountAsync(AgentBankAccount bankAccount)
        {
            if (bankAccount == null)
                throw new ArgumentNullException(nameof(bankAccount));

            if (bankAccount.AgentId <= 0)
                throw new ArgumentException("Agent ID must be greater than 0", nameof(bankAccount.AgentId));

            if (string.IsNullOrWhiteSpace(bankAccount.AccountNumber))
                throw new ArgumentException("Account number cannot be null or empty", nameof(bankAccount.AccountNumber));

            // Check if account number already exists
            if (await BankAccountExistsByNumberAsync(bankAccount.AccountNumber))
                throw new InvalidOperationException($"Account number '{bankAccount.AccountNumber}' already exists");

            bankAccount.CreatedAt = DateTime.UtcNow;
            bankAccount.UpdatedAt = DateTime.UtcNow;

            _context.AgentBankAccounts.Add(bankAccount);
            await _context.SaveChangesAsync();

            return bankAccount;
        }

        public async Task<IEnumerable<AgentBankAccount>> CreateBankAccountsAsync(IEnumerable<AgentBankAccount> bankAccounts)
        {
            if (bankAccounts == null || !bankAccounts.Any())
                throw new ArgumentException("Bank accounts collection cannot be null or empty", nameof(bankAccounts));

            var accountsList = bankAccounts.ToList();

            foreach (var account in accountsList)
            {
                if (account.AgentId <= 0)
                    throw new ArgumentException("All agent IDs must be greater than 0", nameof(account.AgentId));

                if (string.IsNullOrWhiteSpace(account.AccountNumber))
                    throw new ArgumentException("All account numbers must be provided", nameof(account.AccountNumber));

                if (await BankAccountExistsByNumberAsync(account.AccountNumber))
                    throw new InvalidOperationException($"Account number '{account.AccountNumber}' already exists");

                account.CreatedAt = DateTime.UtcNow;
                account.UpdatedAt = DateTime.UtcNow;
            }

            _context.AgentBankAccounts.AddRange(accountsList);
            await _context.SaveChangesAsync();

            return accountsList;
        }

        // ====== READ OPERATIONS ======
        public async Task<AgentBankAccount> GetBankAccountByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Bank account ID must be greater than 0", nameof(id));

            return await _context.AgentBankAccounts
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<AgentBankAccount> GetBankAccountByNumberAsync(string accountNumber)
        {
            if (string.IsNullOrWhiteSpace(accountNumber))
                throw new ArgumentException("Account number cannot be null or empty", nameof(accountNumber));

            return await _context.AgentBankAccounts
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.AccountNumber == accountNumber);
        }

        public async Task<IEnumerable<AgentBankAccount>> GetAllBankAccountsAsync()
        {
            return await _context.AgentBankAccounts
                .AsNoTracking()
                .OrderBy(a => a.BankName)
                .ThenBy(a => a.AccountNumber)
                .ToListAsync();
        }

        public async Task<IEnumerable<AgentBankAccount>> GetBankAccountsByAgentIdAsync(int agentId)
        {
            if (agentId <= 0)
                throw new ArgumentException("Agent ID must be greater than 0", nameof(agentId));

            return await _context.AgentBankAccounts
                .AsNoTracking()
                .Where(a => a.AgentId == agentId)
                .OrderBy(a => a.BankName)
                .ToListAsync();
        }

        public async Task<IEnumerable<AgentBankAccount>> GetBankAccountsByBankNameAsync(string bankName)
        {
            if (string.IsNullOrWhiteSpace(bankName))
                throw new ArgumentException("Bank name cannot be null or empty", nameof(bankName));

            return await _context.AgentBankAccounts
                .AsNoTracking()
                .Where(a => a.BankName.ToLower().Contains(bankName.ToLower()))
                .OrderBy(a => a.BankName)
                .ToListAsync();
        }

        public async Task<AgentBankAccount> GetPrimaryBankAccountAsync(int agentId)
        {
            if (agentId <= 0)
                throw new ArgumentException("Agent ID must be greater than 0", nameof(agentId));

            return await _context.AgentBankAccounts
                .AsNoTracking()
                .Where(a => a.AgentId == agentId)
                .OrderBy(a => a.Id)
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<AgentBankAccount>> GetBankAccountsByFilterAsync(Expression<Func<AgentBankAccount, bool>> predicate)
        {
            if (predicate == null)
                throw new ArgumentNullException(nameof(predicate));

            return await _context.AgentBankAccounts
                .AsNoTracking()
                .Where(predicate)
                .ToListAsync();
        }

        public async Task<IEnumerable<AgentBankAccount>> GetBankAccountsPaginatedAsync(int pageNumber, int pageSize)
        {
            if (pageNumber < 1)
                throw new ArgumentException("Page number must be greater than 0", nameof(pageNumber));
            if (pageSize < 1)
                throw new ArgumentException("Page size must be greater than 0", nameof(pageSize));

            return await _context.AgentBankAccounts
                .AsNoTracking()
                .OrderBy(a => a.BankName)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<IEnumerable<AgentBankAccount>> GetAgentBankAccountsPaginatedAsync(int agentId, int pageNumber, int pageSize)
        {
            if (agentId <= 0)
                throw new ArgumentException("Agent ID must be greater than 0", nameof(agentId));
            if (pageNumber < 1)
                throw new ArgumentException("Page number must be greater than 0", nameof(pageNumber));
            if (pageSize < 1)
                throw new ArgumentException("Page size must be greater than 0", nameof(pageSize));

            return await _context.AgentBankAccounts
                .AsNoTracking()
                .Where(a => a.AgentId == agentId)
                .OrderBy(a => a.BankName)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetBankAccountCountAsync()
        {
            return await _context.AgentBankAccounts.CountAsync();
        }

        public async Task<int> GetAgentBankAccountCountAsync(int agentId)
        {
            if (agentId <= 0)
                throw new ArgumentException("Agent ID must be greater than 0", nameof(agentId));

            return await _context.AgentBankAccounts
                .CountAsync(a => a.AgentId == agentId);
        }

        // ====== UPDATE OPERATIONS ======
        public async Task<AgentBankAccount> UpdateBankAccountAsync(int id, AgentBankAccount bankAccount)
        {
            if (id <= 0)
                throw new ArgumentException("Bank account ID must be greater than 0", nameof(id));
            if (bankAccount == null)
                throw new ArgumentNullException(nameof(bankAccount));

            var existingAccount = await _context.AgentBankAccounts.FindAsync(id);
            if (existingAccount == null)
                return null;

            // Check if account number is being changed and if new one is unique
            if (existingAccount.AccountNumber != bankAccount.AccountNumber)
            {
                if (await BankAccountExistsByNumberAsync(bankAccount.AccountNumber))
                    throw new InvalidOperationException($"Account number '{bankAccount.AccountNumber}' already exists");
            }

            existingAccount.BankName = bankAccount.BankName;
            existingAccount.AccountNumber = bankAccount.AccountNumber;
            existingAccount.AccountHolderName = bankAccount.AccountHolderName;
            existingAccount.BranchCode = bankAccount.BranchCode;
            existingAccount.UpdatedAt = DateTime.UtcNow;

            _context.AgentBankAccounts.Update(existingAccount);
            await _context.SaveChangesAsync();

            return existingAccount;
        }

        public async Task<AgentBankAccount> UpdateBankAccountDetailsAsync(int id, string bankName, string accountHolderName, string branchCode)
        {
            if (id <= 0)
                throw new ArgumentException("Bank account ID must be greater than 0", nameof(id));

            var account = await _context.AgentBankAccounts.FindAsync(id);
            if (account == null)
                return null;

            if (!string.IsNullOrWhiteSpace(bankName))
                account.BankName = bankName;

            if (!string.IsNullOrWhiteSpace(accountHolderName))
                account.AccountHolderName = accountHolderName;

            if (!string.IsNullOrWhiteSpace(branchCode))
                account.BranchCode = branchCode;

            account.UpdatedAt = DateTime.UtcNow;

            _context.AgentBankAccounts.Update(account);
            await _context.SaveChangesAsync();

            return account;
        }

        // ====== DELETE OPERATIONS ======
        public async Task<bool> DeleteBankAccountAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Bank account ID must be greater than 0", nameof(id));

            var bankAccount = await _context.AgentBankAccounts.FindAsync(id);
            if (bankAccount == null)
                return false;

            _context.AgentBankAccounts.Remove(bankAccount);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteBankAccountByNumberAsync(string accountNumber)
        {
            if (string.IsNullOrWhiteSpace(accountNumber))
                throw new ArgumentException("Account number cannot be null or empty", nameof(accountNumber));

            var bankAccount = await _context.AgentBankAccounts
                .FirstOrDefaultAsync(a => a.AccountNumber == accountNumber);

            if (bankAccount == null)
                return false;

            _context.AgentBankAccounts.Remove(bankAccount);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<int> DeleteAgentBankAccountsAsync(int agentId)
        {
            if (agentId <= 0)
                throw new ArgumentException("Agent ID must be greater than 0", nameof(agentId));

            var bankAccounts = await _context.AgentBankAccounts
                .Where(a => a.AgentId == agentId)
                .ToListAsync();

            if (bankAccounts.Count == 0)
                return 0;

            _context.AgentBankAccounts.RemoveRange(bankAccounts);
            await _context.SaveChangesAsync();

            return bankAccounts.Count;
        }

        public async Task<int> DeleteBankAccountsAsync(IEnumerable<int> ids)
        {
            if (ids == null || !ids.Any())
                throw new ArgumentException("IDs collection cannot be null or empty", nameof(ids));

            var bankAccounts = await _context.AgentBankAccounts
                .Where(a => ids.Contains(a.Id))
                .ToListAsync();

            if (bankAccounts.Count == 0)
                return 0;

            _context.AgentBankAccounts.RemoveRange(bankAccounts);
            await _context.SaveChangesAsync();

            return bankAccounts.Count;
        }

        // ====== VALIDATION OPERATIONS ======
        public async Task<bool> BankAccountExistsByNumberAsync(string accountNumber)
        {
            if (string.IsNullOrWhiteSpace(accountNumber))
                throw new ArgumentException("Account number cannot be null or empty", nameof(accountNumber));

            return await _context.AgentBankAccounts
                .AnyAsync(a => a.AccountNumber == accountNumber);
        }

        public async Task<bool> BankAccountExistsByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Bank account ID must be greater than 0", nameof(id));

            return await _context.AgentBankAccounts
                .AnyAsync(a => a.Id == id);
        }

        public async Task<bool> AgentHasBankAccountsAsync(int agentId)
        {
            if (agentId <= 0)
                throw new ArgumentException("Agent ID must be greater than 0", nameof(agentId));

            return await _context.AgentBankAccounts
                .AnyAsync(a => a.AgentId == agentId);
        }

        public async Task<bool> IsAccountNumberUniqueAsync(string accountNumber, int? excludeId = null)
        {
            if (string.IsNullOrWhiteSpace(accountNumber))
                throw new ArgumentException("Account number cannot be null or empty", nameof(accountNumber));

            var query = _context.AgentBankAccounts
                .Where(a => a.AccountNumber == accountNumber);

            if (excludeId.HasValue && excludeId > 0)
                query = query.Where(a => a.Id != excludeId);

            return !await query.AnyAsync();
        }

        // ====== RELATED DATA OPERATIONS ======
        public async Task<AgentBankAccount> GetBankAccountWithAgentAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Bank account ID must be greater than 0", nameof(id));

            return await _context.AgentBankAccounts
                .AsNoTracking()
                .Include(a => a.Agent)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<IEnumerable<AgentBankAccount>> GetAgentBankAccountsWithAgentAsync(int agentId)
        {
            if (agentId <= 0)
                throw new ArgumentException("Agent ID must be greater than 0", nameof(agentId));

            return await _context.AgentBankAccounts
                .AsNoTracking()
                .Include(a => a.Agent)
                .Where(a => a.AgentId == agentId)
                .OrderBy(a => a.BankName)
                .ToListAsync();
        }
    }
}
