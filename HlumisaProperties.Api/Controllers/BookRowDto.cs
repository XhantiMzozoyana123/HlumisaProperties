using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HlumisaProperties.Application.Interfaces;
using HlumisaProperties.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HlumisaProperties.Api.Controllers
{
    /// <summary>
    /// JSON row shape the Books dashboard sends on Save Changes.
    /// Lenient on purpose: the UI sends camelCase keys, temp string ids
    /// ("new-...") for fresh rows, short date strings, and uses
    /// statusColor/electricalCertificate/outstandingBalance/amountPaid names.
    /// </summary>
    public sealed class BookRowDto
    {
        public object? Id { get; set; }
        public string? Date { get; set; }
        public string? Month { get; set; }
        public string? Buyer { get; set; }
        public string? Seller { get; set; }
        public decimal? OriginalAmount { get; set; }
        public decimal? AmountPaid { get; set; }
        public decimal? DueToSeller { get; set; }
        public decimal? Deposit { get; set; }
        public decimal? LostDeed { get; set; }
        public decimal? Commission { get; set; }
        public decimal? TransferCosts { get; set; }
        public decimal? MasterFees { get; set; }
        public decimal? ElectricalCertificate { get; set; }
        public decimal? ElecCert { get; set; }
        public decimal? WaterAccount { get; set; }
        public decimal? Section118 { get; set; }
        public decimal? Balance { get; set; }
        public decimal? OutstandingBalance { get; set; }
        public string? ErfNumber { get; set; }
        public string? Area { get; set; }
        public string? Status { get; set; }
        public string? StatusColor { get; set; }
        public string? CellColors { get; set; }
    }

    /// <summary>
    /// Wrapper so the dashboard can POST either a bare JSON array
    /// or { "entries": [...] } — both bind successfully.
    /// </summary>
    public sealed class BulkReplaceRequest
    {
        public List<BookRowDto>? Entries { get; set; }
    }
}
