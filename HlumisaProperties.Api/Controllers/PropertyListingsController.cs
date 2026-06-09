using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace HlumisaProperties.Api.Controllers
{
    /// <summary>
    /// Manages the <see cref="PropertyListing"/> entity (properties listed for sale or rent).
    ///
    /// Entity: PropertyListing (inherits BaseEntity)
    /// Columns:
    ///   - Id (int)             : Primary key (from BaseEntity).
    ///   - UserId (string)      : Owning application user id (from BaseEntity).
    ///   - CreatedAt (DateTime) : Record creation timestamp (from BaseEntity).
    ///   - UpdatedAt (DateTime) : Last modification timestamp (from BaseEntity).
    ///   - Title (string)       : Listing title.
    ///   - Description (string) : Listing description.
    ///   - PropertyType (string): e.g. House, Apartment, Land, Commercial.
    ///   - ListingType (string) : e.g. Sale, Rent.
    ///   - Price (decimal)      : Asking price / rental amount.
    ///   - Location (string)    : Property location.
    ///   - Bedrooms (int)       : Number of bedrooms.
    ///   - Bathrooms (int)      : Number of bathrooms.
    ///   - SizeInSqm (double)   : Floor/land area in square metres.
    ///   - IsAvailable (bool)   : Whether the property is still available.
    ///   - AgentId (int)        : Foreign key to the listing Agent.
    ///   - Agent (Agent)        : Navigation to the agent.
    ///   - LeadId (int?)        : Optional foreign key to an associated Lead.
    ///   - Lead (Lead)          : Navigation to the associated lead.
    ///
    /// Responsibility: exposes CRUD plus availability-, agent-, lead-, type-, location- and
    /// price-range queries for property listings via <see cref="IPropertyListingService"/>.
    /// </summary>
    [ApiController]
    [Route("api/property-listings")]
    public class PropertyListingsController : ControllerBase
    {
        private readonly IPropertyListingService _propertyListingService;

        public PropertyListingsController(IPropertyListingService propertyListingService)
        {
            _propertyListingService = propertyListingService;
        }

        // ====== CREATE ======

        /// <summary>
        /// Creates a new property listing and returns it with a 201 Created location.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PropertyListing propertyListing)
        {
            if (propertyListing == null)
                return BadRequest("PropertyListing payload is required.");

            var created = await _propertyListingService.CreatePropertyListingAsync(propertyListing);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // ====== READ ======

        /// <summary>
        /// Retrieves a single property listing by its primary key (Id). Returns 404 if not found.
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var listing = await _propertyListingService.GetPropertyListingByIdAsync(id);
            if (listing == null)
                return NotFound();

            return Ok(listing);
        }

        /// <summary>
        /// Retrieves every property listing in the system.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var listings = await _propertyListingService.GetAllPropertyListingsAsync();
            return Ok(listings);
        }

        /// <summary>
        /// Retrieves only listings whose IsAvailable column is true.
        /// </summary>
        [HttpGet("available")]
        public async Task<IActionResult> GetAvailable()
        {
            var listings = await _propertyListingService.GetAvailablePropertyListingsAsync();
            return Ok(listings);
        }

        /// <summary>
        /// Retrieves all listings belonging to a given agent (filtered by AgentId).
        /// </summary>
        [HttpGet("by-agent/{agentId:int}")]
        public async Task<IActionResult> GetByAgentId(int agentId)
        {
            var listings = await _propertyListingService.GetPropertyListingsByAgentIdAsync(agentId);
            return Ok(listings);
        }

        /// <summary>
        /// Retrieves all listings associated with a given lead (filtered by LeadId).
        /// </summary>
        [HttpGet("by-lead/{leadId:int}")]
        public async Task<IActionResult> GetByLeadId(int leadId)
        {
            var listings = await _propertyListingService.GetPropertyListingsByLeadIdAsync(leadId);
            return Ok(listings);
        }

        /// <summary>
        /// Retrieves listings filtered by the PropertyType column (House, Apartment, etc.).
        /// </summary>
        [HttpGet("by-type/{propertyType}")]
        public async Task<IActionResult> GetByType(string propertyType)
        {
            var listings = await _propertyListingService.GetPropertyListingsByTypeAsync(propertyType);
            return Ok(listings);
        }

        /// <summary>
        /// Retrieves listings filtered by the ListingType column (Sale / Rent).
        /// </summary>
        [HttpGet("by-listing-type/{listingType}")]
        public async Task<IActionResult> GetByListingType(string listingType)
        {
            var listings = await _propertyListingService.GetPropertyListingsByListingTypeAsync(listingType);
            return Ok(listings);
        }

        /// <summary>
        /// Retrieves listings filtered by the Location column.
        /// </summary>
        [HttpGet("by-location/{location}")]
        public async Task<IActionResult> GetByLocation(string location)
        {
            var listings = await _propertyListingService.GetPropertyListingsByLocationAsync(location);
            return Ok(listings);
        }

        /// <summary>
        /// Retrieves listings whose Price column falls between the supplied minimum and maximum.
        /// </summary>
        [HttpGet("by-price-range")]
        public async Task<IActionResult> GetByPriceRange([FromQuery] decimal minPrice, [FromQuery] decimal maxPrice)
        {
            var listings = await _propertyListingService.GetPropertyListingsByPriceRangeAsync(minPrice, maxPrice);
            return Ok(listings);
        }

        // ====== UPDATE ======

        /// <summary>
        /// Updates an existing property listing. The route Id is applied to the body before saving.
        /// Returns 404 if the listing does not exist.
        /// </summary>
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] PropertyListing propertyListing)
        {
            if (propertyListing == null)
                return BadRequest("PropertyListing payload is required.");

            propertyListing.Id = id;
            var updated = await _propertyListingService.UpdatePropertyListingAsync(propertyListing);
            if (updated == null)
                return NotFound();

            return Ok(updated);
        }

        // ====== DELETE ======

        /// <summary>
        /// Deletes a property listing by its primary key (Id). Returns 404 if not found.
        /// </summary>
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _propertyListingService.DeletePropertyListingAsync(id);
            if (!success)
                return NotFound();

            return NoContent();
        }
    }
}
