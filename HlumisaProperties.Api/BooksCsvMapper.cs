using HlumisaProperties.Application.Dtos;
using HlumisaProperties.Domain.Entities;

namespace HlumisaProperties.Api
{
    /// <summary>
    /// Maps <see cref="TransactionLedger"/> entities onto <see cref="BooksCsvRow"/> rows
    /// so the Books CSV file can be seeded from the existing seed data at startup.
    /// </summary>
    public static class BooksCsvMapper
    {
        public static BooksCsvRow ToRow(TransactionLedger entry) => new BooksCsvRow
        {
            Date = entry.Date.ToString("yyyy-MM-dd"),
            Month = entry.Month,
            Buyer = entry.Buyer,
            Seller = entry.Seller,
            OriginalAmount = entry.OriginalAmount,
            DueToSeller = entry.DueToSeller,
            Deposit = entry.Deposit,
            LostDeed = entry.LostDeed,
            Commission = entry.Commission,
            TransferCosts = entry.TransferCosts,
            MasterFees = entry.MasterFees,
            ElecCert = entry.ElecCert,
            WaterAccount = entry.WaterAccount,
            Section118 = entry.Section118,
            Balance = entry.Balance,
            ErfNumber = entry.ErfNumber,
            Area = entry.Area,
            Status = entry.Status,
            CellColors = entry.CellColors,
        };
    }
}