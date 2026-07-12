using System;
using System.Collections.Generic;
using System.Text;

namespace HlumisaProperties.Domain.Entities
{
    public class Buyer : BaseEntity
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Budget { get; set; } = string.Empty;
        public string PropertyType { get; set; } = string.Empty;
        public bool IsContacted { get; set; }
        public bool IsDiscarded { get; set; }
    }
}