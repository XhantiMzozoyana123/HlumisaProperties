using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using HlumisaProperties.Domain.Entities;

namespace HlumisaProperties.Application.Interfaces
{
    public interface ILeadService
    {
        Task<Lead> CreateLeadAsync(Lead lead);
        Task<Lead> GetLeadByIdAsync(int id);
        Task<IEnumerable<Lead>> GetAllLeadsAsync();
        Task<IEnumerable<Lead>> GetLeadsByTypeAsync(LeadType leadType);
        Task<IEnumerable<Lead>> GetContactedLeadsAsync();
        Task<IEnumerable<Lead>> GetUncontactedLeadsAsync();
        Task<IEnumerable<Lead>> GetLeadsByLocationAsync(string location);
        Task<Lead> UpdateLeadAsync(Lead lead);
        Task<bool> DeleteLeadAsync(int id);
    }
}
