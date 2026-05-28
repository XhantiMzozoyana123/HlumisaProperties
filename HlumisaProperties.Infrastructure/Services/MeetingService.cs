using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Domain;
using HlumisaProperties.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HlumisaProperties.Application.Services
{
    public class MeetingService : IMeetingService
    {
        private readonly ApplicationDbContext _context;

        public MeetingService(ApplicationDbContext context)
        {
            _context = context;
        }

        // CREATE
        public async Task<Meeting> ScheduleMeetingAsync(Meeting meeting)
        {
            // Check scheduling conflict before saving
            var hasConflict = await HasSchedulingConflictAsync(
                meeting.AgentId,
                meeting.ScheduledDate,
                meeting.Duration);

            if (hasConflict)
            {
                throw new Exception("The agent already has a meeting scheduled during this time.");
            }

            await _context.Meetings.AddAsync(meeting);
            await _context.SaveChangesAsync();

            return meeting;
        }

        // READ

        public async Task<Meeting?> GetMeetingByIdAsync(int meetingId)
        {
            return await _context.Meetings
                .Include(m => m.Agent)
                .Include(m => m.Customer)
                .Include(m => m.PropertyListing)
                .FirstOrDefaultAsync(m => m.Id == meetingId);
        }

        public async Task<IEnumerable<Meeting>> GetAllMeetingsAsync()
        {
            return await _context.Meetings
                .Include(m => m.Agent)
                .Include(m => m.Customer)
                .Include(m => m.PropertyListing)
                .OrderBy(m => m.ScheduledDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Meeting>> GetMeetingsByAgentAsync(int agentId)
        {
            return await _context.Meetings
                .Include(m => m.Customer)
                .Include(m => m.PropertyListing)
                .Where(m => m.AgentId == agentId)
                .OrderBy(m => m.ScheduledDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Meeting>> GetMeetingsByCustomerAsync(int customerId)
        {
            return await _context.Meetings
                .Include(m => m.Agent)
                .Include(m => m.PropertyListing)
                .Where(m => m.CustomerId == customerId)
                .OrderBy(m => m.ScheduledDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Meeting>> GetMeetingsByPropertyAsync(int propertyListingId)
        {
            return await _context.Meetings
                .Include(m => m.Agent)
                .Include(m => m.Customer)
                .Where(m => m.PropertyListingId == propertyListingId)
                .OrderBy(m => m.ScheduledDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Meeting>> GetMeetingsByDateRangeAsync(DateTime start, DateTime end)
        {
            return await _context.Meetings
                .Include(m => m.Agent)
                .Include(m => m.Customer)
                .Include(m => m.PropertyListing)
                .Where(m => m.ScheduledDate >= start &&
                            m.ScheduledDate <= end)
                .OrderBy(m => m.ScheduledDate)
                .ToListAsync();
        }

        // UPDATE

        public async Task<bool> UpdateMeetingAsync(Meeting meeting)
        {
            var existingMeeting = await _context.Meetings
                .FirstOrDefaultAsync(m => m.Id == meeting.Id);

            if (existingMeeting == null)
            {
                return false;
            }

            existingMeeting.Title = meeting.Title;
            existingMeeting.Description = meeting.Description;
            existingMeeting.ScheduledDate = meeting.ScheduledDate;
            existingMeeting.Duration = meeting.Duration;
            existingMeeting.Location = meeting.Location;
            existingMeeting.MeetingType = meeting.MeetingType;
            existingMeeting.Status = meeting.Status;
            existingMeeting.AgentId = meeting.AgentId;
            existingMeeting.CustomerId = meeting.CustomerId;
            existingMeeting.PropertyListingId = meeting.PropertyListingId;

            _context.Meetings.Update(existingMeeting);

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> RescheduleMeetingAsync(
            int meetingId,
            DateTime newDate,
            TimeSpan newDuration)
        {
            var meeting = await _context.Meetings
                .FirstOrDefaultAsync(m => m.Id == meetingId);

            if (meeting == null)
            {
                return false;
            }

            var hasConflict = await HasSchedulingConflictAsync(
                meeting.AgentId,
                newDate,
                newDuration);

            if (hasConflict)
            {
                throw new Exception("The agent already has another meeting scheduled during this time.");
            }

            meeting.ScheduledDate = newDate;
            meeting.Duration = newDuration;
            meeting.Status = "Rescheduled";

            _context.Meetings.Update(meeting);

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateMeetingStatusAsync(int meetingId, string status)
        {
            var meeting = await _context.Meetings
                .FirstOrDefaultAsync(m => m.Id == meetingId);

            if (meeting == null)
            {
                return false;
            }

            meeting.Status = status;

            _context.Meetings.Update(meeting);

            return await _context.SaveChangesAsync() > 0;
        }

        // DELETE / CANCEL

        public async Task<bool> CancelMeetingAsync(int meetingId)
        {
            var meeting = await _context.Meetings
                .FirstOrDefaultAsync(m => m.Id == meetingId);

            if (meeting == null)
            {
                return false;
            }

            meeting.Status = "Cancelled";

            _context.Meetings.Update(meeting);

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteMeetingAsync(int meetingId)
        {
            var meeting = await _context.Meetings
                .FirstOrDefaultAsync(m => m.Id == meetingId);

            if (meeting == null)
            {
                return false;
            }

            _context.Meetings.Remove(meeting);

            return await _context.SaveChangesAsync() > 0;
        }

        // BUSINESS LOGIC

        public async Task<bool> IsAgentAvailableAsync(
            int agentId,
            DateTime scheduledDate,
            TimeSpan duration)
        {
            var agent = await _context.Agents
                .FirstOrDefaultAsync(a => a.Id == agentId);

            if (agent == null || !agent.IsAvailable)
            {
                return false;
            }

            return !await HasSchedulingConflictAsync(
                agentId,
                scheduledDate,
                duration);
        }

        public async Task<bool> HasSchedulingConflictAsync(
            int agentId,
            DateTime scheduledDate,
            TimeSpan duration)
        {
            var meetingEndTime = scheduledDate.Add(duration);

            var existingMeetings = await _context.Meetings
                .Where(m =>
                    m.AgentId == agentId &&
                    m.Status != "Cancelled")
                .ToListAsync();

            foreach (var meeting in existingMeetings)
            {
                var existingStart = meeting.ScheduledDate;
                var existingEnd = meeting.ScheduledDate.Add(meeting.Duration);

                bool overlaps =
                    scheduledDate < existingEnd &&
                    meetingEndTime > existingStart;

                if (overlaps)
                {
                    return true;
                }
            }

            return false;
        }
    }
}