using HlumisaProperties.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Text;

namespace HlumisaProperties.Application.Interfaces
{
    public interface IAgentBankAccountService
    {
        // Create Operations
        /// <summary>
        /// Creates a new bank account record for an agent.
        /// </summary>
        /// <param name="bankAccount">The bank account entity to create</param>
        /// <returns>The created bank account with assigned ID</returns>
        Task<AgentBankAccount> CreateBankAccountAsync(AgentBankAccount bankAccount);

        /// <summary>
        /// Creates multiple bank accounts for an agent.
        /// </summary>
        /// <param name="bankAccounts">Collection of bank accounts to create</param>
        /// <returns>Collection of created bank accounts</returns>
        Task<IEnumerable<AgentBankAccount>> CreateBankAccountsAsync(IEnumerable<AgentBankAccount> bankAccounts);

        // Read Operations
        /// <summary>
        /// Retrieves a bank account by its ID.
        /// </summary>
        /// <param name="id">The bank account ID</param>
        /// <returns>The bank account if found; otherwise null</returns>
        Task<AgentBankAccount> GetBankAccountByIdAsync(int id);

        /// <summary>
        /// Retrieves a bank account by account number.
        /// </summary>
        /// <param name="accountNumber">The account number</param>
        /// <returns>The bank account if found; otherwise null</returns>
        Task<AgentBankAccount> GetBankAccountByNumberAsync(string accountNumber);

        /// <summary>
        /// Retrieves all bank accounts in the system.
        /// </summary>
        /// <returns>A collection of all bank accounts</returns>
        Task<IEnumerable<AgentBankAccount>> GetAllBankAccountsAsync();

        /// <summary>
        /// Retrieves all bank accounts for a specific agent.
        /// </summary>
        /// <param name="agentId">The agent ID</param>
        /// <returns>A collection of bank accounts for the specified agent</returns>
        Task<IEnumerable<AgentBankAccount>> GetBankAccountsByAgentIdAsync(int agentId);

        /// <summary>
        /// Retrieves bank accounts by bank name.
        /// </summary>
        /// <param name="bankName">The bank name to filter by</param>
        /// <returns>A collection of bank accounts from the specified bank</returns>
        Task<IEnumerable<AgentBankAccount>> GetBankAccountsByBankNameAsync(string bankName);

        /// <summary>
        /// Retrieves the primary (first) bank account for an agent.
        /// </summary>
        /// <param name="agentId">The agent ID</param>
        /// <returns>The primary bank account if found; otherwise null</returns>
        Task<AgentBankAccount> GetPrimaryBankAccountAsync(int agentId);

        /// <summary>
        /// Retrieves bank accounts using a custom filter predicate.
        /// </summary>
        /// <param name="predicate">The filter condition</param>
        /// <returns>A collection of bank accounts matching the predicate</returns>
        Task<IEnumerable<AgentBankAccount>> GetBankAccountsByFilterAsync(Expression<Func<AgentBankAccount, bool>> predicate);

        /// <summary>
        /// Retrieves paginated bank accounts.
        /// </summary>
        /// <param name="pageNumber">The page number (1-indexed)</param>
        /// <param name="pageSize">The number of accounts per page</param>
        /// <returns>A collection of bank accounts for the specified page</returns>
        Task<IEnumerable<AgentBankAccount>> GetBankAccountsPaginatedAsync(int pageNumber, int pageSize);

        /// <summary>
        /// Retrieves paginated bank accounts for a specific agent.
        /// </summary>
        /// <param name="agentId">The agent ID</param>
        /// <param name="pageNumber">The page number (1-indexed)</param>
        /// <param name="pageSize">The number of accounts per page</param>
        /// <returns>A collection of bank accounts for the specified page</returns>
        Task<IEnumerable<AgentBankAccount>> GetAgentBankAccountsPaginatedAsync(int agentId, int pageNumber, int pageSize);

        /// <summary>
        /// Gets the total count of bank accounts in the system.
        /// </summary>
        /// <returns>The total number of bank accounts</returns>
        Task<int> GetBankAccountCountAsync();

