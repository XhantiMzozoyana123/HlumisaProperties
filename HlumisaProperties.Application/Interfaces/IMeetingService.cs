using HlumisaProperties.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HlumisaProperties.Application.Interfaces
{
    public interface IMeetingService
    {
        // CREATE
        Task<Meeting> ScheduleMeetingAsync(Meeting meeting);

        // READ
        Task<Meeting?> GetMeetingByIdAsync(int meetingId);

        Task<IEnumerable<Meeting>> GetAllMeetingsAsync();

        Task<IEnumerable<Meeting>> GetMeetingsByAgentAsync(int agentId);

        Task<IEnumerable<Meeting>> GetMeetingsByCustomerAsync(int customerId);

        Task<IEnumerable<Meeting>> GetMeetingsByPropertyAsync(int propertyListingId);

        Task<IEnumerable<Meeting>> GetMeetingsByDateRangeAsync(DateTime start, DateTime end);

        // UPDATE
        Task<bool> UpdateMeetingAsync(Meeting meeting);

        Task<bool> RescheduleMeetingAsync(int meetingId, DateTime newDate, TimeSpan newDuration);

        Task<bool> UpdateMeetingStatusAsync(int meetingId, string status);

        // DELETE / CANCEL
        Task<bool> CancelMeetingAsync(int meetingId);

        Task<bool> DeleteMeetingAsync(int meetingId);

        // BUSINESS LOGIC
        Task<bool> IsAgentAvailableAsync(int agentId, DateTime scheduledDate, TimeSpan duration);

        Task<bool> HasSchedulingConflictAsync(int agentId, DateTime scheduledDate, TimeSpan duration);
    }
}