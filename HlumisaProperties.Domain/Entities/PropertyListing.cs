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

        // Relationships

        public int AgentId { get; set; }

        public Agent Agent { get; set; }

        public int? LeadId { get; set; }

        public Lead Lead { get; set; }
    }
}
