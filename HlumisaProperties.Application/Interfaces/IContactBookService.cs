using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using HlumisaProperties.Domain.Entities;

namespace HlumisaProperties.Application.Interfaces
{
    public interface IContactBookService
    {
        Task<ContactBook> CreateContactBookAsync(ContactBook contactBook);
        Task<ContactBook> GetContactBookByIdAsync(int id);
        Task<IEnumerable<ContactBook>> GetAllContactBooksAsync();
        Task<IEnumerable<ContactBook>> GetContactBooksByCustomerIdAsync(int customerId);
        Task<IEnumerable<ContactBook>> GetContactBooksByAgentIdAsync(int agentId);
        Task<IEnumerable<ContactBook>> GetUnresolvedContactBooksAsync();
        Task<ContactBook> UpdateContactBookAsync(ContactBook contactBook);
        Task<bool> DeleteContactBookAsync(int id);
    }
}
