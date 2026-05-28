using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Domain;
using HlumisaProperties.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Text;

namespace HlumisaProperties.Infrastructure.Services
{
    public class AgentService : IAgentService
    {
        private readonly ApplicationDbContext _context;

        public AgentService(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        // ====== CREATE OPERATIONS ======
        public async Task<Agent> CreateAgentAsync(Agent agent)
        {
            if (agent == null)
                throw new ArgumentNullException(nameof(agent));

            agent.CreatedAt = DateTime.UtcNow;
            agent.UpdatedAt = DateTime.UtcNow;

            _context.Agents.Add(agent);
            await _context.SaveChangesAsync();

            return agent;
        }

        // ====== READ OPERATIONS ======
        public async Task<Agent> GetAgentByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Agent ID must be greater than 0", nameof(id));

            return await _context.Agents
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<Agent> GetAgentByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("Email cannot be null or empty", nameof(email));

            return await _context.Agents
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.Email.ToLower() == email.ToLower());
        }

        public async Task<IEnumerable<Agent>> GetAllAgentsAsync()
        {
            return await _context.Agents
                .AsNoTracking()
                .OrderBy(a => a.FirstName)
                .ThenBy(a => a.LastName)
                .ToListAsync();
        }

        public async Task<IEnumerable<Agent>> GetAvailableAgentsAsync()
        {
            return await _context.Agents
                .AsNoTracking()
                .Where(a => a.IsAvailable)
                .OrderBy(a => a.FirstName)
                .ThenBy(a => a.LastName)
                .ToListAsync();
        }

        public async Task<IEnumerable<Agent>> GetAgentsByLocationAsync(string location)
        {
            if (string.IsNullOrWhiteSpace(location))
                throw new ArgumentException("Location cannot be null or empty", nameof(location));

            return await _context.Agents
                .AsNoTracking()
                .Where(a => a.Location.ToLower().Contains(location.ToLower()))
                .OrderBy(a => a.FirstName)
                .ToListAsync();
        }

        public async Task<IEnumerable<Agent>> GetAgentsByExperienceAsync(int minimumYears)
        {
            if (minimumYears < 0)
                throw new ArgumentException("Minimum years cannot be negative", nameof(minimumYears));

            return await _context.Agents
                .AsNoTracking()
                .Where(a => a.YearsOfExperience >= minimumYears)
                .OrderByDescending(a => a.YearsOfExperience)
                .ToListAsync();
        }

