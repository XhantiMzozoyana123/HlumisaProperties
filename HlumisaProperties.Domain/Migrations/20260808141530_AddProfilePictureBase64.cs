using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HlumisaProperties.Domain.Migrations
{
    /// <inheritdoc />
    public partial class AddProfilePictureBase64 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProfilePictureBase64",
                table: "AspNetUsers",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProfilePictureBase64",
                table: "AspNetUsers");
        }
    }
}
