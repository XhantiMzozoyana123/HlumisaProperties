using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Domain;
using HlumisaProperties.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HlumisaProperties.Infrastructure.Services
{
    public class SellerService : ISellerService
    {
        private readonly ApplicationDbContext _context;

        public SellerService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Seller> CreateSellerAsync(Seller seller)
        {
            seller.CreatedAt = DateTime.UtcNow;
            seller.UpdatedAt = DateTime.UtcNow;
            seller.IsContacted = false;
            seller.IsDiscarded = false;
            seller.StatusColor = "white";

            _context.Sellers.Add(seller);
            await _context.SaveChangesAsync();
            return seller;
        }

        public async Task<Seller> GetSellerByIdAsync(int id)
        {
            return await _context.Sellers
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<IEnumerable<Seller>> GetAllSellersAsync()
        {
            return await _context.Sellers
                .AsNoTracking()
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Seller>> GetActiveSellersAsync()
        {
            return await _context.Sellers
                .AsNoTracking()
                .Where(s => !s.IsDiscarded)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Seller>> GetDiscardedSellersAsync()
        {
            return await _context.Sellers
                .AsNoTracking()
                .Where(s => s.IsDiscarded)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> UpdateSellerAsync(Seller seller)
        {
            var existing = await _context.Sellers.FindAsync(seller.Id);
            if (existing == null) return false;

            existing.FirstName = seller.FirstName;
            existing.LastName = seller.LastName;
            existing.PhoneNumber = seller.PhoneNumber;
            existing.Location = seller.Location;
            existing.PropertyType = seller.PropertyType;
            existing.EstimatedValue = seller.EstimatedValue;
            existing.IsContacted = seller.IsContacted;
            existing.IsDiscarded = seller.IsDiscarded;
            existing.StatusColor = seller.StatusColor;
            existing.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteSellerAsync(int id)
        {
            var seller = await _context.Sellers.FindAsync(id);
            if (seller == null) return false;

            _context.Sellers.Remove(seller);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> MarkSellerAsContactedAsync(int sellerId)
        {
            var seller = await _context.Sellers.FindAsync(sellerId);
            if (seller == null) return false;

            seller.IsContacted = true;
            seller.StatusColor = "green";
            seller.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ToggleDiscardSellerAsync(int sellerId)
        {
            var seller = await _context.Sellers.FindAsync(sellerId);
            if (seller == null) return false;

            seller.IsDiscarded = !seller.IsDiscarded;
            seller.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CycleSellerStatusColorAsync(int sellerId)
        {
            var seller = await _context.Sellers.FindAsync(sellerId);
            if (seller == null) return false;

            var next = seller.StatusColor switch
            {
                "white" => "red",
                "red" => "green",
                "green" => "white",
                _ => "white"
            };

            seller.StatusColor = next;
            seller.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}