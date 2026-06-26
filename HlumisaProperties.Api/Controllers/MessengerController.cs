using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Application.Constants;
using Microsoft.AspNetCore.Mvc;
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

        public MessengerController(
            IFacebookMessengerService messengerService,
            ILLMService llmService,
            IConfiguration configuration)
        {
            _messengerService = messengerService;
            _llmService = llmService;
            _configuration = configuration;
        }

        // ======================================================
        // TWILIO WEBHOOK FOR INCOMING FACEBOOK MESSENGER MESSAGES
        // ======================================================
        [HttpPost("webhook")]
        public async Task<IActionResult> Receive()
        {
            // Twilio sends data as form fields
            var body = Request.Form["Body"].ToString();
            var from = Request.Form["From"].ToString(); // Format: messenger:PSID

            if (string.IsNullOrWhiteSpace(body) || string.IsNullOrWhiteSpace(from))
                return Ok();

            // Extract sender ID from Twilio format "messenger:PSID"
            var senderId = from.Replace("messenger:", "");

            // ======================================================
            // 1. BUILD AI PROMPT (AUTO RESPONDER)
            // ======================================================
            var prompt = AiConstant.GetAutoResponderInstructions(body);

            var aiResponse = await _llmService.GenerateTextAsync(prompt);

            if (!string.IsNullOrWhiteSpace(aiResponse))
            {
                // ======================================================
                // 2. SEND MESSAGE BACK VIA TWILIO
                // ======================================================
                await _messengerService.SendMessageAsync(senderId, aiResponse);
            }

            // Return empty response to Twilio
            return Content("<?xml version=\"1.0\" encoding=\"UTF-8\"?>", "text/xml");
        }

        // ======================================================
        // OPTIONAL: MANUAL TEST ENDPOINT
        // ======================================================
        [HttpPost("send")]
        public async Task<IActionResult> Send([FromQuery] string recipientId, [FromQuery] string message)
        {
            await _messengerService.SendMessageAsync(recipientId, message);
            return Ok("Message sent");
        }
    }
}