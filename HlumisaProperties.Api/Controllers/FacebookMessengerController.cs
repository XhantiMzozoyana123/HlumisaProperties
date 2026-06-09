using HlumisaProperties.Application.Constants;
using HlumisaProperties.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Threading.Tasks;

namespace HlumisaProperties.Api.Controllers
{
    [ApiController]
    [Route("api/facebook-messenger")]
    public class FacebookMessengerController : ControllerBase
    {
        private readonly IFacebookMessengerService _messengerService;
        private readonly ILLMService _llmService;
        private readonly IConfiguration _configuration;

 
        public FacebookMessengerController(
            IFacebookMessengerService messengerService,
            ILLMService llmService,
            IConfiguration configuration)
        {
            _messengerService = messengerService;
            _llmService = llmService;
            _configuration = configuration;
        }

        // ======================================================
        // 1. FACEBOOK WEBHOOK VERIFY (REQUIRED BY FACEBOOK)
        // ======================================================
        [HttpGet("webhook")]
        public IActionResult VerifyWebhook(
            [FromQuery(Name = "hub.mode")] string hub_mode,
            [FromQuery(Name = "hub.challenge")] string hub_challenge,
            [FromQuery(Name = "hub.verify_token")] string hub_verify_token)
        {
            var verifyToken = "xp@6z8DPYjJeJky";

            if (hub_mode == "subscribe" && hub_verify_token == verifyToken)
            {
                return Content(hub_challenge);
            }

            return Unauthorized();
        }

        // ======================================================
        // 2. WEBHOOK RECEIVE (INCOMING MESSAGES)
        // ======================================================
        [HttpPost("webhook")]
        public async Task<IActionResult> Receive([FromBody] JsonElement payload)
        {
            if (payload.ValueKind == JsonValueKind.Undefined)
                return BadRequest();

            // Extract sender + message safely
            var entry = payload.GetProperty("entry")[0];
            var messaging = entry.GetProperty("messaging")[0];

            var senderId = messaging.GetProperty("sender").GetProperty("id").GetString();
            var messageText = messaging.GetProperty("message").GetProperty("text").GetString();

            if (string.IsNullOrWhiteSpace(senderId) || string.IsNullOrWhiteSpace(messageText))
                return Ok();

            // ======================================================
            // 1. BUILD AI PROMPT (AUTO RESPONDER)
            // ======================================================
            var prompt = AiConstant.GetAutoResponderInstructions(messageText);

            var aiResponse = await _llmService.GenerateTextAsync(prompt);

            if (string.IsNullOrWhiteSpace(aiResponse))
                return Ok();

            // ======================================================
            // 2. SEND MESSAGE BACK TO FACEBOOK USER
            // ======================================================
            await _messengerService.SendMessageAsync(senderId, aiResponse);

            return Ok();
        }

        // ======================================================
        // 3. OPTIONAL: MANUAL TEST ENDPOINT
        // ======================================================
        [HttpPost("send")]
        public async Task<IActionResult> Send([FromQuery] string recipientId, [FromQuery] string message)
        {
            await _messengerService.SendMessageAsync(recipientId, message);
            return Ok("Message sent");
        }
    }
}