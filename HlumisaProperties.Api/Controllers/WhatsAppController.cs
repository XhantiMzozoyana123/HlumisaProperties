using HlumisaProperties.Application.Constants;
using HlumisaProperties.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Twilio;
using Twilio.Security;

namespace HlumisaProperties.Api.Controllers
{
    [ApiController]
    [Route("api/whatsapp")]
    public class WhatsAppController : ControllerBase
    {
        private readonly IWhatsAppService _whatsAppService;
        private readonly ILLMService _llmService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<WhatsAppController> _logger;

        public WhatsAppController(
            IWhatsAppService whatsAppService,
            ILLMService llmService,
            IConfiguration configuration,
            ILogger<WhatsAppController> logger)
        {
            _whatsAppService = whatsAppService;
            _llmService = llmService;
            _configuration = configuration;
            _logger = logger;
        }

        // ======================================================
        // TWILIO WEBHOOK FOR INCOMING WHATSAPP MESSAGES
        // ======================================================
        [HttpPost("webhook")]
        public async Task<IActionResult> Receive()
        {
            // Validate Twilio webhook signature
            if (!IsValidTwilioRequest())
            {
                _logger.LogWarning("Invalid Twilio webhook signature rejected for WhatsApp");
                return Unauthorized("Invalid request signature.");
            }

            // Twilio sends incoming WhatsApp data as form fields
            var body = Request.Form["Body"].ToString();
            var from = Request.Form["From"].ToString(); // Format: whatsapp:+27612345678

            if (string.IsNullOrWhiteSpace(body) || string.IsNullOrWhiteSpace(from))
            {
                _logger.LogWarning("WhatsApp webhook received empty body or from");
                return Ok();
            }

            // Extract phone number from Twilio format "whatsapp:+27612345678"
            var fromPhone = from.Replace("whatsapp:", "");
            var whatsappFromNumber = _configuration["Twilio:WhatsAppFromNumber"] ?? "";

            _logger.LogInformation("WhatsApp webhook received from {PhoneNumber}", fromPhone);

            // ======================================================
            // 0. SAVE INCOMING MESSAGE TO DATABASE
            // ======================================================
            var rawPayload = $"{Request.Form.Keys}";

            await _whatsAppService.SaveIncomingMessageAsync(
                fromPhone,
                whatsappFromNumber,
                body,
                Request.Form["MediaUrl0"].ToString(),
                rawPayload);

            // ======================================================
            // 1. BUILD AI PROMPT (AUTO RESPONDER) — uses shared prompt
            // ======================================================
            var prompt = AiConstant.GetAutoResponderInstructions(body);

            var aiResponse = await _llmService.GenerateTextAsync(prompt);

            if (!string.IsNullOrWhiteSpace(aiResponse))
            {
                // ======================================================
                // 2. SEND WHATSAPP REPLY VIA TWILIO
                // ======================================================
                await _whatsAppService.SendMessageAsync(fromPhone, aiResponse);
                _logger.LogInformation("WhatsApp auto-reply sent to {PhoneNumber}", fromPhone);
            }

            // Return empty TwiML response to acknowledge receipt
            return Content("<?xml version=\"1.0\" encoding=\"UTF-8\"?>", "text/xml");
        }

        // ======================================================
        // SEND A WHATSAPP MESSAGE (MANUAL / PROGRAMMATIC)
        // ======================================================
        [HttpPost("send")]
        public async Task<IActionResult> Send([FromQuery] string to, [FromQuery] string message)
        {
            if (string.IsNullOrWhiteSpace(to) || string.IsNullOrWhiteSpace(message))
                return BadRequest("Both 'to' and 'message' query parameters are required.");

            await _whatsAppService.SendMessageAsync(to, message);
            _logger.LogInformation("WhatsApp message sent to {PhoneNumber}", to);
            return Ok("WhatsApp message sent");
        }

        // ======================================================
        // SEND A WHATSAPP MESSAGE WITH MEDIA ATTACHMENT
        // ======================================================
        [HttpPost("send-media")]
        public async Task<IActionResult> SendMedia(
            [FromQuery] string to,
            [FromQuery] string message,
            [FromQuery] string mediaUrl)
        {
            if (string.IsNullOrWhiteSpace(to))
                return BadRequest("'to' query parameter is required.");

            if (string.IsNullOrWhiteSpace(mediaUrl))
                return BadRequest("'mediaUrl' query parameter is required.");

            await _whatsAppService.SendMediaMessageAsync(to, message ?? "", mediaUrl);
            _logger.LogInformation("WhatsApp media message sent to {PhoneNumber}", to);
            return Ok("WhatsApp media message sent");
        }

        // ======================================================
        // PRIVATE: TWILIO REQUEST VALIDATION
        // ======================================================
        private bool IsValidTwilioRequest()
        {
            var accountSid = _configuration["Twilio:AccountSid"];
            var authToken = _configuration["Twilio:AuthToken"];

            if (string.IsNullOrEmpty(authToken) || authToken == "YOUR_TWILIO_AUTH_TOKEN")
            {
                _logger.LogWarning("Twilio auth token not configured — skipping webhook validation");
                return true; // Allow in dev if not configured
            }

            // Build the full URL Twilio would have used
            var requestUrl = $"{Request.Scheme}://{Request.Host}{Request.Path}{Request.QueryString}";

            var validator = new RequestValidator(authToken);

            // Get the Twilio signature header
            var twilioSignature = Request.Headers["X-Twilio-Signature"].FirstOrDefault();

            if (string.IsNullOrEmpty(twilioSignature))
            {
                _logger.LogWarning("Missing X-Twilio-Signature header");
                return false;
            }

            // Collect form parameters (Twilio sends form-encoded POST data)
            var parameters = new Dictionary<string, string>();
            foreach (var key in Request.Form.Keys)
            {
                parameters[key] = Request.Form[key].ToString();
            }

            return validator.Validate(requestUrl, parameters, twilioSignature);
        }
    }
}