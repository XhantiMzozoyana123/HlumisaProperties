using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using HlumisaProperties.Domain.Entities;

namespace HlumisaProperties.Application.Interfaces
{
    public interface IPropertyListingService
    {
        Task<PropertyListing> CreatePropertyListingAsync(PropertyListing propertyListing);
        Task<PropertyListing> GetPropertyListingByIdAsync(int id);
        Task<IEnumerable<PropertyListing>> GetAllPropertyListingsAsync();
        Task<IEnumerable<PropertyListing>> GetAvailablePropertyListingsAsync();
        Task<IEnumerable<PropertyListing>> GetPropertyListingsByAgentIdAsync(int agentId);
        Task<IEnumerable<PropertyListing>> GetPropertyListingsByLeadIdAsync(int leadId);
        Task<IEnumerable<PropertyListing>> GetPropertyListingsByTypeAsync(string propertyType);
        Task<IEnumerable<PropertyListing>> GetPropertyListingsByListingTypeAsync(string listingType);
        Task<IEnumerable<PropertyListing>> GetPropertyListingsByLocationAsync(string location);
        Task<IEnumerable<PropertyListing>> GetPropertyListingsByPriceRangeAsync(decimal minPrice, decimal maxPrice);
        Task<PropertyListing> UpdatePropertyListingAsync(PropertyListing propertyListing);
        Task<bool> DeletePropertyListingAsync(int id);
    }
}
