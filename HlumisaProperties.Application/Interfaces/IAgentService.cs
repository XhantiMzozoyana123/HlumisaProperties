using HlumisaProperties.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Text;

namespace HlumisaProperties.Application.Interfaces
{
    public interface IAgentService
    {
        // Create Operations
        /// <summary>
        /// Creates a new agent in the system.
        /// </summary>
        /// <param name="agent">The agent entity to create</param>
        /// <returns>The created agent with assigned ID</returns>
        Task<Agent> CreateAgentAsync(Agent agent);

        // Read Operations
        /// <summary>
        /// Retrieves an agent by their unique identifier.
        /// </summary>
        /// <param name="id">The agent ID</param>
        /// <returns>The agent if found; otherwise null</returns>
        Task<Agent> GetAgentByIdAsync(int id);

        /// <summary>
        /// Retrieves an agent by their email address.
        /// </summary>
        /// <param name="email">The agent's email</param>
        /// <returns>The agent if found; otherwise null</returns>
        Task<Agent> GetAgentByEmailAsync(string email);

        /// <summary>
        /// Retrieves all agents in the system.
        /// </summary>
        /// <returns>A collection of all agents</returns>
        Task<IEnumerable<Agent>> GetAllAgentsAsync();

        /// <summary>
        /// Retrieves available agents (IsAvailable = true).
        /// </summary>
        /// <returns>A collection of available agents</returns>
        Task<IEnumerable<Agent>> GetAvailableAgentsAsync();

        /// <summary>
        /// Retrieves agents by location.
        /// </summary>
        /// <param name="location">The location to filter by</param>
        /// <returns>A collection of agents in the specified location</returns>
        Task<IEnumerable<Agent>> GetAgentsByLocationAsync(string location);

        /// <summary>
        /// Retrieves agents by years of experience (minimum).
        /// </summary>
        /// <param name="minimumYears">The minimum years of experience</param>
        /// <returns>A collection of agents with at least the specified years of experience</returns>
        Task<IEnumerable<Agent>> GetAgentsByExperienceAsync(int minimumYears);

        /// <summary>
        /// Retrieves agents using a custom filter predicate.
        /// </summary>
        /// <param name="predicate">The filter condition</param>
        /// <returns>A collection of agents matching the predicate</returns>
        Task<IEnumerable<Agent>> GetAgentsByFilterAsync(Expression<Func<Agent, bool>> predicate);

        /// <summary>
        /// Retrieves paginated agents.
        /// </summary>
        /// <param name="pageNumber">The page number (1-indexed)</param>
        /// <param name="pageSize">The number of agents per page</param>
        /// <returns>A collection of agents for the specified page</returns>
        Task<IEnumerable<Agent>> GetAgentsPaginatedAsync(int pageNumber, int pageSize);

        /// <summary>
        /// Gets the total count of agents in the system.
        /// </summary>
        /// <returns>The total number of agents</returns>
        Task<int> GetAgentCountAsync();

        // Update Operations
        /// <summary>
        /// Updates an existing agent's information.
        /// </summary>
        /// <param name="id">The agent ID to update</param>
        /// <param name="agent">The updated agent data</param>
        /// <returns>The updated agent if successful; otherwise null</returns>
        Task<Agent> UpdateAgentAsync(int id, Agent agent);

        /// <summary>
        /// Updates the agent's availability status.
        /// </summary>
        /// <param name="id">The agent ID</param>
        /// <param name="isAvailable">The new availability status</param>
        /// <returns>True if the update was successful; otherwise false</returns>
        Task<bool> UpdateAgentAvailabilityAsync(int id, bool isAvailable);

        /// <summary>
        /// Updates the agent's location.
        /// </summary>
        /// <param name="id">The agent ID</param>
        /// <param name="location">The new location</param>
        /// <returns>The updated agent if successful; otherwise null</returns>
        Task<Agent> UpdateAgentLocationAsync(int id, string location);

        // Delete Operations
        /// <summary>
        /// Deletes an agent by their ID.
        /// </summary>
        /// <param name="id">The agent ID to delete</param>
        /// <returns>True if the deletion was successful; otherwise false</returns>
        Task<bool> DeleteAgentAsync(int id);

        /// <summary>
        /// Deletes an agent by their email address.
        /// </summary>
        /// <param name="email">The agent's email</param>
        /// <returns>True if the deletion was successful; otherwise false</returns>
        Task<bool> DeleteAgentByEmailAsync(string email);

        // Bulk Operations
        /// <summary>
        /// Deletes multiple agents by their IDs.
        /// </summary>
        /// <param name="ids">The collection of agent IDs to delete</param>
        /// <returns>The number of agents deleted</returns>
        Task<int> DeleteAgentsAsync(IEnumerable<int> ids);

        // Validation Operations
        /// <summary>
        /// Checks if an agent with the specified email exists.
        /// </summary>
        /// <param name="email">The email to check</param>
        /// <returns>True if the email exists; otherwise false</returns>
        Task<bool> AgentExistsByEmailAsync(string email);

        /// <summary>
        /// Checks if an agent with the specified ID exists.
        /// </summary>
        /// <param name="id">The agent ID to check</param>
        /// <returns>True if the agent exists; otherwise false</returns>
        Task<bool> AgentExistsByIdAsync(int id);

        // Related Data Operations
        /// <summary>
        /// Retrieves an agent with all their bank accounts.
        /// </summary>
        /// <param name="agentId">The agent ID</param>
        /// <returns>The agent with bank accounts if found; otherwise null</returns>
        Task<Agent> GetAgentWithBankAccountsAsync(int agentId);

        /// <summary>
        /// Retrieves an agent with all their contact records.
        /// </summary>
        /// <param name="agentId">The agent ID</param>
        /// <returns>The agent with contacts if found; otherwise null</returns>
        Task<Agent> GetAgentWithContactsAsync(int agentId);

        /// <summary>
        /// Retrieves an agent with all their property listings.
        /// </summary>
        /// <param name="agentId">The agent ID</param>
        /// <returns>The agent with property listings if found; otherwise null</returns>
        Task<Agent> GetAgentWithListingsAsync(int agentId);
    }
}
