using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Domain;
using HlumisaProperties.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HlumisaProperties.Infrastructure.Services
{
    public class ReferralService : IReferralService
    {
        private readonly ApplicationDbContext _context;

        public ReferralService(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<Referral> CreateAsync(Referral referral)
        {
            if (referral == null)
                throw new ArgumentNullException(nameof(referral));

            referral.CreatedAt = DateTime.UtcNow;
            referral.UpdatedAt = DateTime.UtcNow;

            _context.Set<Referral>().Add(referral);
            await _context.SaveChangesAsync();

            return referral;
        }

        public async Task<bool> ExistsAsync(string referrerName, string referrerPhone)
        {
            if (string.IsNullOrWhiteSpace(referrerName) || string.IsNullOrWhiteSpace(referrerPhone))
                return false;

            var normalizedName = referrerName.Trim().ToLowerInvariant();
            var normalizedPhone = referrerPhone.Trim();

            return await _context.Set<Referral>()
                .AsNoTracking()
                .AnyAsync(e =>
                    e.ReferrerName.Trim().ToLower() == normalizedName &&
                    e.ReferrerPhone.Trim() == normalizedPhone);
        }

        public async Task<Referral> GetByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Referral ID must be greater than 0", nameof(id));

            return await _context.Set<Referral>()
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<IEnumerable<Referral>> GetAllAsync()
        {
            return await _context.Set<Referral>()
                .AsNoTracking()
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Referral>> GetActiveAsync()
        {
            return await _context.Set<Referral>()
                .AsNoTracking()
                .Where(e => !e.IsDiscarded)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();
        }

        public async Task<Referral> UpdateAsync(Referral referral)
        {
            if (referral == null)
                throw new ArgumentNullException(nameof(referral));

            if (referral.Id <= 0)
                throw new ArgumentException("Referral ID must be greater than 0", nameof(referral.Id));

            var existing = await _context.Set<Referral>().FindAsync(referral.Id);
            if (existing == null)
                return null;

            existing.ReferrerName = referral.ReferrerName;
            existing.ReferrerPhone = referral.ReferrerPhone;
            existing.ReferrerAddress = referral.ReferrerAddress;
            existing.ReferredName = referral.ReferredName;
            existing.ReferredPhone = referral.ReferredPhone;
            existing.ReferredAddress = referral.ReferredAddress;
            existing.Intent = referral.Intent;
            existing.Note = referral.Note;
            existing.Date = referral.Date;
            existing.IsDiscarded = referral.IsDiscarded;
            existing.UpdatedAt = DateTime.UtcNow;

            _context.Set<Referral>().Update(existing);
            await _context.SaveChangesAsync();

            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Referral ID must be greater than 0", nameof(id));

            var referral = await _context.Set<Referral>().FindAsync(id);
            if (referral == null)
                return false;

            _context.Set<Referral>().Remove(referral);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<Referral> ToggleDiscardedAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Referral ID must be greater than 0", nameof(id));

            var existing = await _context.Set<Referral>().FindAsync(id);
            if (existing == null)
                return null;

            existing.IsDiscarded = !existing.IsDiscarded;
            existing.UpdatedAt = DateTime.UtcNow;

            _context.Set<Referral>().Update(existing);
            await _context.SaveChangesAsync();

            return existing;
        }
    }
}