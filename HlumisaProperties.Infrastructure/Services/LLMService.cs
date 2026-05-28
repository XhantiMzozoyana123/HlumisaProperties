using HlumisaProperties.Application.Constants;
using HlumisaProperties.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
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
            IConfiguration configuration
            )
        {
            _configuration = configuration;
            _httpClient = httpClient;
        }

        public async Task<string> GenerateTextAsync(string prompt)
        {
            var payload = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                }
            };

            var json = JsonSerializer.Serialize(payload);
            var apiKey = _configuration["Gemini:ApiKey"];
            var response = await _httpClient.PostAsync(AppConstant.googleAiEndPoint + apiKey, new StringContent(json, Encoding.UTF8, "application/json"));

            if (!response.IsSuccessStatusCode) return $"Error: {response.StatusCode}";

            var responseJson = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseJson);
            var text = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            return text ?? "No response";
        }
    }
}
