using System;
using System.Collections.Generic;
using System.Text;

namespace HlumisaProperties.Domain.Entities
{
    public class Meeting : BaseEntity
    {
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public DateTime ScheduledDate { get; set; }

        public TimeSpan Duration { get; set; }

        public string Location { get; set; } = string.Empty;
        // Can be physical address or "Online (Zoom/Teams)"

        public string MeetingType { get; set; } = string.Empty;
        // Example: Property Viewing, Consultation, Negotiation

        public string Status { get; set; } = string.Empty;
        // Example: Scheduled, Completed, Cancelled, Rescheduled

        // Relationships

        public int AgentId { get; set; }

        public Agent Agent { get; set; }

        public int CustomerId { get; set; }

        public Customer Customer { get; set; }

        public int? PropertyListingId { get; set; }

        public PropertyListing PropertyListing { get; set; }
    }
}
