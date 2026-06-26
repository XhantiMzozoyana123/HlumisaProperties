using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Domain;
using HlumisaProperties.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

namespace HlumisaProperties.Infrastructure.Services
{
    public class FacebookMessengerService : IFacebookMessengerService
    {
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;

        public FacebookMessengerService(
            IConfiguration configuration,
            ApplicationDbContext context)
        {
            _configuration = configuration;
            _context = context;
        }

        // ======================================================
        // SEND MESSAGE VIA TWILIO
        // ======================================================
        public async Task SendMessageAsync(string recipientId, string message)
        {
            var accountSid = _configuration["Twilio:AccountSid"];
            var authToken = _configuration["Twilio:AuthToken"];
            var messagingSenderId = _configuration["Twilio:MessagingSenderId"];

            if (string.IsNullOrEmpty(messagingSenderId))
            {
                throw new InvalidOperationException("Twilio:MessagingSenderId is not configured.");
            }

            TwilioClient.Init(accountSid, authToken);

            var twilioMessage = await MessageResource.CreateAsync(
                from: new PhoneNumber($"messenger:{messagingSenderId}"),
                to: new PhoneNumber($"messenger:{recipientId}"),
                body: message
            );

            // SAVE OUTGOING MESSAGE
            _context.FacebookMessages.Add(new FacebookMessage
            {
                MessageId = Guid.NewGuid().ToString(),
                SenderId = messagingSenderId,
                RecipientId = recipientId,
                Text = message,
                Direction = "OUT",
                CreatedAt = DateTime.UtcNow,
                RawPayload = $"Twilio SID: {twilioMessage.Sid}"
            });

            await _context.SaveChangesAsync();
        }

        // ======================================================
        // GET ALL MESSAGES
        // ======================================================
        public async Task<List<FacebookMessage>> GetAllMessagesAsync(string pageId)
        {
            // Twilio does not provide a history API for Messenger conversations.
            // Return stored messages from local database instead.
            return await _context.FacebookMessages
                .ToListAsync();
        }

        // ======================================================
        // GET CONVERSATION
        // ======================================================
        public async Task<List<FacebookMessage>> GetConversationAsync(string conversationId)
        {
            // Twilio does not provide a history API for Messenger conversations.
            // Return stored messages from local database instead.
            return await _context.FacebookMessages
                .ToListAsync();
        }
    }
}