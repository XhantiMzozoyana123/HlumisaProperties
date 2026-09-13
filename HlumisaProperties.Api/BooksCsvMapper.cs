using HlumisaProperties.Application.Dtos;
using HlumisaProperties.Domain.Entities;
using System.Globalization;

namespace HlumisaProperties.Api
{
    /// <summary>
    /// Maps <see cref="TransactionLedger"/> entities onto <see cref="BooksCsvRow"/> rows
    /// (and back) so the Books CSV file can be seeded from / imported into the database.
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

        /// <summary>
        /// Maps a parsed CSV row onto a new <see cref="TransactionLedger"/> entity
        /// (Id = 0 so EF inserts it). Months are normalized to UPPERCASE to keep the
        /// IX_TransactionLedgers_Month_Date index lookups consistent.
        /// </summary>
        public static TransactionLedger FromRow(BooksCsvRow row)
        {
            var date = ParseDate(row.Date);
            var month = string.IsNullOrWhiteSpace(row.Month)
                ? date.ToString("MMMM").ToUpperInvariant()
                : row.Month.Trim().ToUpperInvariant();

            return new TransactionLedger
            {
                Date = date,
                Month = month,
                Buyer = row.Buyer ?? string.Empty,
                Seller = row.Seller ?? string.Empty,
                OriginalAmount = row.OriginalAmount,
                DueToSeller = row.DueToSeller,
                Deposit = row.Deposit,
                LostDeed = row.LostDeed,
                Commission = row.Commission,
                TransferCosts = row.TransferCosts,
                MasterFees = row.MasterFees,
                ElecCert = row.ElecCert,
                WaterAccount = row.WaterAccount,
                Section118 = row.Section118,
                Balance = row.Balance,
                ErfNumber = row.ErfNumber ?? string.Empty,
                Area = row.Area ?? string.Empty,
                Status = string.IsNullOrWhiteSpace(row.Status) ? "white" : row.Status.Trim(),
                CellColors = string.IsNullOrWhiteSpace(row.CellColors) ? "{}" : row.CellColors,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };
        }

        private static DateTime ParseDate(string value)
        {
            var formats = new[] { "yyyy-MM-dd", "yyyy/MM/dd", "dd/MM/yyyy", "MM/dd/yyyy" };
            if (DateTime.TryParseExact(value, formats, CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsed))
                return DateTime.SpecifyKind(parsed, DateTimeKind.Utc);

            if (DateTime.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.None, out parsed))
                return DateTime.SpecifyKind(parsed, DateTimeKind.Utc);

            return DateTime.UtcNow.Date;
        }
    }
}