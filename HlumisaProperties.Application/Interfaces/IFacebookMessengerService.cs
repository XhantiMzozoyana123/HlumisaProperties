using HlumisaProperties.Domain.Entities;
using System.Text.Json;

namespace HlumisaProperties.Application.Interfaces
{
    public interface IFacebookMessengerService
    {
        // =========================
        // OUTBOUND (SEND)
        // =========================
        Task SendMessageAsync(string recipientId, string message);

        // =========================
        // READ (SYNC FROM FACEBOOK)
        // =========================
        Task<List<FacebookMessage>> GetAllMessagesAsync(string pageId);

        Task<List<FacebookMessage>> GetConversationAsync(string conversationId);
    }
}