using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Domain;
using HlumisaProperties.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace HlumisaProperties.Infrastructure.Services
{
    public class LeadService : ILeadService
    {
        private readonly ApplicationDbContext _context;

        public LeadService(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        // ====== CREATE OPERATIONS ======
        public async Task<Lead> CreateLeadAsync(Lead lead)
        {
            if (lead == null)
                throw new ArgumentNullException(nameof(lead));

            lead.CreatedAt = DateTime.UtcNow;
            lead.UpdatedAt = DateTime.UtcNow;

            _context.Leads.Add(lead);
            await _context.SaveChangesAsync();

            return lead;
        }

        // ====== READ OPERATIONS ======
        public async Task<Lead> GetLeadByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Lead ID must be greater than 0", nameof(id));

            return await _context.Leads
                .AsNoTracking()
                .FirstOrDefaultAsync(l => l.Id == id);
        }

        public async Task<IEnumerable<Lead>> GetAllLeadsAsync()
        {
            return await _context.Leads
                .AsNoTracking()
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Lead>> GetLeadsByTypeAsync(LeadType leadType)
        {
            return await _context.Leads
                .AsNoTracking()
                .Where(l => l.LeadType == leadType)
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Lead>> GetContactedLeadsAsync()
        {
            return await _context.Leads
                .AsNoTracking()
                .Where(l => l.IsContacted)
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Lead>> GetUncontactedLeadsAsync()
        {
            return await _context.Leads
                .AsNoTracking()
                .Where(l => !l.IsContacted)
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Lead>> GetLeadsByLocationAsync(string location)
        {
            if (string.IsNullOrWhiteSpace(location))
                throw new ArgumentException("Location cannot be null or empty", nameof(location));

            return await _context.Leads
                .AsNoTracking()
                .Where(l => l.Location.ToLower().Contains(location.ToLower()))
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();
        }

        // ====== UPDATE OPERATIONS ======
        public async Task<Lead> UpdateLeadAsync(Lead lead)
        {
            if (lead == null)
                throw new ArgumentNullException(nameof(lead));

            if (lead.Id <= 0)
                throw new ArgumentException("Lead ID must be greater than 0", nameof(lead.Id));

            var existingLead = await _context.Leads.FindAsync(lead.Id);
            if (existingLead == null)
                return null;

            existingLead.FirstName = lead.FirstName;
            existingLead.LastName = lead.LastName;
            existingLead.EmailAddress = lead.EmailAddress;
            existingLead.PhoneNumber = lead.PhoneNumber;
            existingLead.Location = lead.Location;
            existingLead.JsonCommunicationThread = lead.JsonCommunicationThread;
            existingLead.LeadType = lead.LeadType;
            existingLead.IsContacted = lead.IsContacted;
            existingLead.UpdatedAt = DateTime.UtcNow;

            _context.Leads.Update(existingLead);
            await _context.SaveChangesAsync();

            return existingLead;
        }

        // ====== DELETE OPERATIONS ======
        public async Task<bool> DeleteLeadAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Lead ID must be greater than 0", nameof(id));

            var lead = await _context.Leads.FindAsync(id);
            if (lead == null)
                return false;

            _context.Leads.Remove(lead);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
