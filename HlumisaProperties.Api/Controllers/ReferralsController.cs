using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HlumisaProperties.Api.Controllers
{
    /// <summary>
    /// Manages referrals — records of people referred to Hlumisa Properties.
    ///
    /// Entity: Referral (inherits BaseEntity)
    /// Columns:
    ///   - Id (int)              : Primary key (from BaseEntity).
    ///   - UserId (string)       : Owning application user id (from BaseEntity).
    ///   - CreatedAt (DateTime)  : Record creation timestamp (from BaseEntity).
    ///   - UpdatedAt (DateTime)  : Last modification timestamp (from BaseEntity).
    ///   - ReferrerName (string) : Name of the person making the referral.
    ///   - ReferrerPhone (string): Phone number of the referrer.
    ///   - ReferrerAddress (string): Address of the referrer.
    ///   - ReferredName (string) : Name of the person being referred.
    ///   - ReferredPhone (string): Phone number of the referred person.
    ///   - ReferredAddress (string): Address of the referred person.
    ///   - Intent (string)       : "buy" or "sell".
    ///   - Note (string)         : Notes about the referral.
    ///   - Date (string)         : Date the referral was created (ISO format).
    ///   - IsDiscarded (bool)    : Whether the referral has been greyed out/discarded.
    ///
    /// Responsibility: exposes CRUD plus toggle-discard for referrals
    /// via <see cref="IReferralService"/>.
    /// </summary>
    [ApiController]
    [Route("api/referrals")]
    public class ReferralsController : ControllerBase
    {
        private readonly IReferralService _referralService;

        public ReferralsController(IReferralService referralService)
        {
            _referralService = referralService;
        }

        // ====== CREATE (PUBLIC - for landing page) ======

        /// <summary>
        /// Public endpoint to create a new referral from the landing page. No authentication required.
        /// </summary>
        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Referral referral)
        {
            if (referral == null)
                return BadRequest("Referral payload is required.");

            var created = await _referralService.CreateAsync(referral);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // ====== READ (AUTHENTICATED) ======

        /// <summary>
        /// Retrieves a single referral by its primary key (Id). Returns 404 if not found.
        /// </summary>
        [Authorize]
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var referral = await _referralService.GetByIdAsync(id);
            if (referral == null)
                return NotFound();

            return Ok(referral);
        }

        /// <summary>
        /// Retrieves every referral in the system.
        /// </summary>
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var referrals = await _referralService.GetAllAsync();
            return Ok(referrals);
        }

        /// <summary>
        /// Retrieves only active (non-discarded) referrals.
        /// </summary>
        [Authorize]
        [HttpGet("active")]
        public async Task<IActionResult> GetActive()
        {
            var referrals = await _referralService.GetActiveAsync();
            return Ok(referrals);
        }

        // ====== UPDATE (AUTHENTICATED) ======

        /// <summary>
        /// Updates an existing referral. The route Id is applied to the body before saving.
        /// Returns 404 if the referral does not exist.
        /// </summary>
        [Authorize]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Referral referral)
        {
            if (referral == null)
                return BadRequest("Referral payload is required.");

            referral.Id = id;
            var updated = await _referralService.UpdateAsync(referral);
            if (updated == null)
                return NotFound();

            return Ok(updated);
        }

        /// <summary>
        /// Toggles the IsDiscarded flag on a referral (grey out / un-grey).
        /// </summary>
        [Authorize]
        [HttpPatch("{id:int}/toggle-discard")]
        public async Task<IActionResult> ToggleDiscard(int id)
        {
            var updated = await _referralService.ToggleDiscardedAsync(id);
            if (updated == null)
                return NotFound();

            return Ok(updated);
        }

        // ====== DELETE (AUTHENTICATED) ======

        /// <summary>
        /// Deletes a referral by its primary key (Id). Returns 404 if not found.
        /// </summary>
        [Authorize]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _referralService.DeleteAsync(id);
            if (!success)
                return NotFound();

            return NoContent();
        }
    }
}