using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace HlumisaProperties.Api.Controllers
{
    /// <summary>
    /// Manages the <see cref="AgentBankAccount"/> entity (banking details belonging to an agent).
    ///
    /// Entity: AgentBankAccount (inherits BaseEntity)
    /// Columns:
    ///   - Id (int)                  : Primary key (from BaseEntity).
    ///   - UserId (string)           : Owning application user id (from BaseEntity).
    ///   - CreatedAt (DateTime)      : Record creation timestamp (from BaseEntity).
    ///   - UpdatedAt (DateTime)      : Last modification timestamp (from BaseEntity).
    ///   - AgentId (int)             : Foreign key to the owning Agent.
    ///   - Agent (Agent)             : Navigation to the owning agent.
    ///   - BankName (string)         : Name of the bank.
    ///   - AccountNumber (string)    : Bank account number (expected unique).
    ///   - AccountHolderName (string): Name on the account.
    ///   - BranchCode (string)       : Bank branch / routing code.
    ///
    /// Responsibility: exposes CRUD, agent-scoped queries, pagination, counts and
    /// validation (uniqueness/existence) for bank accounts via <see cref="IAgentBankAccountService"/>.
    /// </summary>
    [ApiController]
    [Route("api/agent-bank-accounts")]
    public class AgentBankAccountsController : ControllerBase
    {
        private readonly IAgentBankAccountService _bankAccountService;

        public AgentBankAccountsController(IAgentBankAccountService bankAccountService)
        {
            _bankAccountService = bankAccountService;
        }

        // ====== CREATE ======

        /// <summary>
        /// Creates a single bank account record and returns it with a 201 Created location.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AgentBankAccount bankAccount)
        {
            if (bankAccount == null)
                return BadRequest("Bank account payload is required.");

            var created = await _bankAccountService.CreateBankAccountAsync(bankAccount);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        /// <summary>
        /// Creates multiple bank account records in one request.
        /// </summary>
        [HttpPost("bulk")]
        public async Task<IActionResult> CreateMany([FromBody] IEnumerable<AgentBankAccount> bankAccounts)
        {
            if (bankAccounts == null)
                return BadRequest("Bank accounts payload is required.");

            var created = await _bankAccountService.CreateBankAccountsAsync(bankAccounts);
            return Ok(created);
        }

        // ====== READ ======

        /// <summary>
        /// Retrieves a single bank account by its primary key (Id). Returns 404 if not found.
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var account = await _bankAccountService.GetBankAccountByIdAsync(id);
            if (account == null)
                return NotFound();

            return Ok(account);
        }

        /// <summary>
        /// Retrieves a bank account located by its AccountNumber column. Returns 404 if not found.
        /// </summary>
        [HttpGet("by-number/{accountNumber}")]
        public async Task<IActionResult> GetByNumber(string accountNumber)
        {
            var account = await _bankAccountService.GetBankAccountByNumberAsync(accountNumber);
            if (account == null)
                return NotFound();

            return Ok(account);
        }

        /// <summary>
        /// Retrieves every bank account in the system.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var accounts = await _bankAccountService.GetAllBankAccountsAsync();
            return Ok(accounts);
        }

        /// <summary>
        /// Retrieves all bank accounts belonging to a given agent (filtered by AgentId).
        /// </summary>
        [HttpGet("by-agent/{agentId:int}")]
        public async Task<IActionResult> GetByAgentId(int agentId)
        {
            var accounts = await _bankAccountService.GetBankAccountsByAgentIdAsync(agentId);
            return Ok(accounts);
        }

        /// <summary>
        /// Retrieves bank accounts filtered by the BankName column.
        /// </summary>
        [HttpGet("by-bank/{bankName}")]
        public async Task<IActionResult> GetByBankName(string bankName)
        {
            var accounts = await _bankAccountService.GetBankAccountsByBankNameAsync(bankName);
            return Ok(accounts);
        }

        /// <summary>
        /// Retrieves the agent's primary (first) bank account. Returns 404 if none exists.
        /// </summary>
        [HttpGet("by-agent/{agentId:int}/primary")]
        public async Task<IActionResult> GetPrimary(int agentId)
        {
            var account = await _bankAccountService.GetPrimaryBankAccountAsync(agentId);
            if (account == null)
                return NotFound();

            return Ok(account);
        }

        /// <summary>
        /// Retrieves a page of all bank accounts using pageNumber/pageSize query parameters.
        /// </summary>
        [HttpGet("paginated")]
        public async Task<IActionResult> GetPaginated([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var accounts = await _bankAccountService.GetBankAccountsPaginatedAsync(pageNumber, pageSize);
            return Ok(accounts);
        }

        /// <summary>
        /// Retrieves a page of a single agent's bank accounts (filtered by AgentId).
        /// </summary>
        [HttpGet("by-agent/{agentId:int}/paginated")]
        public async Task<IActionResult> GetAgentPaginated(int agentId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var accounts = await _bankAccountService.GetAgentBankAccountsPaginatedAsync(agentId, pageNumber, pageSize);
            return Ok(accounts);
        }

        /// <summary>
        /// Returns the total number of bank account records.
        /// </summary>
        [HttpGet("count")]
        public async Task<IActionResult> GetCount()
        {
            var count = await _bankAccountService.GetBankAccountCountAsync();
            return Ok(count);
        }

        /// <summary>
        /// Returns the number of bank accounts owned by a given agent.
        /// </summary>
        [HttpGet("by-agent/{agentId:int}/count")]
        public async Task<IActionResult> GetAgentCount(int agentId)
        {
            var count = await _bankAccountService.GetAgentBankAccountCountAsync(agentId);
            return Ok(count);
        }

        /// <summary>
        /// Retrieves a bank account together with its related Agent (navigation property).
        /// </summary>
        [HttpGet("{id:int}/with-agent")]
        public async Task<IActionResult> GetWithAgent(int id)
        {
            var account = await _bankAccountService.GetBankAccountWithAgentAsync(id);
            if (account == null)
                return NotFound();

            return Ok(account);
        }

        /// <summary>
        /// Retrieves all of an agent's bank accounts, each including its Agent navigation property.
        /// </summary>
        [HttpGet("by-agent/{agentId:int}/with-agent")]
        public async Task<IActionResult> GetAgentAccountsWithAgent(int agentId)
        {
            var accounts = await _bankAccountService.GetAgentBankAccountsWithAgentAsync(agentId);
            return Ok(accounts);
        }

        // ====== UPDATE ======

        /// <summary>
        /// Fully updates a bank account (all editable columns) identified by Id. Returns 404 if missing.
        /// </summary>
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] AgentBankAccount bankAccount)
        {
            if (bankAccount == null)
                return BadRequest("Bank account payload is required.");

            var updated = await _bankAccountService.UpdateBankAccountAsync(id, bankAccount);
            if (updated == null)
                return NotFound();

            return Ok(updated);
        }

        /// <summary>
        /// Updates only the BankName, AccountHolderName and BranchCode columns of a bank account.
        /// </summary>
        [HttpPatch("{id:int}/details")]
        public async Task<IActionResult> UpdateDetails(int id, [FromQuery] string bankName, [FromQuery] string accountHolderName, [FromQuery] string branchCode)
        {
            var updated = await _bankAccountService.UpdateBankAccountDetailsAsync(id, bankName, accountHolderName, branchCode);
            if (updated == null)
                return NotFound();

            return Ok(updated);
        }

        // ====== DELETE ======

        /// <summary>
        /// Deletes a bank account by its primary key (Id). Returns 404 if not found.
        /// </summary>
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _bankAccountService.DeleteBankAccountAsync(id);
            if (!success)
                return NotFound();

            return NoContent();
        }

        /// <summary>
        /// Deletes a bank account located by its AccountNumber column. Returns 404 if not found.
        /// </summary>
        [HttpDelete("by-number/{accountNumber}")]
        public async Task<IActionResult> DeleteByNumber(string accountNumber)
        {
            var success = await _bankAccountService.DeleteBankAccountByNumberAsync(accountNumber);
            if (!success)
                return NotFound();

            return NoContent();
        }

        /// <summary>
        /// Deletes all bank accounts owned by a given agent and returns the number deleted.
        /// </summary>
        [HttpDelete("by-agent/{agentId:int}")]
        public async Task<IActionResult> DeleteAgentAccounts(int agentId)
        {
            var deletedCount = await _bankAccountService.DeleteAgentBankAccountsAsync(agentId);
            return Ok(new { deleted = deletedCount });
        }

        /// <summary>
        /// Bulk-deletes multiple bank accounts from a list of Ids and returns the number deleted.
        /// </summary>
        [HttpDelete("bulk")]
        public async Task<IActionResult> DeleteMany([FromBody] IEnumerable<int> ids)
        {
            var deletedCount = await _bankAccountService.DeleteBankAccountsAsync(ids);
            return Ok(new { deleted = deletedCount });
        }

        // ====== VALIDATION ======

        /// <summary>
        /// Checks whether a bank account exists with the given AccountNumber. Returns a boolean.
        /// </summary>
        [HttpGet("exists/by-number/{accountNumber}")]
        public async Task<IActionResult> ExistsByNumber(string accountNumber)
        {
            var exists = await _bankAccountService.BankAccountExistsByNumberAsync(accountNumber);
            return Ok(exists);
        }

        /// <summary>
        /// Checks whether a bank account exists with the given Id. Returns a boolean.
        /// </summary>
        [HttpGet("exists/{id:int}")]
        public async Task<IActionResult> ExistsById(int id)
        {
            var exists = await _bankAccountService.BankAccountExistsByIdAsync(id);
            return Ok(exists);
        }

        /// <summary>
        /// Checks whether the given agent has any bank accounts. Returns a boolean.
        /// </summary>
        [HttpGet("by-agent/{agentId:int}/has-accounts")]
        public async Task<IActionResult> AgentHasAccounts(int agentId)
        {
            var hasAccounts = await _bankAccountService.AgentHasBankAccountsAsync(agentId);
            return Ok(hasAccounts);
        }

        /// <summary>
        /// Verifies that an AccountNumber is unique across the system, optionally excluding a
        /// specific record Id (useful during updates). Returns a boolean.
        /// </summary>
        [HttpGet("is-number-unique/{accountNumber}")]
        public async Task<IActionResult> IsNumberUnique(string accountNumber, [FromQuery] int? excludeId = null)
        {
            var isUnique = await _bankAccountService.IsAccountNumberUniqueAsync(accountNumber, excludeId);
            return Ok(isUnique);
        }
    }
}
