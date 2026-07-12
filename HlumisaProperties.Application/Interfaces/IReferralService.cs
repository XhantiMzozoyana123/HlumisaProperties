using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HlumisaProperties.Domain.Entities;

namespace HlumisaProperties.Application.Interfaces
{
    public interface IReferralService
    {
        Task<Referral> CreateAsync(Referral referral);
        Task<Referral> GetByIdAsync(int id);
        Task<IEnumerable<Referral>> GetAllAsync();
        Task<IEnumerable<Referral>> GetActiveAsync();
        Task<Referral> UpdateAsync(Referral referral);
        Task<bool> DeleteAsync(int id);
        Task<Referral> ToggleDiscardedAsync(int id);
    }
}