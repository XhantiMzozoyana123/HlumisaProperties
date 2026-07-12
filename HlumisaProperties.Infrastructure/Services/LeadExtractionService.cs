using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Domain;
using HlumisaProperties.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text;
using System.Text.Json;

namespace HlumisaProperties.Infrastructure.Services
{
    public class LeadExtractionService : ILeadExtractionService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILLMService _llmService;
        private readonly ILogger<LeadExtractionService> _logger;

        public LeadExtractionService(
            ApplicationDbContext context,
            ILLMService llmService,
            ILogger<LeadExtractionService> logger)
        {
            _context = context;
            _llmService = llmService;
            _logger = logger;
        }

        public async Task ExtractLeadsFromTodayMessagesAsync()
        {
            var todayStart = DateTime.UtcNow.Date;
            var todayEnd = todayStart.AddDays(1);

            _logger.LogInformation("Starting lead extraction for messages from {Start} to {End}", todayStart, todayEnd);

            // 1. FETCH TODAY'S MESSAGES
            var facebookMessages = await _context.FacebookMessages
                .Where(m => m.CreatedAt >= todayStart && m.CreatedAt < todayEnd)
                .OrderBy(m => m.CreatedAt)
                .ToListAsync();

            var whatsAppMessages = await _context.WhatsAppMessages
                .Where(m => m.CreatedAt >= todayStart && m.CreatedAt < todayEnd)
                .OrderBy(m => m.CreatedAt)
                .ToListAsync();

            _logger.LogInformation(
                "Found {FacebookCount} Facebook messages and {WhatsAppCount} WhatsApp messages for today",
                facebookMessages.Count, whatsAppMessages.Count);

            // 2. GROUP BY SENDER AND EXTRACT LEADS

            // Group Facebook messages by sender
            var facebookGroups = facebookMessages
                .GroupBy(m => m.SenderId)
                .ToList();

            foreach (var group in facebookGroups)
            {
                await ExtractLeadFromFacebookMessagesAsync(group.Key, group.ToList());
            }

            // Group WhatsApp messages by sender phone number
            var whatsAppGroups = whatsAppMessages
                .GroupBy(m => m.FromPhoneNumber)
                .ToList();

            foreach (var group in whatsAppGroups)
            {
                await ExtractLeadFromWhatsAppMessagesAsync(group.Key, group.ToList());
            }

            _logger.LogInformation("Lead extraction completed for today");
        }

        private async Task ExtractLeadFromFacebookMessagesAsync(string senderId, List<FacebookMessage> messages)
        {
            var conversation = BuildConversationJson("Facebook", senderId, messages.Select(m => (m.Text, m.Direction)));
            await ProcessConversationAsync(senderId, "Facebook", conversation);
        }

        private async Task ExtractLeadFromWhatsAppMessagesAsync(string senderId, List<WhatsAppMessage> messages)
        {
            var conversation = BuildConversationJson("WhatsApp", senderId, messages.Select(m => (m.Text, m.Direction)));
            await ProcessConversationAsync(senderId, "WhatsApp", conversation);
        }

        private string BuildConversationJson(string channel, string senderId, IEnumerable<(string Text, string Direction)> messages)
        {
            var sb = new StringBuilder();
            sb.AppendLine("[");
            sb.AppendLine("  {");
            sb.AppendLine($"    \"Channel\": \"{channel}\",");
            sb.AppendLine($"    \"SenderId\": \"{senderId}\",");
            sb.AppendLine("    \"Messages\": [");

            var messagesList = messages.ToList();
            for (int i = 0; i < messagesList.Count; i++)
            {
                var (text, direction) = messagesList[i];
                sb.AppendLine("      {");
                sb.AppendLine($"        \"Direction\": \"{direction}\",");
                sb.AppendLine($"        \"Text\": \"{EscapeJson(text)}\"");
                sb.Append("      }");
                if (i < messagesList.Count - 1)
                    sb.AppendLine(",");
                else
                    sb.AppendLine();
            }

            sb.AppendLine("    ]");
            sb.AppendLine("  }");
            sb.AppendLine("]");
            return sb.ToString();
        }

