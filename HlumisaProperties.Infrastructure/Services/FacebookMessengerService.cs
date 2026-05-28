using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Domain;
using HlumisaProperties.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace HlumisaProperties.Infrastructure.Services
{
    public class FacebookMessengerService : IFacebookMessengerService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;

        public FacebookMessengerService(
            HttpClient httpClient,
            IConfiguration configuration,
            ApplicationDbContext context)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _context = context;
        }

        // ======================================================
        // SEND MESSAGE
        // ======================================================
        public async Task SendMessageAsync(string recipientId, string message)
        {
            var token = _configuration["Facebook:AccessToken"];

            var url = $"https://graph.facebook.com/v19.0/me/messages?access_token={token}";

            var payload = new
            {
                recipient = new { id = recipientId },
                message = new { text = message }
            };

            var json = JsonSerializer.Serialize(payload);

            var response = await _httpClient.PostAsync(
                url,
                new StringContent(json, Encoding.UTF8, "application/json"));

            response.EnsureSuccessStatusCode();

            // SAVE OUTGOING MESSAGE
            _context.FacebookMessages.Add(new FacebookMessage
            {
                MessageId = Guid.NewGuid().ToString(),
                SenderId = "PAGE",
                RecipientId = recipientId,
                Text = message,
                Direction = "OUT",
                CreatedAt = DateTime.UtcNow,
                RawPayload = json
            });

            await _context.SaveChangesAsync();
        }

        // ======================================================
        // GET ALL MESSAGES
        // ======================================================
        public async Task<List<FacebookMessage>> GetAllMessagesAsync(string pageId)
        {
            var token = _configuration["Facebook:AccessToken"];

            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", token);

            var url = $"https://graph.facebook.com/v19.0/{pageId}/conversations";

            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);

            var result = new List<FacebookMessage>();

            if (!doc.RootElement.TryGetProperty("data", out var conversations))
                return result;

            foreach (var convo in conversations.EnumerateArray())
            {
                var conversationId = convo.GetProperty("id").GetString();
                var messages = await GetConversationAsync(conversationId);

                result.AddRange(messages);
            }

            return result;
        }

        // ======================================================
        // GET CONVERSATION
        // ======================================================
        public async Task<List<FacebookMessage>> GetConversationAsync(string conversationId)
        {
            var token = _configuration["Facebook:AccessToken"];

            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", token);

            var url = $"https://graph.facebook.com/v19.0/{conversationId}/messages";

            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);

            var messages = new List<FacebookMessage>();

            if (!doc.RootElement.TryGetProperty("data", out var data))
                return messages;

            foreach (var msg in data.EnumerateArray())
            {
                messages.Add(new FacebookMessage
                {
                    MessageId = msg.GetProperty("id").GetString(),
                    Text = msg.TryGetProperty("message", out var t) ? t.GetString() : "",
                    CreatedAt = DateTime.UtcNow,
                    RawPayload = msg.ToString(),
                    Direction = "IN",
                    ConversationId = conversationId
                });
            }

            return messages;
        }
    }
}