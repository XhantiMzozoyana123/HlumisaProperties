using System;
using System.Collections.Generic;
using System.Text;

namespace HlumisaProperties.Domain.Entities
{
    public class PropertyListing : BaseEntity
    {
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string PropertyType { get; set; } = string.Empty;
        // Example: House, Apartment, Land, Commercial

        public string ListingType { get; set; } = string.Empty;
        // Example: Sale, Rent

        public decimal Price { get; set; }

        public string Location { get; set; } = string.Empty;

        public int Bedrooms { get; set; }

        public int Bathrooms { get; set; }

        public double SizeInSqm { get; set; }

        public bool IsAvailable { get; set; }

        /// <summary>
        /// JSON array of image URLs/data-URIs.
        /// </summary>
        public string Images { get; set; } = "[]";

        /// <summary>
        /// Date the property was added (ISO format YYYY-MM-DD).
        /// </summary>
        public string DateAdded { get; set; } = string.Empty;

        /// <summary>
        /// Listing status: on-market, under-offer, sold.
        /// </summary>
        public string Status { get; set; } = "on-market";

        /// <summary>
        /// Name of the seller.
        /// </summary>
        public string SellerName { get; set; } = string.Empty;
    }
}