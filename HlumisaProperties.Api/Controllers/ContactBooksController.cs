using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace HlumisaProperties.Api.Controllers
{
    /// <summary>
    /// Manages the <see cref="ContactBook"/> entity (messages/enquiries linking a customer to an agent).
    ///
    /// Entity: ContactBook (inherits BaseEntity)
    /// Columns:
    ///   - Id (int)              : Primary key (from BaseEntity).
    ///   - UserId (string)       : Owning application user id (from BaseEntity).
    ///   - CreatedAt (DateTime)  : Record creation timestamp (from BaseEntity).
    ///   - UpdatedAt (DateTime)  : Last modification timestamp (from BaseEntity).
    ///   - CustomerId (int)      : Foreign key to the related Customer.
    ///   - Customer (Customer)   : Navigation to the related customer.
    ///   - AgentId (int)         : Foreign key to the related Agent.
    ///   - Agent (Agent)         : Navigation to the related agent.
    ///   - Message (string)      : The contact/enquiry message text.
    ///   - IsResolved (bool)     : Whether the enquiry has been handled.
    ///
    /// Responsibility: exposes CRUD plus customer-, agent- and resolution-status queries
    /// for contact records via <see cref="IContactBookService"/>.
    /// </summary>
    [ApiController]
    [Route("api/contact-books")]
    public class ContactBooksController : ControllerBase
    {
        private readonly IContactBookService _contactBookService;

        public ContactBooksController(IContactBookService contactBookService)
        {
            _contactBookService = contactBookService;
        }

        // ====== CREATE ======

        /// <summary>
        /// Creates a new contact book record and returns it with a 201 Created location.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ContactBook contactBook)
        {
            if (contactBook == null)
                return BadRequest("ContactBook payload is required.");

            var created = await _contactBookService.CreateContactBookAsync(contactBook);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // ====== READ ======

        /// <summary>
        /// Retrieves a single contact record by its primary key (Id). Returns 404 if not found.
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var contactBook = await _contactBookService.GetContactBookByIdAsync(id);
            if (contactBook == null)
                return NotFound();

            return Ok(contactBook);
        }

        /// <summary>
        /// Retrieves every contact record in the system.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var contactBooks = await _contactBookService.GetAllContactBooksAsync();
            return Ok(contactBooks);
        }

        /// <summary>
        /// Retrieves all contact records for a given customer (filtered by CustomerId).
        /// </summary>
        [HttpGet("by-customer/{customerId:int}")]
        public async Task<IActionResult> GetByCustomerId(int customerId)
        {
            var contactBooks = await _contactBookService.GetContactBooksByCustomerIdAsync(customerId);
            return Ok(contactBooks);
        }

        /// <summary>
        /// Retrieves all contact records for a given agent (filtered by AgentId).
        /// </summary>
        [HttpGet("by-agent/{agentId:int}")]
        public async Task<IActionResult> GetByAgentId(int agentId)
        {
            var contactBooks = await _contactBookService.GetContactBooksByAgentIdAsync(agentId);
            return Ok(contactBooks);
        }

        /// <summary>
        /// Retrieves contact records that are still open (IsResolved = false).
        /// </summary>
        [HttpGet("unresolved")]
        public async Task<IActionResult> GetUnresolved()
        {
            var contactBooks = await _contactBookService.GetUnresolvedContactBooksAsync();
            return Ok(contactBooks);
        }

        // ====== UPDATE ======

        /// <summary>
        /// Updates an existing contact record. The route Id is applied to the body before saving.
        /// Returns 404 if the record does not exist.
        /// </summary>
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] ContactBook contactBook)
        {
            if (contactBook == null)
                return BadRequest("ContactBook payload is required.");

            contactBook.Id = id;
            var updated = await _contactBookService.UpdateContactBookAsync(contactBook);
            if (updated == null)
                return NotFound();

            return Ok(updated);
        }

        // ====== DELETE ======

        /// <summary>
        /// Deletes a contact record by its primary key (Id). Returns 404 if not found.
        /// </summary>
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _contactBookService.DeleteContactBookAsync(id);
            if (!success)
                return NotFound();

            return NoContent();
        }
    }
}
