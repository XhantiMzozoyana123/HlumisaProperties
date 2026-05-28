using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Domain;
using HlumisaProperties.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace HlumisaProperties.Infrastructure.Services
{
    public class ContactBookService : IContactBookService
    {
        private readonly ApplicationDbContext _context;

        public ContactBookService(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        // ====== CREATE OPERATIONS ======
        public async Task<ContactBook> CreateContactBookAsync(ContactBook contactBook)
        {
            if (contactBook == null)
                throw new ArgumentNullException(nameof(contactBook));

            contactBook.CreatedAt = DateTime.UtcNow;
            contactBook.UpdatedAt = DateTime.UtcNow;

            _context.ContactBooks.Add(contactBook);
            await _context.SaveChangesAsync();

            return contactBook;
        }

        // ====== READ OPERATIONS ======
        public async Task<ContactBook> GetContactBookByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("ContactBook ID must be greater than 0", nameof(id));

            return await _context.ContactBooks
                .AsNoTracking()
                .Include(c => c.Customer)
                .Include(c => c.Agent)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<IEnumerable<ContactBook>> GetAllContactBooksAsync()
        {
            return await _context.ContactBooks
                .AsNoTracking()
                .Include(c => c.Customer)
                .Include(c => c.Agent)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<ContactBook>> GetContactBooksByCustomerIdAsync(int customerId)
        {
            if (customerId <= 0)
                throw new ArgumentException("Customer ID must be greater than 0", nameof(customerId));

            return await _context.ContactBooks
                .AsNoTracking()
                .Include(c => c.Customer)
                .Include(c => c.Agent)
                .Where(c => c.CustomerId == customerId)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<ContactBook>> GetContactBooksByAgentIdAsync(int agentId)
        {
            if (agentId <= 0)
                throw new ArgumentException("Agent ID must be greater than 0", nameof(agentId));

            return await _context.ContactBooks
                .AsNoTracking()
                .Include(c => c.Customer)
                .Include(c => c.Agent)
                .Where(c => c.AgentId == agentId)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<ContactBook>> GetUnresolvedContactBooksAsync()
        {
            return await _context.ContactBooks
                .AsNoTracking()
                .Include(c => c.Customer)
                .Include(c => c.Agent)
                .Where(c => !c.IsResolved)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        // ====== UPDATE OPERATIONS ======
        public async Task<ContactBook> UpdateContactBookAsync(ContactBook contactBook)
        {
            if (contactBook == null)
                throw new ArgumentNullException(nameof(contactBook));

            if (contactBook.Id <= 0)
                throw new ArgumentException("ContactBook ID must be greater than 0", nameof(contactBook.Id));

            var existingContactBook = await _context.ContactBooks.FindAsync(contactBook.Id);
            if (existingContactBook == null)
                return null;

            existingContactBook.CustomerId = contactBook.CustomerId;
            existingContactBook.AgentId = contactBook.AgentId;
            existingContactBook.Message = contactBook.Message;
            existingContactBook.IsResolved = contactBook.IsResolved;
            existingContactBook.UpdatedAt = DateTime.UtcNow;

            _context.ContactBooks.Update(existingContactBook);
            await _context.SaveChangesAsync();

            return existingContactBook;
        }

        // ====== DELETE OPERATIONS ======
        public async Task<bool> DeleteContactBookAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("ContactBook ID must be greater than 0", nameof(id));

            var contactBook = await _context.ContactBooks.FindAsync(id);
            if (contactBook == null)
                return false;

            _context.ContactBooks.Remove(contactBook);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
