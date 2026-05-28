using System;
using System.Collections.Generic;
using System.Text;

namespace HlumisaProperties.Domain.Entities
{
    public class ContactBook : BaseEntity
    {
        public int CustomerId { get; set; }

        public Customer Customer { get; set; }

        public int AgentId { get; set; }

        public Agent Agent { get; set; }

        public string Message { get; set; } = string.Empty;

        public bool IsResolved { get; set; }
    }
}
