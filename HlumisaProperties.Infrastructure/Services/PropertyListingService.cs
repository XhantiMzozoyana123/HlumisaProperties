using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Domain;
using HlumisaProperties.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace HlumisaProperties.Infrastructure.Services
{
    public class PropertyListingService : IPropertyListingService
    {
        private readonly ApplicationDbContext _context;

        public PropertyListingService(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        // ====== CREATE OPERATIONS ======
        public async Task<PropertyListing> CreatePropertyListingAsync(PropertyListing propertyListing)
        {
            if (propertyListing == null)
                throw new ArgumentNullException(nameof(propertyListing));

            propertyListing.CreatedAt = DateTime.UtcNow;
            propertyListing.UpdatedAt = DateTime.UtcNow;

            _context.PropertyListings.Add(propertyListing);
            await _context.SaveChangesAsync();

            return propertyListing;
        }

        // ====== READ OPERATIONS ======
        public async Task<PropertyListing> GetPropertyListingByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("PropertyListing ID must be greater than 0", nameof(id));

            return await _context.PropertyListings
                .AsNoTracking()
                .Include(p => p.Agent)
                .Include(p => p.Lead)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<IEnumerable<PropertyListing>> GetAllPropertyListingsAsync()
        {
            return await _context.PropertyListings
                .AsNoTracking()
                .Include(p => p.Agent)
                .Include(p => p.Lead)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<PropertyListing>> GetAvailablePropertyListingsAsync()
        {
            return await _context.PropertyListings
                .AsNoTracking()
                .Include(p => p.Agent)
                .Include(p => p.Lead)
                .Where(p => p.IsAvailable)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<PropertyListing>> GetPropertyListingsByAgentIdAsync(int agentId)
        {
            if (agentId <= 0)
                throw new ArgumentException("Agent ID must be greater than 0", nameof(agentId));

            return await _context.PropertyListings
                .AsNoTracking()
                .Include(p => p.Agent)
                .Include(p => p.Lead)
                .Where(p => p.AgentId == agentId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<PropertyListing>> GetPropertyListingsByLeadIdAsync(int leadId)
        {
            if (leadId <= 0)
                throw new ArgumentException("Lead ID must be greater than 0", nameof(leadId));

            return await _context.PropertyListings
                .AsNoTracking()
                .Include(p => p.Agent)
                .Include(p => p.Lead)
                .Where(p => p.LeadId == leadId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<PropertyListing>> GetPropertyListingsByTypeAsync(string propertyType)
        {
            if (string.IsNullOrWhiteSpace(propertyType))
                throw new ArgumentException("PropertyType cannot be null or empty", nameof(propertyType));

            return await _context.PropertyListings
                .AsNoTracking()
                .Include(p => p.Agent)
                .Include(p => p.Lead)
                .Where(p => p.PropertyType.ToLower() == propertyType.ToLower())
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<PropertyListing>> GetPropertyListingsByListingTypeAsync(string listingType)
        {
            if (string.IsNullOrWhiteSpace(listingType))
                throw new ArgumentException("ListingType cannot be null or empty", nameof(listingType));

            return await _context.PropertyListings
                .AsNoTracking()
                .Include(p => p.Agent)
                .Include(p => p.Lead)
                .Where(p => p.ListingType.ToLower() == listingType.ToLower())
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<PropertyListing>> GetPropertyListingsByLocationAsync(string location)
        {
            if (string.IsNullOrWhiteSpace(location))
                throw new ArgumentException("Location cannot be null or empty", nameof(location));

            return await _context.PropertyListings
                .AsNoTracking()
                .Include(p => p.Agent)
                .Include(p => p.Lead)
                .Where(p => p.Location.ToLower().Contains(location.ToLower()))
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<PropertyListing>> GetPropertyListingsByPriceRangeAsync(decimal minPrice, decimal maxPrice)
        {
            if (minPrice < 0)
                throw new ArgumentException("Minimum price cannot be negative", nameof(minPrice));
            if (maxPrice < minPrice)
                throw new ArgumentException("Maximum price cannot be less than minimum price", nameof(maxPrice));

            return await _context.PropertyListings
                .AsNoTracking()
                .Include(p => p.Agent)
                .Include(p => p.Lead)
                .Where(p => p.Price >= minPrice && p.Price <= maxPrice)
                .OrderBy(p => p.Price)
                .ToListAsync();
        }

        // ====== UPDATE OPERATIONS ======
        public async Task<PropertyListing> UpdatePropertyListingAsync(PropertyListing propertyListing)
        {
            if (propertyListing == null)
                throw new ArgumentNullException(nameof(propertyListing));

            if (propertyListing.Id <= 0)
                throw new ArgumentException("PropertyListing ID must be greater than 0", nameof(propertyListing.Id));

            var existingPropertyListing = await _context.PropertyListings.FindAsync(propertyListing.Id);
            if (existingPropertyListing == null)
                return null;

            existingPropertyListing.Title = propertyListing.Title;
            existingPropertyListing.Description = propertyListing.Description;
            existingPropertyListing.PropertyType = propertyListing.PropertyType;
            existingPropertyListing.ListingType = propertyListing.ListingType;
            existingPropertyListing.Price = propertyListing.Price;
            existingPropertyListing.Location = propertyListing.Location;
            existingPropertyListing.Bedrooms = propertyListing.Bedrooms;
            existingPropertyListing.Bathrooms = propertyListing.Bathrooms;
            existingPropertyListing.SizeInSqm = propertyListing.SizeInSqm;
            existingPropertyListing.IsAvailable = propertyListing.IsAvailable;
            existingPropertyListing.AgentId = propertyListing.AgentId;
            existingPropertyListing.LeadId = propertyListing.LeadId;
            existingPropertyListing.UpdatedAt = DateTime.UtcNow;

            _context.PropertyListings.Update(existingPropertyListing);
            await _context.SaveChangesAsync();

            return existingPropertyListing;
        }

        // ====== DELETE OPERATIONS ======
        public async Task<bool> DeletePropertyListingAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("PropertyListing ID must be greater than 0", nameof(id));

            var propertyListing = await _context.PropertyListings.FindAsync(id);
            if (propertyListing == null)
                return false;

            _context.PropertyListings.Remove(propertyListing);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
