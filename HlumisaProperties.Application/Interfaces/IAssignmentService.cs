using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using HlumisaProperties.Domain.Entities;

namespace HlumisaProperties.Application.Interfaces
{
    public interface IAssignmentService
    {
        Task<Assignment> CreateAssignmentAsync(Assignment assignment);
        Task<Assignment> GetAssignmentByIdAsync(int id);
        Task<IEnumerable<Assignment>> GetAllAssignmentsAsync();
        Task<IEnumerable<Assignment>> GetAssignmentsByAgentIdAsync(int agentId);
        Task<Assignment> UpdateAssignmentAsync(Assignment assignment);
        Task<bool> DeleteAssignmentAsync(int id);
    }
}
