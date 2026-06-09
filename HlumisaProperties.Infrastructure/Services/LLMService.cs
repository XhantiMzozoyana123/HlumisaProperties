using HlumisaProperties.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Text;
using System.Text.Json;

namespace HlumisaProperties.Infrastructure.Services
{
    public class LLMService : ILLMService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public LLMService(
            HttpClient httpClient,
            IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<string> GenerateTextAsync(string prompt)
        {
            try
            {
                var request = new OllamaRequest
                {
                    Model = _configuration["LLM:Model"] ?? "llama3:latest",
                    Prompt = prompt,
                    Stream = false
                };

                var json = JsonSerializer.Serialize(request);

                var response = await _httpClient.PostAsync(
                    $"http://63.141.255.202/api/generate",
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

                return result?.Response ?? "No response returned.";
            }
            catch (Exception ex)
            {
                return $"LLM Error: {ex.Message}";
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