using System;
using System.Collections.Generic;
using System.Text;

namespace HlumisaProperties.Domain.Entities
{
    public class Lead : BaseEntity
    {
        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string EmailAddress { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public string Location { get; set; } = string.Empty;

        public string JsonCommunicationThread { get; set; } = string.Empty;

        public LeadType LeadType { get; set; }

        public bool IsContacted { get; set; }
    }

    public enum LeadType
    {
        Buyer,
        Seller,
        Refferal
    }
}
