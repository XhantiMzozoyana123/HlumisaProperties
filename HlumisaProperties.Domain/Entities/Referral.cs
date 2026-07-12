using System;

namespace HlumisaProperties.Domain.Entities
{
    public class Referral : BaseEntity
    {
        public string ReferrerName { get; set; } = string.Empty;

        public string ReferrerPhone { get; set; } = string.Empty;

        public string ReferrerAddress { get; set; } = string.Empty;

        public string ReferredName { get; set; } = string.Empty;

        public string ReferredPhone { get; set; } = string.Empty;

        public string ReferredAddress { get; set; } = string.Empty;

        /// <summary>
        /// "buy" or "sell"
        /// </summary>
        public string Intent { get; set; } = "buy";

        public string Note { get; set; } = string.Empty;

        /// <summary>
        /// Date the referral was created (ISO format YYYY-MM-DD).
        /// </summary>
        public string Date { get; set; } = string.Empty;

        /// <summary>
        /// Whether the referral has been greyed out/discarded.
        /// </summary>
        public bool IsDiscarded { get; set; }
    }
}