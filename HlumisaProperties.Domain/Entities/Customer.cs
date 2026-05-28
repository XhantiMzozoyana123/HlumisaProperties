using System;
using System.Collections.Generic;
using System.Text;

namespace HlumisaProperties.Domain.Entities
{
    public class Customer : BaseEntity
    {
        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string EmailAddress { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public string Location { get; set; } = string.Empty;

        public CustomerType InterestType { get; set; }
        // Example: Buying, Selling, Renting

        // Navigation Property
        public ICollection<ContactBook> Contacts { get; set; }
            = new List<ContactBook>();

    }

    public enum CustomerType
    {
        Buying,
        Selling
    }
}