        public async Task<IEnumerable<Agent>> GetAgentsByFilterAsync(Expression<Func<Agent, bool>> predicate)
        {
            if (predicate == null)
                throw new ArgumentNullException(nameof(predicate));

            return await _context.Agents
                .AsNoTracking()
                .Where(predicate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Agent>> GetAgentsPaginatedAsync(int pageNumber, int pageSize)
        {
            if (pageNumber < 1)
                throw new ArgumentException("Page number must be greater than 0", nameof(pageNumber));
            if (pageSize < 1)
                throw new ArgumentException("Page size must be greater than 0", nameof(pageSize));

            return await _context.Agents
                .AsNoTracking()
                .OrderBy(a => a.FirstName)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetAgentCountAsync()
        {
            return await _context.Agents.CountAsync();
        }

        // ====== UPDATE OPERATIONS ======
        public async Task<Agent> UpdateAgentAsync(int id, Agent agent)
        {
            if (id <= 0)
                throw new ArgumentException("Agent ID must be greater than 0", nameof(id));
            if (agent == null)
                throw new ArgumentNullException(nameof(agent));

            var existingAgent = await _context.Agents.FindAsync(id);
            if (existingAgent == null)
                return null;

            existingAgent.FirstName = agent.FirstName;
            existingAgent.LastName = agent.LastName;
            existingAgent.Email = agent.Email;
            existingAgent.PhoneNumber = agent.PhoneNumber;
            existingAgent.Location = agent.Location;
            existingAgent.LicenseNumber = agent.LicenseNumber;
            existingAgent.Bio = agent.Bio;
            existingAgent.LanguagesSpoken = agent.LanguagesSpoken;
            existingAgent.YearsOfExperience = agent.YearsOfExperience;
            existingAgent.IsAvailable = agent.IsAvailable;
            existingAgent.ProfileImageBase64 = agent.ProfileImageBase64;
            existingAgent.UpdatedAt = DateTime.UtcNow;

            _context.Agents.Update(existingAgent);
            await _context.SaveChangesAsync();

            return existingAgent;
        }

        public async Task<bool> UpdateAgentAvailabilityAsync(int id, bool isAvailable)
        {
            if (id <= 0)
                throw new ArgumentException("Agent ID must be greater than 0", nameof(id));

            var agent = await _context.Agents.FindAsync(id);
            if (agent == null)
                return false;

            agent.IsAvailable = isAvailable;
            agent.UpdatedAt = DateTime.UtcNow;

            _context.Agents.Update(agent);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<Agent> UpdateAgentLocationAsync(int id, string location)
        {
            if (id <= 0)
                throw new ArgumentException("Agent ID must be greater than 0", nameof(id));
            if (string.IsNullOrWhiteSpace(location))
                throw new ArgumentException("Location cannot be null or empty", nameof(location));

            var agent = await _context.Agents.FindAsync(id);
            if (agent == null)
                return null;

            agent.Location = location;
            agent.UpdatedAt = DateTime.UtcNow;

            _context.Agents.Update(agent);
            await _context.SaveChangesAsync();

            return agent;
        }

        // ====== DELETE OPERATIONS ======
        public async Task<bool> DeleteAgentAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Agent ID must be greater than 0", nameof(id));

            var agent = await _context.Agents.FindAsync(id);
            if (agent == null)
                return false;

            _context.Agents.Remove(agent);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAgentByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("Email cannot be null or empty", nameof(email));

            var agent = await _context.Agents
                .FirstOrDefaultAsync(a => a.Email.ToLower() == email.ToLower());

            if (agent == null)
                return false;

            _context.Agents.Remove(agent);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<int> DeleteAgentsAsync(IEnumerable<int> ids)
        {
            if (ids == null || !ids.Any())
                throw new ArgumentException("IDs collection cannot be null or empty", nameof(ids));

            var agents = await _context.Agents
                .Where(a => ids.Contains(a.Id))
                .ToListAsync();

            if (agents.Count == 0)
                return 0;

            _context.Agents.RemoveRange(agents);
            await _context.SaveChangesAsync();

            return agents.Count;
        }

        // ====== VALIDATION OPERATIONS ======
        public async Task<bool> AgentExistsByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("Email cannot be null or empty", nameof(email));

            return await _context.Agents
                .AnyAsync(a => a.Email.ToLower() == email.ToLower());
        }

        public async Task<bool> AgentExistsByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Agent ID must be greater than 0", nameof(id));

            return await _context.Agents
                .AnyAsync(a => a.Id == id);
        }

        // ====== RELATED DATA OPERATIONS ======
        public async Task<Agent> GetAgentWithBankAccountsAsync(int agentId)
        {
            if (agentId <= 0)
                throw new ArgumentException("Agent ID must be greater than 0", nameof(agentId));

            return await _context.Agents
                .AsNoTracking()
                .Include(a => a.Contacts)
                .FirstOrDefaultAsync(a => a.Id == agentId);
        }

        public async Task<Agent> GetAgentWithContactsAsync(int agentId)
        {
            if (agentId <= 0)
                throw new ArgumentException("Agent ID must be greater than 0", nameof(agentId));

            return await _context.Agents
                .AsNoTracking()
                .Include(a => a.Contacts)
                .FirstOrDefaultAsync(a => a.Id == agentId);
        }

        public async Task<Agent> GetAgentWithListingsAsync(int agentId)
        {
            if (agentId <= 0)
                throw new ArgumentException("Agent ID must be greater than 0", nameof(agentId));

            return await _context.Agents
                .AsNoTracking()
                .Include(a => a.Contacts)
                .FirstOrDefaultAsync(a => a.Id == agentId);
        }
    }
}
