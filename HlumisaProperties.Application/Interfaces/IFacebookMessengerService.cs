using HlumisaProperties.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HlumisaProperties.Application.Interfaces
{
    public interface IFacebookMessengerService
    {
        // 'recipientId' represents the target User PSID receiving the message
        Task SendMessageAsync(string recipientId, string message);
        
        Task SaveLocalMessageAsync(string senderId, string recipientId, string text, string direction, string rawPayload);
        Task<List<FacebookMessage>> GetAllMessagesAsync(string pageId);
        
        // 'conversationId' maps directly to the unique User PSID thread you want to load
        Task<List<FacebookMessage>> GetConversationAsync(string conversationId);
    }
}