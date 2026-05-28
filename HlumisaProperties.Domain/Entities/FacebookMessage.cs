using System;
using System.Collections.Generic;
using System.Text;

namespace HlumisaProperties.Domain.Entities
{
    public class FacebookMessage : BaseEntity
    {
        public string ConversationId { get; set; }

        public string SenderId { get; set; }

        public string RecipientId { get; set; }

        public string MessageId { get; set; }

        public string Text { get; set; }

        public string Direction { get; set; } // "IN" or "OUT"

        public DateTime CreatedAt { get; set; }

        public string RawPayload { get; set; }
    }
}
