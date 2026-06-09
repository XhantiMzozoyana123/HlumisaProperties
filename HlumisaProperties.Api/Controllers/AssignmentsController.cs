using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace HlumisaProperties.Api.Controllers
{
    /// <summary>
    /// Manages the <see cref="Assignment"/> entity (tasks/work items assigned to an agent).
    ///
    /// Entity: Assignment (inherits BaseEntity)
    /// Columns:
    ///   - Id (int)                    : Primary key (from BaseEntity).
    ///   - UserId (string)             : Owning application user id (from BaseEntity).
    ///   - CreatedAt (DateTime)        : Record creation timestamp (from BaseEntity).
    ///   - UpdatedAt (DateTime)        : Last modification timestamp (from BaseEntity).
    ///   - Title (string)              : Short title of the assignment.
    ///   - Description (string)        : Detailed description of the work.
    ///   - DueDate (DateTime)          : When the assignment is due.
    ///   - CompletedDate (DateTime?)   : When it was completed (null while open).
    ///   - Priority (AssignmentPriority): Low / Medium / High.
    ///   - Status (AssignmentStatus)   : Pending / InProgress / Completed.
    ///   - AgentId (int)               : Foreign key to the assigned Agent.
    ///   - Agent (Agent)               : Navigation to the assigned agent.
    ///
    /// Responsibility: exposes CRUD and agent-scoped retrieval for assignments via
    /// <see cref="IAssignmentService"/>.
    /// </summary>
    [ApiController]
    [Route("api/assignments")]
    public class AssignmentsController : ControllerBase
    {
        private readonly IAssignmentService _assignmentService;

        public AssignmentsController(IAssignmentService assignmentService)
        {
            _assignmentService = assignmentService;
        }

        // ====== CREATE ======

        /// <summary>
        /// Creates a new assignment and returns it with a 201 Created location.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Assignment assignment)
        {
            if (assignment == null)
                return BadRequest("Assignment payload is required.");

            var created = await _assignmentService.CreateAssignmentAsync(assignment);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // ====== READ ======

        /// <summary>
        /// Retrieves a single assignment by its primary key (Id). Returns 404 if not found.
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var assignment = await _assignmentService.GetAssignmentByIdAsync(id);
            if (assignment == null)
                return NotFound();

            return Ok(assignment);
        }

        /// <summary>
        /// Retrieves every assignment in the system.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var assignments = await _assignmentService.GetAllAssignmentsAsync();
            return Ok(assignments);
        }

        /// <summary>
        /// Retrieves all assignments belonging to a given agent (filtered by AgentId).
        /// </summary>
        [HttpGet("by-agent/{agentId:int}")]
        public async Task<IActionResult> GetByAgentId(int agentId)
        {
            var assignments = await _assignmentService.GetAssignmentsByAgentIdAsync(agentId);
            return Ok(assignments);
        }

        // ====== UPDATE ======

        /// <summary>
        /// Updates an existing assignment. The route Id is applied to the body before saving.
        /// Returns 404 if the assignment does not exist.
        /// </summary>
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Assignment assignment)
        {
            if (assignment == null)
                return BadRequest("Assignment payload is required.");

            assignment.Id = id;
            var updated = await _assignmentService.UpdateAssignmentAsync(assignment);
            if (updated == null)
                return NotFound();

            return Ok(updated);
        }

        // ====== DELETE ======

        /// <summary>
        /// Deletes an assignment by its primary key (Id). Returns 404 if not found.
        /// </summary>
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _assignmentService.DeleteAssignmentAsync(id);
            if (!success)
                return NotFound();

            return NoContent();
        }
    }
}