        /// <summary>
        /// Gets the count of bank accounts for a specific agent.
        /// </summary>
        /// <param name="agentId">The agent ID</param>
        /// <returns>The number of bank accounts for the agent</returns>
        Task<int> GetAgentBankAccountCountAsync(int agentId);

        // Update Operations
        /// <summary>
        /// Updates an existing bank account's information.
        /// </summary>
        /// <param name="id">The bank account ID to update</param>
        /// <param name="bankAccount">The updated bank account data</param>
        /// <returns>The updated bank account if successful; otherwise null</returns>
        Task<AgentBankAccount> UpdateBankAccountAsync(int id, AgentBankAccount bankAccount);

        /// <summary>
        /// Updates only the bank account details (bank name, account holder name, branch code).
        /// </summary>
        /// <param name="id">The bank account ID</param>
        /// <param name="bankName">The bank name</param>
        /// <param name="accountHolderName">The account holder name</param>
        /// <param name="branchCode">The branch code</param>
        /// <returns>The updated bank account if successful; otherwise null</returns>
        Task<AgentBankAccount> UpdateBankAccountDetailsAsync(int id, string bankName, string accountHolderName, string branchCode);

        // Delete Operations
        /// <summary>
        /// Deletes a bank account by its ID.
        /// </summary>
        /// <param name="id">The bank account ID to delete</param>
        /// <returns>True if the deletion was successful; otherwise false</returns>
        Task<bool> DeleteBankAccountAsync(int id);

        /// <summary>
        /// Deletes a bank account by account number.
        /// </summary>
        /// <param name="accountNumber">The account number to delete</param>
        /// <returns>True if the deletion was successful; otherwise false</returns>
        Task<bool> DeleteBankAccountByNumberAsync(string accountNumber);

        /// <summary>
        /// Deletes all bank accounts for a specific agent.
        /// </summary>
        /// <param name="agentId">The agent ID</param>
        /// <returns>The number of bank accounts deleted</returns>
        Task<int> DeleteAgentBankAccountsAsync(int agentId);

        /// <summary>
        /// Deletes multiple bank accounts by their IDs.
        /// </summary>
        /// <param name="ids">The collection of bank account IDs to delete</param>
        /// <returns>The number of bank accounts deleted</returns>
        Task<int> DeleteBankAccountsAsync(IEnumerable<int> ids);

        // Validation Operations
        /// <summary>
        /// Checks if a bank account with the specified account number exists.
        /// </summary>
        /// <param name="accountNumber">The account number to check</param>
        /// <returns>True if the account number exists; otherwise false</returns>
        Task<bool> BankAccountExistsByNumberAsync(string accountNumber);

        /// <summary>
        /// Checks if a bank account with the specified ID exists.
        /// </summary>
        /// <param name="id">The bank account ID to check</param>
        /// <returns>True if the bank account exists; otherwise false</returns>
        Task<bool> BankAccountExistsByIdAsync(int id);

        /// <summary>
        /// Checks if an agent has any bank accounts.
        /// </summary>
        /// <param name="agentId">The agent ID to check</param>
        /// <returns>True if the agent has bank accounts; otherwise false</returns>
        Task<bool> AgentHasBankAccountsAsync(int agentId);

        /// <summary>
        /// Checks if an account number is unique in the system.
        /// </summary>
        /// <param name="accountNumber">The account number to verify</param>
        /// <param name="excludeId">The bank account ID to exclude from the check (for updates)</param>
        /// <returns>True if the account number is unique; otherwise false</returns>
        Task<bool> IsAccountNumberUniqueAsync(string accountNumber, int? excludeId = null);

        // Related Data Operations
        /// <summary>
        /// Retrieves a bank account with its associated agent information.
        /// </summary>
        /// <param name="id">The bank account ID</param>
        /// <returns>The bank account with agent info if found; otherwise null</returns>
        Task<AgentBankAccount> GetBankAccountWithAgentAsync(int id);

        /// <summary>
        /// Retrieves all bank accounts for an agent with agent details.
        /// </summary>
        /// <param name="agentId">The agent ID</param>
        /// <returns>Collection of bank accounts with agent details</returns>
        Task<IEnumerable<AgentBankAccount>> GetAgentBankAccountsWithAgentAsync(int agentId);
    }
}