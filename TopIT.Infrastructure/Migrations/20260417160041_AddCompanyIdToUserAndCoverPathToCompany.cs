using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TopIT.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCompanyIdToUserAndCoverPathToCompany : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "Users",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CoverPath",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CoverPath",
                table: "Companies");
        }
    }
}
