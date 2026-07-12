namespace HlumisaProperties.Application.Interfaces
{
    public interface IWhatsAppService
    {
        /// <summary>
        /// Send a WhatsApp message to a recipient.
        /// </summary>
        /// <param name="toPhoneNumber">Recipient phone number (e.g. "+27612345678").</param>
        /// <param name="message">Message body text.</param>
        Task SendMessageAsync(string toPhoneNumber, string message);

        /// <summary>
        /// Send a WhatsApp message with a media URL (image, document, etc.).
        /// </summary>
        /// <param name="toPhoneNumber">Recipient phone number.</param>
        /// <param name="message">Message body text.</param>
        /// <param name="mediaUrl">Public URL of the media to attach.</param>
        Task SendMediaMessageAsync(string toPhoneNumber, string message, string mediaUrl);

        /// <summary>
        /// Save an incoming WhatsApp message (from webhook) to the database.
        /// </summary>
        /// <param name="fromPhoneNumber">Sender's phone number.</param>
        /// <param name="toPhoneNumber">Recipient (your Twilio number).</param>
        /// <param name="text">Message body text.</param>
        /// <param name="mediaUrl">Optional media URL if the message contains media.</param>
        /// <param name="rawPayload">Raw payload from Twilio for auditing.</param>
        Task SaveIncomingMessageAsync(string fromPhoneNumber, string toPhoneNumber, string text, string mediaUrl, string rawPayload);
    }
}
