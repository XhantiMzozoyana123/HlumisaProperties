using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HlumisaProperties.Domain.Migrations
{
    /// <inheritdoc />
    public partial class AddTransactionLedgerIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_TransactionLedgers_Buyer",
                table: "TransactionLedgers",
                column: "Buyer");

            migrationBuilder.CreateIndex(
                name: "IX_TransactionLedgers_Month_Date",
                table: "TransactionLedgers",
                columns: new[] { "Month", "Date" });

            migrationBuilder.CreateIndex(
                name: "IX_TransactionLedgers_Seller",
                table: "TransactionLedgers",
                column: "Seller");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TransactionLedgers_Buyer",
                table: "TransactionLedgers");

            migrationBuilder.DropIndex(
                name: "IX_TransactionLedgers_Month_Date",
                table: "TransactionLedgers");

            migrationBuilder.DropIndex(
                name: "IX_TransactionLedgers_Seller",
                table: "TransactionLedgers");
        }
    }
}
