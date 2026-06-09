using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace HlumisaProperties.Api.Controllers
{
    /// <summary>
    /// Manages the <see cref="Meeting"/> entity (appointments between agents, customers and properties).
    ///
    /// Entity: Meeting (inherits BaseEntity)
    /// Columns:
    ///   - Id (int)                       : Primary key (from BaseEntity).
    ///   - UserId (string)                : Owning application user id (from BaseEntity).
    ///   - CreatedAt (DateTime)           : Record creation timestamp (from BaseEntity).
    ///   - UpdatedAt (DateTime)           : Last modification timestamp (from BaseEntity).
    ///   - Title (string)                 : Title of the meeting.
    ///   - Description (string)           : Details of the meeting.
    ///   - ScheduledDate (DateTime)       : When the meeting is scheduled.
    ///   - Duration (TimeSpan)            : How long the meeting lasts.
    ///   - Location (string)              : Physical address or online platform.
    ///   - MeetingType (string)           : e.g. Property Viewing, Consultation, Negotiation.
    ///   - Status (string)                : e.g. Scheduled, Completed, Cancelled, Rescheduled.
    ///   - AgentId (int)                  : Foreign key to the Agent.
    ///   - Agent (Agent)                  : Navigation to the agent.
    ///   - CustomerId (int)               : Foreign key to the Customer.
    ///   - Customer (Customer)            : Navigation to the customer.
    ///   - PropertyListingId (int?)       : Optional foreign key to the PropertyListing.
    ///   - PropertyListing (PropertyListing): Navigation to the related property.
    ///
    /// Responsibility: exposes scheduling, retrieval (by id/agent/customer/property/date-range),
    /// updates (full/reschedule/status), cancel/delete and availability/conflict checks via
    /// <see cref="IMeetingService"/>.
    /// </summary>
    [ApiController]
    [Route("api/meetings")]
    public class MeetingsController : ControllerBase
    {
        private readonly IMeetingService _meetingService;

        public MeetingsController(IMeetingService meetingService)
        {
            _meetingService = meetingService;
        }

        // ====== CREATE ======

        /// <summary>
        /// Schedules (creates) a new meeting and returns it with a 201 Created location.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Meeting meeting)
        {
            if (meeting == null)
                return BadRequest("Meeting payload is required.");

            var created = await _meetingService.ScheduleMeetingAsync(meeting);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // ====== READ ======

        /// <summary>
        /// Retrieves a single meeting by its primary key (Id). Returns 404 if not found.
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var meeting = await _meetingService.GetMeetingByIdAsync(id);
            if (meeting == null)
                return NotFound();

            return Ok(meeting);
        }

        /// <summary>
        /// Retrieves every meeting in the system.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var meetings = await _meetingService.GetAllMeetingsAsync();
            return Ok(meetings);
        }

        /// <summary>
        /// Retrieves all meetings for a given agent (filtered by AgentId).
        /// </summary>
        [HttpGet("by-agent/{agentId:int}")]
        public async Task<IActionResult> GetByAgent(int agentId)
        {
            var meetings = await _meetingService.GetMeetingsByAgentAsync(agentId);
            return Ok(meetings);
        }

        /// <summary>
        /// Retrieves all meetings for a given customer (filtered by CustomerId).
        /// </summary>
        [HttpGet("by-customer/{customerId:int}")]
        public async Task<IActionResult> GetByCustomer(int customerId)
        {
            var meetings = await _meetingService.GetMeetingsByCustomerAsync(customerId);
            return Ok(meetings);
        }

        /// <summary>
        /// Retrieves all meetings tied to a given property (filtered by PropertyListingId).
        /// </summary>
        [HttpGet("by-property/{propertyListingId:int}")]
        public async Task<IActionResult> GetByProperty(int propertyListingId)
        {
            var meetings = await _meetingService.GetMeetingsByPropertyAsync(propertyListingId);
            return Ok(meetings);
        }

        /// <summary>
        /// Retrieves meetings whose ScheduledDate falls within the given start/end range.
        /// </summary>
        [HttpGet("by-date-range")]
        public async Task<IActionResult> GetByDateRange([FromQuery] DateTime start, [FromQuery] DateTime end)
        {
            var meetings = await _meetingService.GetMeetingsByDateRangeAsync(start, end);
            return Ok(meetings);
        }

        // ====== UPDATE ======

        /// <summary>
        /// Updates an existing meeting (all editable columns). The route Id is applied to the
        /// body before saving. Returns 404 if the meeting does not exist.
        /// </summary>
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Meeting meeting)
        {
            if (meeting == null)
                return BadRequest("Meeting payload is required.");

            meeting.Id = id;
            var success = await _meetingService.UpdateMeetingAsync(meeting);
            if (!success)
                return NotFound();

            return NoContent();
        }

        /// <summary>
        /// Reschedules a meeting by updating its ScheduledDate and Duration columns.
        /// </summary>
        [HttpPatch("{id:int}/reschedule")]
        public async Task<IActionResult> Reschedule(int id, [FromQuery] DateTime newDate, [FromQuery] TimeSpan newDuration)
        {
            var success = await _meetingService.RescheduleMeetingAsync(id, newDate, newDuration);
            if (!success)
                return NotFound();

            return NoContent();
        }

        /// <summary>
        /// Updates only the Status column of a meeting (e.g. Completed, Cancelled).
        /// </summary>
        [HttpPatch("{id:int}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromQuery] string status)
        {
            var success = await _meetingService.UpdateMeetingStatusAsync(id, status);
            if (!success)
                return NotFound();

            return NoContent();
        }

        // ====== DELETE / CANCEL ======

        /// <summary>
        /// Cancels a meeting (sets its Status to Cancelled) without removing the record.
        /// </summary>
        [HttpPatch("{id:int}/cancel")]
        public async Task<IActionResult> Cancel(int id)
        {
            var success = await _meetingService.CancelMeetingAsync(id);
            if (!success)
                return NotFound();

            return NoContent();
        }

        /// <summary>
        /// Permanently deletes a meeting by its primary key (Id). Returns 404 if not found.
        /// </summary>
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _meetingService.DeleteMeetingAsync(id);
            if (!success)
                return NotFound();

            return NoContent();
        }

        // ====== BUSINESS LOGIC ======

        /// <summary>
        /// Checks whether an agent is free for a proposed ScheduledDate and Duration. Returns a boolean.
        /// </summary>
        [HttpGet("agent/{agentId:int}/availability")]
        public async Task<IActionResult> IsAgentAvailable(int agentId, [FromQuery] DateTime scheduledDate, [FromQuery] TimeSpan duration)
        {
            var available = await _meetingService.IsAgentAvailableAsync(agentId, scheduledDate, duration);
            return Ok(available);
        }

        /// <summary>
        /// Checks whether a proposed meeting time would clash with an agent's existing meetings.
        /// Returns a boolean.
        /// </summary>
        [HttpGet("agent/{agentId:int}/scheduling-conflict")]
        public async Task<IActionResult> HasSchedulingConflict(int agentId, [FromQuery] DateTime scheduledDate, [FromQuery] TimeSpan duration)
        {
            var hasConflict = await _meetingService.HasSchedulingConflictAsync(agentId, scheduledDate, duration);
            return Ok(hasConflict);
        }
    }
}
