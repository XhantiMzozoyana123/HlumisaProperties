using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using HlumisaProperties.Domain.Entities;

namespace HlumisaProperties.Application.Interfaces
{
    public interface IBuyerService
    {
        Task<Buyer> CreateBuyerAsync(Buyer buyer);
        Task<Buyer> GetBuyerByIdAsync(int id);
        Task<IEnumerable<Buyer>> GetAllBuyersAsync();
        Task<IEnumerable<Buyer>> GetActiveBuyersAsync();
        Task<IEnumerable<Buyer>> GetDiscardedBuyersAsync();
        Task<bool> UpdateBuyerAsync(Buyer buyer);
        Task<bool> DeleteBuyerAsync(int id);
        Task<bool> MarkBuyerAsContactedAsync(int buyerId);
        Task<bool> ToggleDiscardBuyerAsync(int buyerId);
    }
}