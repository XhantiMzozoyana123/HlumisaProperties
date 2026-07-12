namespace HlumisaProperties.Domain.Entities
{
    public class WhatsAppMessage : BaseEntity
    {
        public string FromPhoneNumber { get; set; } = string.Empty;

        public string ToPhoneNumber { get; set; } = string.Empty;

        public string MessageId { get; set; } = string.Empty;

        public string Text { get; set; } = string.Empty;

        public string Direction { get; set; } = string.Empty; // "IN" or "OUT"

        public string MediaUrl { get; set; } = string.Empty;

        public string RawPayload { get; set; } = string.Empty;
    }
}