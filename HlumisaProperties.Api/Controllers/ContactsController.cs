using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace HlumisaProperties.Api.Controllers
{
    /// <summary>
    /// CQRS-style contact controller backed by <see cref="IContactService"/>. It performs all
    /// WRITE operations against the <see cref="Lead"/> entity and all READ operations against
    /// the <see cref="Customer"/> entity.
    ///
    /// Lead entity (writes) columns:
    ///   - Id, UserId, CreatedAt, UpdatedAt (from BaseEntity)
    ///   - FirstName, LastName, EmailAddress, PhoneNumber, Location (string)
    ///   - JsonCommunicationThread (string) : serialized message history
    ///   - LeadType (LeadType)              : Buyer / Seller / Refferal
    ///   - IsContacted (bool)               : contact flag
    ///
    /// Customer entity (reads) columns:
    ///   - Id, UserId, CreatedAt, UpdatedAt (from BaseEntity)
    ///   - FirstName, LastName, EmailAddress, PhoneNumber, Location (string)
    ///   - InterestType (CustomerType)      : Buying / Selling
    ///   - Contacts (ICollection&lt;ContactBook&gt;) : navigation to contact records
    ///
    /// Responsibility: lead creation/update/delete and status changes, plus customer lookups,
    /// searches and aggregate statistics.
    /// </summary>
    [ApiController]
    [Route("api/contacts")]
    public class ContactsController : ControllerBase
    {
        private readonly IContactService _contactService;

        public ContactsController(IContactService contactService)
        {
            _contactService = contactService;
        }

        // =========================
        // WRITES (Lead Entity)
        // =========================

        /// <summary>
        /// Creates a single lead record.
        /// </summary>
        [HttpPost("leads")]
        public async Task<IActionResult> CreateLead([FromBody] Lead lead)
        {
            if (lead == null)
                return BadRequest("Lead payload is required.");

            var created = await _contactService.CreateLeadAsync(lead);
            return Ok(created);
        }

        /// <summary>
        /// Creates multiple lead records in a single batch.
        /// </summary>
        [HttpPost("leads/bulk")]
        public async Task<IActionResult> CreateBulkLeads([FromBody] IEnumerable<Lead> leads)
        {
            if (leads == null)
                return BadRequest("Leads payload is required.");

            var created = await _contactService.CreateBulkLeadsAsync(leads);
            return Ok(created);
        }

        /// <summary>
        /// Updates an existing lead (all editable columns). Returns 404 if the lead is not found.
        /// </summary>
        [HttpPut("leads")]
        public async Task<IActionResult> UpdateLead([FromBody] Lead lead)
        {
            if (lead == null)
                return BadRequest("Lead payload is required.");

            var success = await _contactService.UpdateLeadAsync(lead);
            if (!success)
                return NotFound();

            return NoContent();
        }

        /// <summary>
        /// Sets a lead's IsContacted column to true.
        /// </summary>
        [HttpPatch("leads/{leadId:int}/mark-contacted")]
        public async Task<IActionResult> MarkLeadAsContacted(int leadId)
        {
            var success = await _contactService.MarkLeadAsContactedAsync(leadId);
            if (!success)
                return NotFound();

            return NoContent();
        }

        /// <summary>
        /// Sets a lead's IsContacted column to false.
        /// </summary>
        [HttpPatch("leads/{leadId:int}/mark-uncontacted")]
        public async Task<IActionResult> MarkLeadAsUncontacted(int leadId)
        {
            var success = await _contactService.MarkLeadAsUncontactedAsync(leadId);
            if (!success)
                return NotFound();

            return NoContent();
        }

        /// <summary>
        /// Replaces a lead's JsonCommunicationThread column with the supplied serialized thread.
        /// </summary>
        [HttpPatch("leads/{leadId:int}/communication-thread")]
        public async Task<IActionResult> UpdateCommunicationThread(int leadId, [FromBody] string jsonCommunicationThread)
        {
            var success = await _contactService.UpdateCommunicationThreadAsync(leadId, jsonCommunicationThread);
            if (!success)
                return NotFound();

            return NoContent();
        }

        /// <summary>
        /// Updates a lead's LeadType column (Buyer / Seller / Refferal).
        /// </summary>
        [HttpPatch("leads/{leadId:int}/type")]
        public async Task<IActionResult> UpdateLeadType(int leadId, [FromQuery] LeadType leadType)
        {
            var success = await _contactService.UpdateLeadTypeAsync(leadId, leadType);
            if (!success)
                return NotFound();

            return NoContent();
        }

        /// <summary>
        /// Deletes a lead by its Id. Returns 404 if not found.
        /// </summary>
        [HttpDelete("leads/{leadId:int}")]
        public async Task<IActionResult> DeleteLead(int leadId)
        {
            var success = await _contactService.DeleteLeadAsync(leadId);
            if (!success)
                return NotFound();

            return NoContent();
        }

        // =========================
        // READS (Customer Entity)
        // =========================

        /// <summary>
        /// Retrieves a single customer by its primary key (Id). Returns 404 if not found.
        /// </summary>
        [HttpGet("customers/{customerId:int}")]
        public async Task<IActionResult> GetCustomerById(int customerId)
        {
            var customer = await _contactService.GetCustomerByIdAsync(customerId);
            if (customer == null)
                return NotFound();

            return Ok(customer);
        }

        /// <summary>
        /// Retrieves every customer in the system.
        /// </summary>
        [HttpGet("customers")]
        public async Task<IActionResult> GetAllCustomers()
        {
            var customers = await _contactService.GetAllCustomersAsync();
            return Ok(customers);
        }

        /// <summary>
        /// Retrieves customers filtered by their InterestType column (Buying / Selling).
        /// </summary>
        [HttpGet("customers/by-interest-type/{customerType}")]
        public async Task<IActionResult> GetCustomersByInterestType(CustomerType customerType)
        {
            var customers = await _contactService.GetCustomersByInterestTypeAsync(customerType);
            return Ok(customers);
        }

        /// <summary>
        /// Searches customers by the Location column.
        /// </summary>
        [HttpGet("customers/search/by-location/{location}")]
        public async Task<IActionResult> SearchCustomersByLocation(string location)
        {
            var customers = await _contactService.SearchCustomersByLocationAsync(location);
            return Ok(customers);
        }

        /// <summary>
        /// Searches customers by name keyword (matches FirstName/LastName).
        /// </summary>
        [HttpGet("customers/search/by-name/{keyword}")]
        public async Task<IActionResult> SearchCustomersByName(string keyword)
        {
            var customers = await _contactService.SearchCustomersByNameAsync(keyword);
            return Ok(customers);
        }

        /// <summary>
        /// Retrieves a customer located by their EmailAddress column. Returns 404 if not found.
        /// </summary>
        [HttpGet("customers/by-email/{emailAddress}")]
        public async Task<IActionResult> GetCustomerByEmail(string emailAddress)
        {
            var customer = await _contactService.GetCustomerByEmailAsync(emailAddress);
            if (customer == null)
                return NotFound();

            return Ok(customer);
        }

        /// <summary>
        /// Retrieves a customer located by their PhoneNumber column. Returns 404 if not found.
        /// </summary>
        [HttpGet("customers/by-phone/{phoneNumber}")]
        public async Task<IActionResult> GetCustomerByPhoneNumber(string phoneNumber)
        {
            var customer = await _contactService.GetCustomerByPhoneNumberAsync(phoneNumber);
            if (customer == null)
                return NotFound();

            return Ok(customer);
        }

        // =========================
        // BUSINESS LOGIC
        // =========================

        /// <summary>
        /// Checks whether a customer exists with the given EmailAddress. Returns a boolean.
        /// </summary>
        [HttpGet("customers/exists/{emailAddress}")]
        public async Task<IActionResult> CustomerExists(string emailAddress)
        {
            var exists = await _contactService.CustomerExistsAsync(emailAddress);
            return Ok(exists);
        }

        /// <summary>
        /// Returns the total number of customer records.
        /// </summary>
        [HttpGet("customers/count")]
        public async Task<IActionResult> GetTotalCustomerCount()
        {
            var count = await _contactService.GetTotalCustomerCountAsync();
            return Ok(count);
        }

        /// <summary>
        /// Returns the number of customers whose InterestType is Buying.
        /// </summary>
        [HttpGet("customers/count/buying")]
        public async Task<IActionResult> GetBuyingCustomerCount()
        {
            var count = await _contactService.GetBuyingCustomerCountAsync();
            return Ok(count);
        }

        /// <summary>
        /// Returns the number of customers whose InterestType is Selling.
        /// </summary>
        [HttpGet("customers/count/selling")]
        public async Task<IActionResult> GetSellingCustomerCount()
        {
            var count = await _contactService.GetSellingCustomerCountAsync();
            return Ok(count);
        }

        /// <summary>
        /// Returns a breakdown of customer counts grouped by CustomerType (Buying/Selling).
        /// </summary>
        [HttpGet("customers/statistics")]
        public async Task<IActionResult> GetCustomerStatistics()
        {
            var stats = await _contactService.GetCustomerStatisticsAsync();
            return Ok(stats);
        }
    }
}