        private async Task ProcessConversationAsync(string senderId, string channel, string conversationJson)
        {
            try
            {
                // 3. CALL LLM TO EXTRACT LEAD
                var prompt = Application.Constants.AiConstant.GetLeadExtractionInstructions(conversationJson);

                var llmResponse = await _llmService.GenerateTextAsync(prompt);

                if (string.IsNullOrWhiteSpace(llmResponse) ||
                    llmResponse.StartsWith("LLM Error") ||
                    llmResponse.StartsWith("The AI service"))
                {
                    _logger.LogWarning("LLM returned no valid response for sender {SenderId} on {Channel}", senderId, channel);
                    return;
                }

                // 4. PARSE LLM RESPONSE
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var leads = JsonSerializer.Deserialize<List<LeadExtractionResult>>(llmResponse, options);

                if (leads == null || leads.Count == 0)
                {
                    _logger.LogInformation("No leads extracted for sender {SenderId} on {Channel}", senderId, channel);
                    return;
                }

                // 5. PERSIST LEADS TO DATABASE
                bool anySaved = false;
                foreach (var lead in leads)
                {
                    if (string.IsNullOrWhiteSpace(lead.FirstName) && string.IsNullOrWhiteSpace(lead.LastName))
                    {
                        _logger.LogInformation("Skipping lead with no name for sender {SenderId}", senderId);
                        continue;
                    }

                    var fullName = $"{lead.FirstName} {lead.LastName}".Trim();

                    if (lead.LeadType?.Equals("Seller", StringComparison.OrdinalIgnoreCase) == true)
                    {
                        var existingSeller = await _context.Sellers
                            .FirstOrDefaultAsync(s => s.PhoneNumber == lead.PhoneNumber && !s.IsDiscarded);

                        if (existingSeller == null)
                        {
                            _context.Sellers.Add(new Seller
                            {
                                FirstName = lead.FirstName ?? fullName,
                                LastName = lead.LastName ?? "",
                                PhoneNumber = lead.PhoneNumber ?? "",
                                Location = lead.Location ?? "",
                                PropertyType = "",
                                EstimatedValue = "",
                                IsContacted = false,
                                IsDiscarded = false,
                                StatusColor = "white",
                                CreatedAt = DateTime.UtcNow
                            });
                            _logger.LogInformation("Created Seller: {Name} ({Phone}) from {Channel}", fullName, lead.PhoneNumber, channel);
                            anySaved = true;
                        }
                    }
                    else
                    {
                        var existingBuyer = await _context.Buyers
                            .FirstOrDefaultAsync(b => b.PhoneNumber == lead.PhoneNumber && !b.IsDiscarded);

                        if (existingBuyer == null)
                        {
                            _context.Buyers.Add(new Buyer
                            {
                                FirstName = lead.FirstName ?? fullName,
                                LastName = lead.LastName ?? "",
                                PhoneNumber = lead.PhoneNumber ?? "",
                                Location = lead.Location ?? "",
                                Budget = "",
                                PropertyType = "",
                                IsContacted = false,
                                IsDiscarded = false,
                                CreatedAt = DateTime.UtcNow
                            });
                            _logger.LogInformation("Created Buyer: {Name} ({Phone}) from {Channel}", fullName, lead.PhoneNumber, channel);
                            anySaved = true;
                        }
                    }
                }

                if (anySaved)
                    await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error extracting lead for sender {SenderId} on {Channel}", senderId, channel);
            }
        }

        private static string EscapeJson(string text)
        {
            return text
                .Replace("\\", "\\\\")
                .Replace("\"", "\\\"")
                .Replace("\n", "\\n")
                .Replace("\r", "\\r")
                .Replace("\t", "\\t");
        }

        private class LeadExtractionResult
        {
            public string? FirstName { get; set; }
            public string? LastName { get; set; }
            public string? EmailAddress { get; set; }
            public string? PhoneNumber { get; set; }
            public string? Location { get; set; }
            public string? LeadType { get; set; }
            public bool IsContacted { get; set; }
        }
    }
}