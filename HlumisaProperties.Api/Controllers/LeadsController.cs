using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace HlumisaProperties.Api.Controllers
{
    /// <summary>
    /// Manages the <see cref="Lead"/> entity (prospective buyers/sellers captured before becoming customers).
    ///
    /// Entity: Lead (inherits BaseEntity)
    /// Columns:
    ///   - Id (int)                        : Primary key (from BaseEntity).
    ///   - UserId (string)                 : Owning application user id (from BaseEntity).
    ///   - CreatedAt (DateTime)            : Record creation timestamp (from BaseEntity).
    ///   - UpdatedAt (DateTime)            : Last modification timestamp (from BaseEntity).
    ///   - FirstName (string)              : Lead's first name.
    ///   - LastName (string)               : Lead's last name.
    ///   - EmailAddress (string)           : Lead's email address.
    ///   - PhoneNumber (string)            : Lead's phone number.
    ///   - Location (string)               : Lead's location of interest.
    ///   - JsonCommunicationThread (string): Serialized history of messages with the lead.
    ///   - LeadType (LeadType)             : Buyer / Seller / Refferal.
    ///   - IsContacted (bool)              : Whether the lead has been contacted yet.
    ///
    /// Responsibility: exposes CRUD plus type-, contact-status- and location-based queries
    /// for leads via <see cref="ILeadService"/>.
    /// </summary>
    [ApiController]
    [Route("api/leads")]
    public class LeadsController : ControllerBase
    {
        private readonly ILeadService _leadService;

        public LeadsController(ILeadService leadService)
        {
            _leadService = leadService;
        }

        // ====== CREATE ======

        /// <summary>
        /// Creates a new lead and returns it with a 201 Created location.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Lead lead)
        {
            if (lead == null)
                return BadRequest("Lead payload is required.");

            var created = await _leadService.CreateLeadAsync(lead);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // ====== READ ======

        /// <summary>
        /// Retrieves a single lead by its primary key (Id). Returns 404 if not found.
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var lead = await _leadService.GetLeadByIdAsync(id);
            if (lead == null)
                return NotFound();

            return Ok(lead);
        }

        /// <summary>
        /// Retrieves every lead in the system.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var leads = await _leadService.GetAllLeadsAsync();
            return Ok(leads);
        }

        /// <summary>
        /// Retrieves leads filtered by their LeadType column (Buyer / Seller / Refferal).
        /// </summary>
        [HttpGet("by-type/{leadType}")]
        public async Task<IActionResult> GetByType(LeadType leadType)
        {
            var leads = await _leadService.GetLeadsByTypeAsync(leadType);
            return Ok(leads);
        }

        /// <summary>
        /// Retrieves leads that have already been contacted (IsContacted = true).
        /// </summary>
        [HttpGet("contacted")]
        public async Task<IActionResult> GetContacted()
        {
            var leads = await _leadService.GetContactedLeadsAsync();
            return Ok(leads);
        }

        /// <summary>
        /// Retrieves leads that have not yet been contacted (IsContacted = false).
        /// </summary>
        [HttpGet("uncontacted")]
        public async Task<IActionResult> GetUncontacted()
        {
            var leads = await _leadService.GetUncontactedLeadsAsync();
            return Ok(leads);
        }

        /// <summary>
        /// Retrieves leads filtered by their Location column.
        /// </summary>
        [HttpGet("by-location/{location}")]
        public async Task<IActionResult> GetByLocation(string location)
        {
            var leads = await _leadService.GetLeadsByLocationAsync(location);
            return Ok(leads);
        }

        // ====== UPDATE ======

        /// <summary>
        /// Updates an existing lead. The route Id is applied to the body before saving.
        /// Returns 404 if the lead does not exist.
        /// </summary>
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Lead lead)
        {
            if (lead == null)
                return BadRequest("Lead payload is required.");

            lead.Id = id;
            var updated = await _leadService.UpdateLeadAsync(lead);
            if (updated == null)
                return NotFound();

            return Ok(updated);
        }

        // ====== DELETE ======

        /// <summary>
        /// Deletes a lead by its primary key (Id). Returns 404 if not found.
        /// </summary>
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _leadService.DeleteLeadAsync(id);
            if (!success)
                return NotFound();

            return NoContent();
        }
    }
}
