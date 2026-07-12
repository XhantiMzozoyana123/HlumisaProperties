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
    public class BuyerService : IBuyerService
    {
        private readonly ApplicationDbContext _context;

        public BuyerService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Buyer> CreateBuyerAsync(Buyer buyer)
        {
            buyer.CreatedAt = DateTime.UtcNow;
            buyer.UpdatedAt = DateTime.UtcNow;
            buyer.IsContacted = false;
            buyer.IsDiscarded = false;

            _context.Buyers.Add(buyer);
            await _context.SaveChangesAsync();
            return buyer;
        }

        public async Task<Buyer> GetBuyerByIdAsync(int id)
        {
            return await _context.Buyers
                .AsNoTracking()
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<IEnumerable<Buyer>> GetAllBuyersAsync()
        {
            return await _context.Buyers
                .AsNoTracking()
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Buyer>> GetActiveBuyersAsync()
        {
            return await _context.Buyers
                .AsNoTracking()
                .Where(b => !b.IsDiscarded)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Buyer>> GetDiscardedBuyersAsync()
        {
            return await _context.Buyers
                .AsNoTracking()
                .Where(b => b.IsDiscarded)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> UpdateBuyerAsync(Buyer buyer)
        {
            var existing = await _context.Buyers.FindAsync(buyer.Id);
            if (existing == null) return false;

            existing.FirstName = buyer.FirstName;
            existing.LastName = buyer.LastName;
            existing.PhoneNumber = buyer.PhoneNumber;
            existing.Location = buyer.Location;
            existing.Budget = buyer.Budget;
            existing.PropertyType = buyer.PropertyType;
            existing.IsContacted = buyer.IsContacted;
            existing.IsDiscarded = buyer.IsDiscarded;
            existing.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteBuyerAsync(int id)
        {
            var buyer = await _context.Buyers.FindAsync(id);
            if (buyer == null) return false;

            _context.Buyers.Remove(buyer);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> MarkBuyerAsContactedAsync(int buyerId)
        {
            var buyer = await _context.Buyers.FindAsync(buyerId);
            if (buyer == null) return false;

            buyer.IsContacted = true;
            buyer.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ToggleDiscardBuyerAsync(int buyerId)
        {
            var buyer = await _context.Buyers.FindAsync(buyerId);
            if (buyer == null) return false;

            buyer.IsDiscarded = !buyer.IsDiscarded;
            buyer.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}