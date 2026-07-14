using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HlumisaProperties.Api.Controllers
{
    /// <summary>
    /// Manages the <see cref="Buyer"/> entity (active and discarded buyer leads).
    ///
    /// Entity: Buyer (inherits BaseEntity)
    /// Columns:
    ///   - Id (int)             : Primary key (from BaseEntity).
    ///   - UserId (string)      : Owning application user id (from BaseEntity).
    ///   - CreatedAt (DateTime) : Record creation timestamp (from BaseEntity).
    ///   - UpdatedAt (DateTime) : Last modification timestamp (from BaseEntity).
    ///   - FirstName (string)   : Buyer's first name.
    ///   - LastName (string)    : Buyer's last name.
    ///   - PhoneNumber (string) : Contact number.
    ///   - Location (string)    : Area of interest.
    ///   - Budget (string)      : Price range.
    ///   - PropertyType (string): e.g. House, Apartment.
    ///   - IsContacted (bool)   : Whether the buyer has been contacted.
    ///   - IsDiscarded (bool)   : Whether the buyer is discarded.
    ///
    /// Responsibility: exposes CRUD plus contact/discard actions via <see cref="IBuyerService"/>.
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/buyers")]
    public class BuyersController : ControllerBase
    {
        private readonly IBuyerService _buyerService;

        public BuyersController(IBuyerService buyerService)
        {
            _buyerService = buyerService;
        }

        // ====== CREATE ======

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Buyer buyer)
        {
            if (buyer == null)
                return BadRequest("Buyer payload is required.");

            var created = await _buyerService.CreateBuyerAsync(buyer);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // ====== READ ======

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var buyer = await _buyerService.GetBuyerByIdAsync(id);
            if (buyer == null)
                return NotFound();

            return Ok(buyer);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var buyers = await _buyerService.GetAllBuyersAsync();
            return Ok(buyers);
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActive()
        {
            var buyers = await _buyerService.GetActiveBuyersAsync();
            return Ok(buyers);
        }

        [HttpGet("discarded")]
        public async Task<IActionResult> GetDiscarded()
        {
            var buyers = await _buyerService.GetDiscardedBuyersAsync();
            return Ok(buyers);
        }

        // ====== UPDATE ======

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Buyer buyer)
        {
            if (buyer == null)
                return BadRequest("Buyer payload is required.");

            buyer.Id = id;
            var success = await _buyerService.UpdateBuyerAsync(buyer);
            if (!success)
                return NotFound();

            return NoContent();
        }

        [HttpPatch("{id:int}/mark-contacted")]
        public async Task<IActionResult> MarkAsContacted(int id)
        {
            var success = await _buyerService.MarkBuyerAsContactedAsync(id);
            if (!success)
                return NotFound();

            return NoContent();
        }

        [HttpPatch("{id:int}/discard")]
        public async Task<IActionResult> ToggleDiscard(int id)
        {
            var success = await _buyerService.ToggleDiscardBuyerAsync(id);
            if (!success)
                return NotFound();

            return NoContent();
        }

        // ====== DELETE ======

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _buyerService.DeleteBuyerAsync(id);
            if (!success)
                return NotFound();

            return NoContent();
        }
    }
}