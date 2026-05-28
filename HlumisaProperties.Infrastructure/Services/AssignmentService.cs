using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Domain;
using HlumisaProperties.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace HlumisaProperties.Infrastructure.Services
{
    public class AssignmentService : IAssignmentService
    {
        private readonly ApplicationDbContext _context;

        public AssignmentService(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        // ====== CREATE OPERATIONS ======
        public async Task<Assignment> CreateAssignmentAsync(Assignment assignment)
        {
            if (assignment == null)
                throw new ArgumentNullException(nameof(assignment));

            assignment.CreatedAt = DateTime.UtcNow;
            assignment.UpdatedAt = DateTime.UtcNow;

            _context.Assignments.Add(assignment);
            await _context.SaveChangesAsync();

            return assignment;
        }

        // ====== READ OPERATIONS ======
        public async Task<Assignment> GetAssignmentByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Assignment ID must be greater than 0", nameof(id));

            return await _context.Assignments
                .AsNoTracking()
                .Include(a => a.Agent)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<IEnumerable<Assignment>> GetAllAssignmentsAsync()
        {
            return await _context.Assignments
                .AsNoTracking()
                .Include(a => a.Agent)
                .OrderByDescending(a => a.DueDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Assignment>> GetAssignmentsByAgentIdAsync(int agentId)
        {
            if (agentId <= 0)
                throw new ArgumentException("Agent ID must be greater than 0", nameof(agentId));

            return await _context.Assignments
                .AsNoTracking()
                .Include(a => a.Agent)
                .Where(a => a.AgentId == agentId)
                .OrderByDescending(a => a.DueDate)
                .ToListAsync();
        }

        // ====== UPDATE OPERATIONS ======
        public async Task<Assignment> UpdateAssignmentAsync(Assignment assignment)
        {
            if (assignment == null)
                throw new ArgumentNullException(nameof(assignment));

            if (assignment.Id <= 0)
                throw new ArgumentException("Assignment ID must be greater than 0", nameof(assignment.Id));

            var existingAssignment = await _context.Assignments.FindAsync(assignment.Id);
            if (existingAssignment == null)
                return null;

            existingAssignment.Title = assignment.Title;
            existingAssignment.Description = assignment.Description;
            existingAssignment.DueDate = assignment.DueDate;
            existingAssignment.CompletedDate = assignment.CompletedDate;
            existingAssignment.Priority = assignment.Priority;
            existingAssignment.Status = assignment.Status;
            existingAssignment.AgentId = assignment.AgentId;
            existingAssignment.UpdatedAt = DateTime.UtcNow;

            _context.Assignments.Update(existingAssignment);
            await _context.SaveChangesAsync();

            return existingAssignment;
        }

        // ====== DELETE OPERATIONS ======
        public async Task<bool> DeleteAssignmentAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Assignment ID must be greater than 0", nameof(id));

            var assignment = await _context.Assignments.FindAsync(id);
            if (assignment == null)
                return false;

            _context.Assignments.Remove(assignment);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
