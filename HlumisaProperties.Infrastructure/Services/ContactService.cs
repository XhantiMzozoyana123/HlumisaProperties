using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Domain;
using HlumisaProperties.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HlumisaProperties.Infrastructure.Services
{
    public class ContactService : IContactService
    {
        private readonly ApplicationDbContext _context;

        public ContactService(ApplicationDbContext context)
        {
            _context = context;
        }

        // =========================
        // CREATE
        // =========================

        public async Task<Lead> CreateLeadAsync(Lead lead)
        {
            await _context.Leads.AddAsync(lead);
            await _context.SaveChangesAsync();

            return lead;
        }

        public async Task<IEnumerable<Lead>> CreateBulkLeadsAsync(IEnumerable<Lead> leads)
        {
            await _context.Leads.AddRangeAsync(leads);
            await _context.SaveChangesAsync();

            return leads;
        }

        // =========================
        // UPDATE
        // =========================

        public async Task<bool> UpdateLeadAsync(Lead lead)
        {
            var existingLead = await _context.Leads
                .FirstOrDefaultAsync(l => l.Id == lead.Id);

            if (existingLead == null)
            {
                return false;
            }

            existingLead.FirstName = lead.FirstName;
            existingLead.LastName = lead.LastName;
            existingLead.EmailAddress = lead.EmailAddress;
            existingLead.PhoneNumber = lead.PhoneNumber;
            existingLead.Location = lead.Location;
            existingLead.JsonCommunicationThread = lead.JsonCommunicationThread;
            existingLead.LeadType = lead.LeadType;
            existingLead.IsContacted = lead.IsContacted;

            _context.Leads.Update(existingLead);

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> MarkLeadAsContactedAsync(int leadId)
        {
            var lead = await _context.Leads
                .FirstOrDefaultAsync(l => l.Id == leadId);

            if (lead == null)
            {
                return false;
            }

            lead.IsContacted = true;

            _context.Leads.Update(lead);

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> MarkLeadAsUncontactedAsync(int leadId)
        {
            var lead = await _context.Leads
                .FirstOrDefaultAsync(l => l.Id == leadId);

            if (lead == null)
            {
                return false;
            }

            lead.IsContacted = false;

            _context.Leads.Update(lead);

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateCommunicationThreadAsync(
            int leadId,
            string jsonCommunicationThread)
        {
            var lead = await _context.Leads
                .FirstOrDefaultAsync(l => l.Id == leadId);

            if (lead == null)
            {
                return false;
            }

            lead.JsonCommunicationThread = jsonCommunicationThread;

            _context.Leads.Update(lead);

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateLeadTypeAsync(
            int leadId,
            LeadType leadType)
        {
            var lead = await _context.Leads
                .FirstOrDefaultAsync(l => l.Id == leadId);

            if (lead == null)
            {
                return false;
            }

            lead.LeadType = leadType;

            _context.Leads.Update(lead);

            return await _context.SaveChangesAsync() > 0;
        }

        // =========================
        // DELETE
        // =========================

        public async Task<bool> DeleteLeadAsync(int leadId)
        {
            var lead = await _context.Leads
                .FirstOrDefaultAsync(l => l.Id == leadId);

            if (lead == null)
            {
                return false;
            }

            _context.Leads.Remove(lead);

            return await _context.SaveChangesAsync() > 0;
        }

        // =========================
        // READS (CUSTOMERS)
        // =========================

        public async Task<IEnumerable<Customer>> GetAllCustomersAsync()
        {
            return await _context.Customers
                .Include(c => c.Contacts)
                .OrderBy(c => c.FirstName)
                .ToListAsync();
        }

        public async Task<Customer?> GetCustomerByIdAsync(int customerId)
        {
            return await _context.Customers
                .Include(c => c.Contacts)
                .FirstOrDefaultAsync(c => c.Id == customerId);
        }

        public async Task<Customer?> GetCustomerByEmailAsync(string emailAddress)
        {
            return await _context.Customers
                .Include(c => c.Contacts)
                .FirstOrDefaultAsync(c =>
                    c.EmailAddress == emailAddress);
        }

        public async Task<Customer?> GetCustomerByPhoneNumberAsync(string phoneNumber)
        {
            return await _context.Customers
                .Include(c => c.Contacts)
                .FirstOrDefaultAsync(c =>
                    c.PhoneNumber == phoneNumber);
        }

        public async Task<IEnumerable<Customer>> GetCustomersByInterestTypeAsync(
            CustomerType customerType)
        {
            return await _context.Customers
                .Include(c => c.Contacts)
                .Where(c => c.InterestType == customerType)
                .ToListAsync();
        }

        public async Task<IEnumerable<Customer>> SearchCustomersByLocationAsync(
            string location)
        {
            return await _context.Customers
                .Include(c => c.Contacts)
                .Where(c => c.Location.Contains(location))
                .ToListAsync();
        }

        public async Task<IEnumerable<Customer>> SearchCustomersByNameAsync(
            string keyword)
        {
            return await _context.Customers
                .Include(c => c.Contacts)
                .Where(c =>
                    c.FirstName.Contains(keyword) ||
                    c.LastName.Contains(keyword))
                .ToListAsync();
        }

        // =========================
        // BUSINESS LOGIC
        // =========================

        public async Task<bool> CustomerExistsAsync(string emailAddress)
        {
            return await _context.Customers
                .AnyAsync(c => c.EmailAddress == emailAddress);
        }

        public async Task<int> GetTotalCustomerCountAsync()
        {
            return await _context.Customers.CountAsync();
        }

        public async Task<int> GetBuyingCustomerCountAsync()
        {
            return await _context.Customers
                .CountAsync(c => c.InterestType == CustomerType.Buying);
        }

        public async Task<int> GetSellingCustomerCountAsync()
        {
            return await _context.Customers
                .CountAsync(c => c.InterestType == CustomerType.Selling);
        }

        public async Task<Dictionary<CustomerType, int>> GetCustomerStatisticsAsync()
        {
            return await _context.Customers
                .GroupBy(c => c.InterestType)
                .ToDictionaryAsync(
                    group => group.Key,
                    group => group.Count());
        }
    }
}