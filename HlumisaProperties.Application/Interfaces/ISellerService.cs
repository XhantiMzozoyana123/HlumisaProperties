using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using HlumisaProperties.Domain.Entities;

namespace HlumisaProperties.Application.Interfaces
{
    public interface ISellerService
    {
        Task<Seller> CreateSellerAsync(Seller seller);
        Task<Seller> GetSellerByIdAsync(int id);
        Task<IEnumerable<Seller>> GetAllSellersAsync();
        Task<IEnumerable<Seller>> GetActiveSellersAsync();
        Task<IEnumerable<Seller>> GetDiscardedSellersAsync();
        Task<bool> UpdateSellerAsync(Seller seller);
        Task<bool> DeleteSellerAsync(int id);
        Task<bool> MarkSellerAsContactedAsync(int sellerId);
        Task<bool> ToggleDiscardSellerAsync(int sellerId);
        Task<bool> CycleSellerStatusColorAsync(int sellerId);
    }
}