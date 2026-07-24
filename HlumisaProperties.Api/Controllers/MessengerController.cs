using HlumisaProperties.Application.Constants;
using HlumisaProperties.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace HlumisaProperties.Api.Controllers
{
    [ApiController]
    [Route("api/messenger")]
    public class MessengerController : ControllerBase
    {
        private readonly IFacebookMessengerService _messengerService;
        private readonly ILLMService _llmService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<MessengerController> _logger;

        public MessengerController(
            IFacebookMessengerService messengerService,
            ILLMService llmService,
            IConfiguration configuration,
            ILogger<MessengerController> logger)
        {
            _messengerService = messengerService;
            _llmService = llmService;
            _configuration = configuration;
            _logger = logger;
        }

        // ======================================================
        // META WEBHOOK VERIFICATION (THE HANDSHAKE)
        // ======================================================
        [HttpGet("webhook")]
        public IActionResult Verify([FromQuery(Name = "hub.mode")] string mode,
                                    [FromQuery(Name = "hub.challenge")] string challenge,
                                    [FromQuery(Name = "hub.verify_token")] string token)
        {
            var verifyToken = _configuration["Facebook:VerifyToken"];

            if (mode == "subscribe" && token == verifyToken)
            {
                _logger.LogInformation("Facebook webhook verified successfully.");
                return Ok(challenge);
            }

            return Forbid();
        }

        // ======================================================
        // DIRECT META WEBHOOK FOR INCOMING FACEBOOK MESSAGES
        // ======================================================
        [HttpPost("webhook")]
        public async Task<IActionResult> Receive([FromBody] JsonElement payload)
        {
            try
            {
                if (payload.TryGetProperty("object", out var obj) && obj.GetString() == "page")
                {
                    if (payload.TryGetProperty("entry", out var entryArray) && entryArray.GetArrayLength() > 0)
                    {
                        var entry = entryArray[0];
                        if (entry.TryGetProperty("messaging", out var messagingArray) && messagingArray.GetArrayLength() > 0)
                        {
                            var messagingEvent = messagingArray[0];

                            if (messagingEvent.TryGetProperty("message", out var messageObj) && 
                                messageObj.TryGetProperty("text", out var textObj))
                            {
                                // =======================================================================
                                // 🔍 USER PSID EXTRACTION:
                                // Meta sends the user's Page-Scoped ID inside the 'sender.id' path.
                                // 'senderId' right here IS the exact User PSID of the person chatting.
                                // =======================================================================
                                string senderId = messagingEvent.GetProperty("sender").GetProperty("id").GetString();
                                
                                string pageId = messagingEvent.GetProperty("recipient").GetProperty("id").GetString();
                                string body = textObj.GetString();
                                string rawPayloadString = payload.GetRawText();

                                if (string.IsNullOrWhiteSpace(body)) return Ok();

                                _logger.LogInformation("Direct Messenger webhook received from PSID: {SenderId}", senderId);

                                // =======================================================================
                                // 💾 USING THE USER PSID FOR LOCAL LOGGING:
                                // We pass the 'senderId' (User PSID) into our service layer so our database 
                                // correctly registers who sent this incoming ("IN") message.
                                // =======================================================================
                                await _messengerService.SaveLocalMessageAsync(senderId, pageId, body, "IN", rawPayloadString);

                                // Build AI Prompt
                                var prompt = AiConstant.GetAutoResponderInstructions(body);
                                var aiResponse = await _llmService.GenerateTextAsync(prompt);

                                if (!string.IsNullOrWhiteSpace(aiResponse))
                                {
                                    // =======================================================================
                                    // 🚀 USING THE USER PSID TO ROUTE THE AI REPLY:
                                    // We pass the exact same 'senderId' (User PSID) down to the send method.
                                    // This ensures the Graph API delivers the AI's reply back to this specific person.
                                    // =======================================================================
                                    await _messengerService.SendMessageAsync(senderId, aiResponse);
                                    _logger.LogInformation("Messenger direct auto-reply sent to PSID: {SenderId}", senderId);
                                }
                            }
                        }
                    }
                }

                return Ok(); 
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing direct Facebook Graph API webhook payload.");
                return Ok(); 
            }
        }

        // ======================================================
        // MANUAL TEST ENDPOINT
        // ======================================================
        [HttpPost("send")]
        public async Task<IActionResult> Send([FromQuery] string recipientId, [FromQuery] string message)
        {
            // =======================================================================
            // ✉️ MANUAL TEST PSID ROUTING:
            // When triggering manually, the 'recipientId' parameter you input is the User PSID.
            // =======================================================================
            await _messengerService.SendMessageAsync(recipientId, message);
            return Ok("Message dispatched via Graph API.");
        }
    }
}