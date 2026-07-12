using System;

namespace HlumisaProperties.Domain.Entities
{
    public class TransactionLedger : BaseEntity
    {
        public DateTime Date { get; set; }

        /// <summary>
        /// Read-only field derived from Date. Used for monthly filtering.
        /// </summary>
        public string Month { get; set; } = string.Empty;

        public string Buyer { get; set; } = string.Empty;

        public string Seller { get; set; } = string.Empty;

        /// <summary>
        /// Purely a note/reference field. Does NOT affect any calculations.
        /// </summary>
        public decimal OriginalAmount { get; set; }

        /// <summary>
        /// Money that goes to the seller (previously called "Amount Paid").
        /// </summary>
        public decimal DueToSeller { get; set; }

        /// <summary>
        /// Deposit paid by the buyer.
        /// </summary>
        public decimal Deposit { get; set; }

        /// <summary>
        /// Costs associated with lost or missing title deeds.
        /// </summary>
        public decimal LostDeed { get; set; }

        /// <summary>
        /// Commission Hlumisa Properties earns from the deal.
        /// </summary>
        public decimal Commission { get; set; }

        /// <summary>
        /// Legal and administrative costs for transferring the property.
        /// </summary>
        public decimal TransferCosts { get; set; }

        /// <summary>
        /// Fees paid to the Master of the High Court.
        /// </summary>
        public decimal MasterFees { get; set; }

        /// <summary>
        /// Electrical Certificate costs.
        /// </summary>
        public decimal ElecCert { get; set; }

        /// <summary>
        /// Outstanding water account amounts.
        /// </summary>
        public decimal WaterAccount { get; set; }

        /// <summary>
        /// Section 118 clearance amount required for transfer.
        /// </summary>
        public decimal Section118 { get; set; }

        /// <summary>
        /// Balance remaining after all deductions. Manually editable.
        /// </summary>
        public decimal Balance { get; set; }

        /// <summary>
        /// Property ERF (stand) number.
        /// </summary>
        public string ErfNumber { get; set; } = string.Empty;

        /// <summary>
        /// Suburb/area where the property is located.
        /// </summary>
        public string Area { get; set; } = string.Empty;

        /// <summary>
        /// Row status: Pending, Declined, or Done.
        /// </summary>
        public string Status { get; set; } = "Pending";

        /// <summary>
        /// JSON string storing per-cell color assignments (e.g. {"date":"red","commission":"green"}).
        /// </summary>
        public string CellColors { get; set; } = "{}";
    }
}