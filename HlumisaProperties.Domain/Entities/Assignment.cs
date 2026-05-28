using System;
using System.Collections.Generic;
using System.Text;

namespace HlumisaProperties.Domain.Entities
{
    public class Assignment : BaseEntity
    {
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public DateTime DueDate { get; set; }

        public DateTime? CompletedDate { get; set; }

        public AssignmentPriority Priority { get; set; }

        public AssignmentStatus Status { get; set; }

        // Assigned Agent
        public int AgentId { get; set; }

        public Agent Agent { get; set; }
    }

    public enum AssignmentPriority
    {
        Low,
        Medium,
        High
    }

    public enum AssignmentStatus
    {
        Pending,
        InProgress,
        Completed
    }
}
