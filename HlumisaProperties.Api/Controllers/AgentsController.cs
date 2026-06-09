using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace HlumisaProperties.Api.Controllers
{
    /// <summary>
    /// Manages the <see cref="Agent"/> entity (real-estate agents).
    ///
    /// Entity: Agent (inherits BaseEntity)
    /// Columns:
    ///   - Id (int)                : Primary key (from BaseEntity).
    ///   - UserId (string)         : Owning application user id (from BaseEntity).
    ///   - CreatedAt (DateTime)    : Record creation timestamp (from BaseEntity).
    ///   - UpdatedAt (DateTime)    : Last modification timestamp (from BaseEntity).
    ///   - FirstName (string)      : Agent's first name.
    ///   - LastName (string)       : Agent's last name.
    ///   - Email (string)          : Agent's unique email address.
    ///   - PhoneNumber (string)    : Agent's contact phone number.
    ///   - Location (string)       : Geographic area the agent operates in.
    ///   - LicenseNumber (string)  : Real-estate license number.
    ///   - Bio (string)            : Short biography / profile description.
    ///   - LanguagesSpoken (string): Languages the agent speaks.
    ///   - YearsOfExperience (int) : Number of years working as an agent.
    ///   - IsAvailable (bool)      : Whether the agent is currently available.
    ///   - ProfileImageBase64 (string) : Base64-encoded profile picture.
    ///   - Contacts (ICollection&lt;ContactBook&gt;) : Navigation to the agent's contact records.
    ///
    /// Responsibility: exposes full CRUD plus filtering, pagination, related-data
    /// loading and validation endpoints for agents, delegating to <see cref="IAgentService"/>.
    /// </summary>
    [ApiController]
    [Route("api/agents")]
    public class AgentsController : ControllerBase
    {
        private readonly IAgentService _agentService;

        public AgentsController(IAgentService agentService)
        {
            _agentService = agentService;
        }

        // ====== CREATE ======

        /// <summary>
        /// Creates a new agent record. Accepts an Agent body and returns the created
        /// agent (with generated Id) along with a 201 Created location.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Agent agent)
        {
            if (agent == null)
                return BadRequest("Agent payload is required.");

            var created = await _agentService.CreateAgentAsync(agent);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // ====== READ ======

        /// <summary>
        /// Retrieves a single agent by its primary key (Id). Returns 404 if not found.
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var agent = await _agentService.GetAgentByIdAsync(id);
            if (agent == null)
                return NotFound();

            return Ok(agent);
        }

        /// <summary>
        /// Retrieves a single agent by their unique Email column. Returns 404 if not found.
        /// </summary>
        [HttpGet("by-email/{email}")]
        public async Task<IActionResult> GetByEmail(string email)
        {
            var agent = await _agentService.GetAgentByEmailAsync(email);
            if (agent == null)
                return NotFound();

            return Ok(agent);
        }

        /// <summary>
        /// Retrieves every agent in the system.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var agents = await _agentService.GetAllAgentsAsync();
            return Ok(agents);
        }

        /// <summary>
        /// Retrieves only agents whose IsAvailable column is true.
        /// </summary>
        [HttpGet("available")]
        public async Task<IActionResult> GetAvailable()
        {
            var agents = await _agentService.GetAvailableAgentsAsync();
            return Ok(agents);
        }

        /// <summary>
        /// Retrieves agents filtered by their Location column.
        /// </summary>
        [HttpGet("by-location/{location}")]
        public async Task<IActionResult> GetByLocation(string location)
        {
            var agents = await _agentService.GetAgentsByLocationAsync(location);
            return Ok(agents);
        }

        /// <summary>
        /// Retrieves agents whose YearsOfExperience column is greater than or equal to the supplied minimum.
        /// </summary>
        [HttpGet("by-experience/{minimumYears:int}")]
        public async Task<IActionResult> GetByExperience(int minimumYears)
        {
            var agents = await _agentService.GetAgentsByExperienceAsync(minimumYears);
            return Ok(agents);
        }

        /// <summary>
        /// Retrieves a single page of agents using pageNumber/pageSize query parameters.
        /// </summary>
        [HttpGet("paginated")]
        public async Task<IActionResult> GetPaginated([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var agents = await _agentService.GetAgentsPaginatedAsync(pageNumber, pageSize);
            return Ok(agents);
        }

        /// <summary>
        /// Returns the total number of agent records.
        /// </summary>
        [HttpGet("count")]
        public async Task<IActionResult> GetCount()
        {
            var count = await _agentService.GetAgentCountAsync();
            return Ok(count);
        }

        /// <summary>
        /// Retrieves an agent together with their related AgentBankAccount records.
        /// </summary>
        [HttpGet("{id:int}/bank-accounts")]
        public async Task<IActionResult> GetWithBankAccounts(int id)
        {
            var agent = await _agentService.GetAgentWithBankAccountsAsync(id);
            if (agent == null)
                return NotFound();

            return Ok(agent);
        }

        /// <summary>
        /// Retrieves an agent together with their related ContactBook records (Contacts navigation).
        /// </summary>
        [HttpGet("{id:int}/contacts")]
        public async Task<IActionResult> GetWithContacts(int id)
        {
            var agent = await _agentService.GetAgentWithContactsAsync(id);
            if (agent == null)
                return NotFound();

            return Ok(agent);
        }

        /// <summary>
        /// Retrieves an agent together with their related PropertyListing records.
        /// </summary>
        [HttpGet("{id:int}/listings")]
        public async Task<IActionResult> GetWithListings(int id)
        {
            var agent = await _agentService.GetAgentWithListingsAsync(id);
            if (agent == null)
                return NotFound();

            return Ok(agent);
        }

        // ====== UPDATE ======

        /// <summary>
        /// Fully updates an existing agent (all editable columns) identified by Id.
        /// Returns 404 if the agent does not exist.
        /// </summary>
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Agent agent)
        {
            if (agent == null)
                return BadRequest("Agent payload is required.");

            var updated = await _agentService.UpdateAgentAsync(id, agent);
            if (updated == null)
                return NotFound();

            return Ok(updated);
        }

        /// <summary>
        /// Updates only the IsAvailable column of an agent.
        /// </summary>
        [HttpPatch("{id:int}/availability")]
        public async Task<IActionResult> UpdateAvailability(int id, [FromQuery] bool isAvailable)
        {
            var success = await _agentService.UpdateAgentAvailabilityAsync(id, isAvailable);
            if (!success)
                return NotFound();

            return NoContent();
        }

        /// <summary>
        /// Updates only the Location column of an agent.
        /// </summary>
        [HttpPatch("{id:int}/location")]
        public async Task<IActionResult> UpdateLocation(int id, [FromQuery] string location)
        {
            var updated = await _agentService.UpdateAgentLocationAsync(id, location);
            if (updated == null)
                return NotFound();

            return Ok(updated);
        }

        // ====== DELETE ======

        /// <summary>
        /// Deletes an agent by its primary key (Id). Returns 404 if not found.
        /// </summary>
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _agentService.DeleteAgentAsync(id);
            if (!success)
                return NotFound();

            return NoContent();
        }

        /// <summary>
        /// Deletes an agent located by its Email column. Returns 404 if not found.
        /// </summary>
        [HttpDelete("by-email/{email}")]
        public async Task<IActionResult> DeleteByEmail(string email)
        {
            var success = await _agentService.DeleteAgentByEmailAsync(email);
            if (!success)
                return NotFound();

            return NoContent();
        }

        /// <summary>
        /// Bulk-deletes multiple agents from a list of Ids and returns the number deleted.
        /// </summary>
        [HttpDelete("bulk")]
        public async Task<IActionResult> DeleteMany([FromBody] IEnumerable<int> ids)
        {
            var deletedCount = await _agentService.DeleteAgentsAsync(ids);
            return Ok(new { deleted = deletedCount });
        }

        // ====== VALIDATION ======

        /// <summary>
        /// Checks whether an agent exists with the given Email column. Returns a boolean.
        /// </summary>
        [HttpGet("exists/by-email/{email}")]
        public async Task<IActionResult> ExistsByEmail(string email)
        {
            var exists = await _agentService.AgentExistsByEmailAsync(email);
            return Ok(exists);
        }

        /// <summary>
        /// Checks whether an agent exists with the given Id. Returns a boolean.
        /// </summary>
        [HttpGet("exists/{id:int}")]
        public async Task<IActionResult> ExistsById(int id)
        {
            var exists = await _agentService.AgentExistsByIdAsync(id);
            return Ok(exists);
        }
    }
}
