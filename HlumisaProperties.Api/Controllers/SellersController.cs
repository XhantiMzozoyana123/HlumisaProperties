using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace HlumisaProperties.Api.Controllers
{
    /// <summary>
    /// Manages the <see cref="Seller"/> entity (active and discarded seller leads).
    ///
    /// Entity: Seller (inherits BaseEntity)
    /// Columns:
    ///   - Id (int)             : Primary key (from BaseEntity).
    ///   - UserId (string)      : Owning application user id (from BaseEntity).
    ///   - CreatedAt (DateTime) : Record creation timestamp (from BaseEntity).
    ///   - UpdatedAt (DateTime) : Last modification timestamp (from BaseEntity).
    ///   - FirstName (string)   : Seller's first name.
    ///   - LastName (string)    : Seller's last name.
    ///   - PhoneNumber (string) : Contact number.
    ///   - Location (string)    : Area of property.
    ///   - PropertyType (string): e.g. House, Apartment.
    ///   - EstimatedValue (string) : Asking price.
    ///   - IsContacted (bool)   : Whether the seller has been contacted.
    ///   - IsDiscarded (bool)   : Whether the seller is discarded.
    ///   - StatusColor (string) : UI status indicator (white/red/green).
    ///
    /// Responsibility: exposes CRUD plus contact/discard/color-cycle actions via <see cref="ISellerService"/>.
    /// </summary>
    [ApiController]
    [Route("api/sellers")]
    public class SellersController : ControllerBase
    {
        private readonly ISellerService _sellerService;

        public SellersController(ISellerService sellerService)
        {
            _sellerService = sellerService;
        }

        // ====== CREATE ======

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Seller seller)
        {
            if (seller == null)
                return BadRequest("Seller payload is required.");

            var created = await _sellerService.CreateSellerAsync(seller);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // ====== READ ======

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var seller = await _sellerService.GetSellerByIdAsync(id);
            if (seller == null)
                return NotFound();

            return Ok(seller);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var sellers = await _sellerService.GetAllSellersAsync();
            return Ok(sellers);
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActive()
        {
            var sellers = await _sellerService.GetActiveSellersAsync();
            return Ok(sellers);
        }

        [HttpGet("discarded")]
        public async Task<IActionResult> GetDiscarded()
        {
            var sellers = await _sellerService.GetDiscardedSellersAsync();
            return Ok(sellers);
        }

        // ====== UPDATE ======

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Seller seller)
        {
            if (seller == null)
                return BadRequest("Seller payload is required.");

            seller.Id = id;
            var success = await _sellerService.UpdateSellerAsync(seller);
            if (!success)
                return NotFound();

            return NoContent();
        }

        [HttpPatch("{id:int}/mark-contacted")]
        public async Task<IActionResult> MarkAsContacted(int id)
        {
            var success = await _sellerService.MarkSellerAsContactedAsync(id);
            if (!success)
                return NotFound();

            return NoContent();
        }

        [HttpPatch("{id:int}/discard")]
        public async Task<IActionResult> ToggleDiscard(int id)
        {
            var success = await _sellerService.ToggleDiscardSellerAsync(id);
            if (!success)
                return NotFound();

            return NoContent();
        }

        [HttpPatch("{id:int}/cycle-status")]
        public async Task<IActionResult> CycleStatusColor(int id)
        {
            var success = await _sellerService.CycleSellerStatusColorAsync(id);
            if (!success)
                return NotFound();

            return NoContent();
        }

        // ====== DELETE ======

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _sellerService.DeleteSellerAsync(id);
            if (!success)
                return NotFound();

            return NoContent();
        }
    }
}