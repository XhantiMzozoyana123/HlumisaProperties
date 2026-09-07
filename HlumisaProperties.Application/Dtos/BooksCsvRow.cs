using CsvHelper.Configuration.Attributes;

namespace HlumisaProperties.Application.Dtos;

/// <summary>
/// One row of the Books CSV file. Column headers (via CsvHelper attributes) match
/// what the admin dashboard writes/generates, so the desktop file round-trips cleanly:
/// Date, Month, Buyer, Seller, Original Amount, Due to Seller, Deposit, Lost Deed,
/// Commission, Transfer Costs, Master Fees, Elec Cert, Water Account, Section 118,
/// Outstanding Balance, ERF, Area, Status, Cell Colors.
/// </summary>
public class BooksCsvRow
{
    [Name("Date")]
    public string Date { get; set; } = string.Empty;

    [Name("Month")]
    public string Month { get; set; } = string.Empty;

    [Name("Buyer")]
    public string Buyer { get; set; } = string.Empty;

    [Name("Seller")]
    public string Seller { get; set; } = string.Empty;

    [Name("Original Amount")]
    public decimal OriginalAmount { get; set; }

    [Name("Due to Seller")]
    public decimal DueToSeller { get; set; }

    [Name("Deposit")]
    public decimal Deposit { get; set; }

    [Name("Lost Deed")]
    public decimal LostDeed { get; set; }

    [Name("Commission")]
    public decimal Commission { get; set; }

    [Name("Transfer Costs")]
    public decimal TransferCosts { get; set; }

    [Name("Master Fees")]
    public decimal MasterFees { get; set; }

    [Name("Elec Cert")]
    public decimal ElecCert { get; set; }

    [Name("Water Account")]
    public decimal WaterAccount { get; set; }

    [Name("Section 118")]
    public decimal Section118 { get; set; }

    /// <summary>The "Outstanding Balance" column — remaining balance after deductions.</summary>
    [Name("Outstanding Balance")]
    public decimal Balance { get; set; }

    [Name("ERF")]
    public string ErfNumber { get; set; } = string.Empty;

    [Name("Area")]
    public string Area { get; set; } = string.Empty;

    /// <summary>Row status used by the dashboard (white/red/green).</summary>
    [Name("Status")]
    public string Status { get; set; } = "white";

    /// <summary>JSON string of per-cell highlight colours, e.g. {"commission":"green"}.</summary>
    [Name("Cell Colors")]
    public string CellColors { get; set; } = string.Empty;
}