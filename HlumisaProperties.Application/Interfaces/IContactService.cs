using HlumisaProperties.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HlumisaProperties.Application.Interfaces
{
    public interface IContactService
    {
        // =========================
        // WRITES (Lead Entity)
        // =========================

        Task<Lead> CreateLeadAsync(Lead lead);

        Task<IEnumerable<Lead>> CreateBulkLeadsAsync(IEnumerable<Lead> leads);

        Task<bool> UpdateLeadAsync(Lead lead);

        Task<bool> MarkLeadAsContactedAsync(int leadId);

        Task<bool> MarkLeadAsUncontactedAsync(int leadId);

        Task<bool> UpdateCommunicationThreadAsync(
            int leadId,
            string jsonCommunicationThread);

        Task<bool> UpdateLeadTypeAsync(
            int leadId,
            LeadType leadType);

        Task<bool> DeleteLeadAsync(int leadId);

        // =========================
        // READS (Customer Entity)
        // =========================

        Task<Customer?> GetCustomerByIdAsync(int customerId);

        Task<IEnumerable<Customer>> GetAllCustomersAsync();

        Task<IEnumerable<Customer>> GetCustomersByInterestTypeAsync(
            CustomerType customerType);

        Task<IEnumerable<Customer>> SearchCustomersByLocationAsync(
            string location);

        Task<IEnumerable<Customer>> SearchCustomersByNameAsync(
            string keyword);

        Task<Customer?> GetCustomerByEmailAsync(string emailAddress);

        Task<Customer?> GetCustomerByPhoneNumberAsync(string phoneNumber);

        // =========================
        // BUSINESS LOGIC
        // =========================

        Task<bool> CustomerExistsAsync(string emailAddress);

        Task<int> GetTotalCustomerCountAsync();

        Task<int> GetBuyingCustomerCountAsync();

        Task<int> GetSellingCustomerCountAsync();

        Task<Dictionary<CustomerType, int>> GetCustomerStatisticsAsync();
    }
}