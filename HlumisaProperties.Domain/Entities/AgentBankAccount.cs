using System;
using System.Collections.Generic;
using System.Text;

namespace HlumisaProperties.Domain.Entities
{
    public class AgentBankAccount : BaseEntity
    {
        public int AgentId { get; set; }
        public Agent Agent { get; set; }
        public string BankName { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public string AccountHolderName { get; set; } = string.Empty;
        public string BranchCode { get; set; } = string.Empty;
    }
}
