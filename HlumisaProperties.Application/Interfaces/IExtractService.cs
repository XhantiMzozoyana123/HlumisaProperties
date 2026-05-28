using HlumisaProperties.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace HlumisaProperties.Application.Interfaces
{
    public interface IExtractService
    {
       Task<List<Lead>> ExtractLeadsFromMessengerThreadsAsync(
       string facebookMessengerJson);
    }
}
