namespace HlumisaProperties.Application.Interfaces
{
    /// <summary>
    /// Extracts buyer/seller leads from today's Facebook Messenger and WhatsApp messages
    /// using the LLM service, and persists them to the database.
    /// </summary>
    public interface ILeadExtractionService
    {
        /// <summary>
        /// Processes all messages from today, extracts leads via LLM,
        /// and creates Buyer/Seller records in the database.
        /// </summary>
        Task ExtractLeadsFromTodayMessagesAsync();
    }
}