using HlumisaProperties.Application.Constants;
using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Domain;
using HlumisaProperties.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;
using System.Text.Json;

namespace HlumisaProperties.Infrastructure.Services
{
    public class ExtractService : IExtractService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILLMService _llmService;
        private readonly ApplicationDbContext _context;

        public ExtractService(
            HttpClient httpClient,
            IConfiguration configuration,
            ILLMService llmService,
            ApplicationDbContext context)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _llmService = llmService;
            _context = context;
        }

        public async Task<List<Lead>> ExtractLeadsFromMessengerThreadsAsync(
            string pageId)
        {
            var accessToken = _configuration["Facebook:AccessToken"];

            if (string.IsNullOrWhiteSpace(accessToken))
                throw new Exception("Facebook access token is missing.");

            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", accessToken);

            var savedLeads = new List<Lead>();

            // =========================
            // STEP 1: GET CONVERSATIONS
            // =========================
            var conversationsUrl =
                $"https://graph.facebook.com/v19.0/{pageId}/conversations";

            var conversationsResponse =
                await _httpClient.GetAsync(conversationsUrl);

            conversationsResponse.EnsureSuccessStatusCode();

            var conversationsJson =
                await conversationsResponse.Content.ReadAsStringAsync();

            using var conversationsDoc =
                JsonDocument.Parse(conversationsJson);

            if (!conversationsDoc.RootElement.TryGetProperty("data", out var conversations))
                return savedLeads;

            // =========================
            // STEP 2: LOOP CONVERSATIONS
            // =========================
            foreach (var conversation in conversations.EnumerateArray())
            {
                var conversationId =
                    conversation.GetProperty("id").GetString();

                if (string.IsNullOrWhiteSpace(conversationId))
                    continue;

                // =========================
                // STEP 3: GET MESSAGES
                // =========================
                var messagesUrl =
                    $"https://graph.facebook.com/v19.0/{conversationId}/messages";

                var messagesResponse =
                    await _httpClient.GetAsync(messagesUrl);

                messagesResponse.EnsureSuccessStatusCode();

                var messagesJson =
                    await messagesResponse.Content.ReadAsStringAsync();

                // =========================
                // STEP 4: LLM EXTRACTION
                // =========================
                var prompt =
                    AiConstant.GetLeadExtractionInstructions(messagesJson);

                var llmResult =
                    await _llmService.GenerateTextAsync(prompt);

                if (string.IsNullOrWhiteSpace(llmResult))
                    continue;

                // =========================
                // STEP 5: PARSE LLM RESULT
                // =========================
                try
                {
                    using var doc = JsonDocument.Parse(llmResult);

                    var leads = new List<Lead>();

                    if (doc.RootElement.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var item in doc.RootElement.EnumerateArray())
                        {
                            var lead = MapLead(item, messagesJson);
                            if (lead != null)
                                leads.Add(lead);
                        }
                    }
                    else if (doc.RootElement.ValueKind == JsonValueKind.Object)
                    {
                        var lead = MapLead(doc.RootElement, messagesJson);
                        if (lead != null)
                            leads.Add(lead);
                    }

                    // =========================
                    // STEP 6: SAVE TO DATABASE
                    // =========================
                    foreach (var lead in leads)
                    {
                        // Prevent duplicates (basic protection)
                        var exists = await _context.Leads.AnyAsync(l =>
                            l.EmailAddress == lead.EmailAddress &&
                            l.PhoneNumber == lead.PhoneNumber);

                        if (exists)
                            continue;

                        await _context.Leads.AddAsync(lead);
                        savedLeads.Add(lead);
                    }

                    await _context.SaveChangesAsync();
                }
                catch
                {
                    // ignore bad AI output
                    continue;
                }
            }

            return savedLeads;
        }

        // =========================
        // MAPPER
        // =========================
        private Lead? MapLead(JsonElement element, string threadJson)
        {
            try
            {
                var leadType = element.GetProperty("LeadType").GetString() ?? "Buyer";

                Enum.TryParse(leadType, true, out LeadType parsedType);

                return new Lead
                {
                    FirstName = element.GetProperty("FirstName").GetString() ?? "",
                    LastName = element.GetProperty("LastName").GetString() ?? "",
                    EmailAddress = element.GetProperty("EmailAddress").GetString() ?? "",
                    PhoneNumber = element.GetProperty("PhoneNumber").GetString() ?? "",
                    Location = element.GetProperty("Location").GetString() ?? "",
                    LeadType = parsedType,
                    IsContacted = element.GetProperty("IsContacted").GetBoolean(),
                    JsonCommunicationThread = threadJson
                };
            }
            catch
            {
                return null;
            }
        }
    }
}