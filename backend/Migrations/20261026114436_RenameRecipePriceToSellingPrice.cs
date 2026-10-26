using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api_app.Migrations
{
    /// <inheritdoc />
    public partial class RenameRecipePriceToSellingPrice : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // EF scaffolds a rename as drop + add, which would wipe every recipe's price
            migrationBuilder.RenameColumn(
                name: "Price",
                table: "Recipes",
                newName: "SellingPrice");

            migrationBuilder.AlterColumn<decimal>(
                name: "SellingPrice",
                table: "Recipes",
                type: "numeric",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                "UPDATE \"Recipes\" SET \"SellingPrice\" = 0 WHERE \"SellingPrice\" IS NULL;");

            migrationBuilder.AlterColumn<decimal>(
                name: "SellingPrice",
                table: "Recipes",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric",
                oldNullable: true);

            migrationBuilder.RenameColumn(
                name: "SellingPrice",
                table: "Recipes",
                newName: "Price");
        }
    }
}
