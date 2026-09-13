using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HlumisaProperties.Domain.Migrations
{
    /// <inheritdoc />
    public partial class AddImageBase64Column : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageBase64",
                table: "PropertyListings",
                type: "longtext",
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageBase64",
                table: "PropertyListings");
        }
    }
}
