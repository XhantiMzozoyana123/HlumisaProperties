using System;
using System.Collections.Generic;
using System.Text;

namespace HlumisaProperties.Application.Interfaces
{
    public interface ILLMService
    {
        Task<string> GenerateTextAsync(string prompt);
    }
}
