using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Domain;
using HlumisaProperties.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

namespace HlumisaProperties.Infrastructure.Services
{
    public class WhatsAppService : IWhatsAppService
    {
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<WhatsAppService> _logger;

        public WhatsAppService(
            IConfiguration configuration,
            ApplicationDbContext context,
            ILogger<WhatsAppService> logger)
        {
            _configuration = configuration;
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Sends a plain text WhatsApp message via Twilio and persists it to the database.
        /// </summary>
        public async Task SendMessageAsync(string toPhoneNumber, string message)
        {
            var accountSid = _configuration["Twilio:AccountSid"];
            var authToken = _configuration["Twilio:AuthToken"];
            var whatsappFromNumber = _configuration["Twilio:WhatsAppFromNumber"];

            if (string.IsNullOrEmpty(whatsappFromNumber))
            {
                throw new InvalidOperationException("Twilio:WhatsAppFromNumber is not configured.");
            }

            TwilioClient.Init(accountSid, authToken);

            var twilioMessage = await MessageResource.CreateAsync(
                from: new PhoneNumber($"whatsapp:{whatsappFromNumber}"),
                to: new PhoneNumber($"whatsapp:{toPhoneNumber}"),
                body: message
            );

            // Save outgoing message to database
            _context.WhatsAppMessages.Add(new WhatsAppMessage
            {
                FromPhoneNumber = whatsappFromNumber,
                ToPhoneNumber = toPhoneNumber,
                MessageId = twilioMessage.Sid,
                Text = message,
                Direction = "OUT",
                MediaUrl = string.Empty,
                CreatedAt = DateTime.UtcNow,
                RawPayload = $"Twilio SID: {twilioMessage.Sid}, Status: {twilioMessage.Status}"
            });

            await _context.SaveChangesAsync();
            _logger.LogInformation("WhatsApp outgoing message saved (SID: {Sid})", twilioMessage.Sid);
        }

        /// <summary>
        /// Sends a WhatsApp message with a media attachment and persists it to the database.
        /// </summary>
        public async Task SendMediaMessageAsync(string toPhoneNumber, string message, string mediaUrl)
        {
            var accountSid = _configuration["Twilio:AccountSid"];
            var authToken = _configuration["Twilio:AuthToken"];
            var whatsappFromNumber = _configuration["Twilio:WhatsAppFromNumber"];

            if (string.IsNullOrEmpty(whatsappFromNumber))
            {
                throw new InvalidOperationException("Twilio:WhatsAppFromNumber is not configured.");
            }

            TwilioClient.Init(accountSid, authToken);

            var twilioMessage = await MessageResource.CreateAsync(
                from: new PhoneNumber($"whatsapp:{whatsappFromNumber}"),
                to: new PhoneNumber($"whatsapp:{toPhoneNumber}"),
                body: message,
                mediaUrl: new List<Uri> { new Uri(mediaUrl) }
            );

            // Save outgoing media message to database
            _context.WhatsAppMessages.Add(new WhatsAppMessage
            {
                FromPhoneNumber = whatsappFromNumber,
                ToPhoneNumber = toPhoneNumber,
                MessageId = twilioMessage.Sid,
                Text = message ?? string.Empty,
                Direction = "OUT",
                MediaUrl = mediaUrl,
                CreatedAt = DateTime.UtcNow,
                RawPayload = $"Twilio SID: {twilioMessage.Sid}, Status: {twilioMessage.Status}, MediaUrl: {mediaUrl}"
            });

            await _context.SaveChangesAsync();
            _logger.LogInformation("WhatsApp outgoing media message saved (SID: {Sid})", twilioMessage.Sid);
        }

        /// <summary>
        /// Saves an incoming (webhook) WhatsApp message to the database.
        /// Called from the controller when Twilio forwards an incoming message.
        /// </summary>
        public async Task SaveIncomingMessageAsync(string fromPhoneNumber, string toPhoneNumber, string text, string mediaUrl, string rawPayload)
        {
            _context.WhatsAppMessages.Add(new WhatsAppMessage
            {
                FromPhoneNumber = fromPhoneNumber,
                ToPhoneNumber = toPhoneNumber,
                MessageId = Guid.NewGuid().ToString(),
                Text = text,
                Direction = "IN",
                MediaUrl = mediaUrl ?? string.Empty,
                CreatedAt = DateTime.UtcNow,
                RawPayload = rawPayload
            });

            await _context.SaveChangesAsync();
            _logger.LogInformation("WhatsApp incoming message saved from {PhoneNumber}", fromPhoneNumber);
        }
    }
}