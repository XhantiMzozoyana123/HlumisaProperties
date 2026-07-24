using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Domain;
using HlumisaProperties.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace HlumisaProperties.Infrastructure.Services
{
    public class FacebookMessengerService : IFacebookMessengerService
    {
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;

        public FacebookMessengerService(
            IConfiguration configuration, 
            ApplicationDbContext context,
            IHttpClientFactory httpClientFactory)
        {
            _configuration = configuration;
            _context = context;
            _httpClientFactory = httpClientFactory;
        }

        // ======================================================
        // DISPATCH OUTBOUND MESSAGE VIA DIRECT GRAPH API POST
        // ======================================================
        public async Task SendMessageAsync(string recipientId, string message)
        {
            var accessToken = _configuration["Facebook:PageAccessToken"];
            var pageId = _configuration["Facebook:PageId"]; 

            if (string.IsNullOrEmpty(accessToken))
            {
                throw new InvalidOperationException("Facebook:PageAccessToken is not configured.");
            }

            using var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            // =======================================================================
            // 📄 GRAPH API JSON PAYLOAD MAPPING:
            // Here, the 'recipientId' (the User PSID) is injected directly into the 
            // root "recipient.id" JSON structure required by Meta. 
            // =======================================================================
            var payload = new
            {
                recipient = new { id = recipientId }, // <-- User PSID assigned as destination target
                message = new { text = message }
            };

            string jsonString = JsonSerializer.Serialize(payload);
            var content = new StringContent(jsonString, Encoding.UTF8, "application/json");

            string url = "https://graph.facebook.com/v21.0/me/messages";

            var response = await client.PostAsync(url, content);
            string responseString = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException($"Meta Graph API Error: {response.StatusCode} - {responseString}");
            }

            // =======================================================================
            // 💾 OUTBOUND LOCAL DATABASE RECORDING:
            // The Page ID becomes the 'SenderId', and the target User PSID ('recipientId') 
            // is stored as the 'RecipientId' for this outbound ("OUT") historical entry.
            // =======================================================================
            await SaveLocalMessageAsync(
                senderId: pageId ?? "PAGE_ID",
                recipientId: recipientId, 
                text: message,
                direction: "OUT",
                rawPayload: responseString
            );
        }

        public async Task SaveLocalMessageAsync(string senderId, string recipientId, string text, string direction, string rawPayload)
        {
            _context.FacebookMessages.Add(new FacebookMessage
            {
                MessageId = Guid.NewGuid().ToString(),
                SenderId = senderId,       // Can be a User PSID (if IN) or Page ID (if OUT)
                RecipientId = recipientId, // Can be a Page ID (if IN) or User PSID (if OUT)
                Text = text,
                Direction = direction,
                CreatedAt = DateTime.UtcNow,
                RawPayload = rawPayload
            });

            await _context.SaveChangesAsync();
        }

        public async Task<List<FacebookMessage>> GetAllMessagesAsync(string pageId)
        {
            return await _context.FacebookMessages
                .Where(m => m.SenderId == pageId || m.RecipientId == pageId)
                .OrderBy(m => m.CreatedAt)
                .ToListAsync();
        }

        // ======================================================
        // GET THE THREAD HISTORY FOR A SPECIFIC USER CONVERSATION
        // ======================================================
        public async Task<List<FacebookMessage>> GetConversationAsync(string conversationId)
        {
            // =======================================================================
            // 📂 THREAD FILTERING VIA PSID:
            // Because PSIDs uniquely isolate users per page, 'conversationId' represents 
            // that specific user's PSID. We load all rows where they are the sender OR receiver.
            // =======================================================================
            return await _context.FacebookMessages
                .Where(m => m.SenderId == conversationId || m.RecipientId == conversationId)
                .OrderBy(m => m.CreatedAt)
                .ToListAsync();
        }
    }
}