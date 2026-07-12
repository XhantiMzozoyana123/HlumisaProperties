using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HlumisaProperties.Domain.Entities;

namespace HlumisaProperties.Application.Interfaces
{
    public interface ITransactionLedgerService
    {
        Task<TransactionLedger> CreateAsync(TransactionLedger entry);
        Task<TransactionLedger> GetByIdAsync(int id);
        Task<IEnumerable<TransactionLedger>> GetAllAsync();
        Task<IEnumerable<TransactionLedger>> GetByMonthAsync(string month);
        Task<TransactionLedger> UpdateAsync(TransactionLedger entry);
        Task<bool> DeleteAsync(int id);
    }
}