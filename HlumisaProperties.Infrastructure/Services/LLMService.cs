using HlumisaProperties.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Text;
using System.Text.Json;

namespace HlumisaProperties.Infrastructure.Services
{
    public class LLMService : ILLMService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<LLMService> _logger;
        private readonly string _baseUrl;
        private readonly string _model;

        public LLMService(
            HttpClient httpClient,
            IConfiguration configuration,
            ILogger<LLMService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;

            _baseUrl = _configuration["LLM:BaseUrl"] ?? "http://63.141.255.202:11434";
            _model = _configuration["LLM:Model"] ?? "llama3:latest";

            // Set a timeout to prevent hung requests
            _httpClient.Timeout = TimeSpan.FromSeconds(30);
        }

        public async Task<string> GenerateTextAsync(string prompt)
        {
            try
            {
                var request = new OllamaRequest
                {
                    Model = _model,
                    Prompt = prompt,
                    Stream = false
                };

                var json = JsonSerializer.Serialize(request);

                _logger.LogInformation("Sending prompt to LLM (model: {Model}, url: {BaseUrl})", _model, _baseUrl);

                var response = await _httpClient.PostAsync(
                    $"{_baseUrl}/api/generate",
                    new StringContent(
                        json,
                        Encoding.UTF8,
                        "application/json"));

                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();

                var result = JsonSerializer.Deserialize<OllamaResponse>(
                    responseContent,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                _logger.LogInformation("LLM response received successfully");

                return result?.Response ?? "No response returned.";
            }
            catch (TaskCanceledException)
            {
                _logger.LogWarning("LLM request timed out after 30 seconds");
                throw new InvalidOperationException("The AI service is currently unavailable. Please try again later.");
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "LLM HTTP request failed");
                throw new InvalidOperationException("The AI service is currently unavailable. Please try again later.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected LLM error");
                throw new InvalidOperationException("An unexpected error occurred. Please try again later.");
            }
        }
    }

    public class OllamaRequest
    {
        public string Model { get; set; } = string.Empty;
        public string Prompt { get; set; } = string.Empty;
        public bool Stream { get; set; }
    }

    public class OllamaResponse
    {
        public string Model { get; set; } = string.Empty;
        public string Response { get; set; } = string.Empty;
        public bool Done { get; set; }
    }
}