using System;
using System.Collections.Generic;
using System.Text;

namespace HlumisaProperties.Domain.Entities
{
    public class Agent : BaseEntity
    {
        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public string Location { get; set; } = string.Empty;

        public string LicenseNumber { get; set; } = string.Empty;

        public string Bio { get; set; } = string.Empty;

        public string LanguagesSpoken { get; set; } = string.Empty;

        public int YearsOfExperience { get; set; }

        public bool IsAvailable { get; set; }

        public string ProfileImageBase64 { get; set; } = string.Empty;

        // Navigation Property
        public ICollection<ContactBook> Contacts { get; set; }
            = new List<ContactBook>();
    }
}
