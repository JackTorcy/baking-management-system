using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api_app.Migrations
{
    /// <inheritdoc />
    public partial class AddRecipeYield : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Existing recipes become "makes 1 item" and components use item, so old component quantities keep meaning "batches"
            migrationBuilder.AddColumn<int>(
                name: "TinShape",
                table: "Recipes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TinSize",
                table: "Recipes",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TinUnit",
                table: "Recipes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TinWidth",
                table: "Recipes",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "YieldLabel",
                table: "Recipes",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "YieldQuantity",
                table: "Recipes",
                type: "numeric",
                nullable: false,
                defaultValue: 1m);

            migrationBuilder.AddColumn<int>(
                name: "YieldUnit",
                table: "Recipes",
                type: "integer",
                nullable: false,
                defaultValue: 5);

            migrationBuilder.AddColumn<int>(
                name: "Unit",
                table: "RecipeComponents",
                type: "integer",
                nullable: false,
                defaultValue: 5);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TinShape",
                table: "Recipes");

            migrationBuilder.DropColumn(
                name: "TinSize",
                table: "Recipes");

            migrationBuilder.DropColumn(
                name: "TinUnit",
                table: "Recipes");

            migrationBuilder.DropColumn(
                name: "TinWidth",
                table: "Recipes");

            migrationBuilder.DropColumn(
                name: "YieldLabel",
                table: "Recipes");

            migrationBuilder.DropColumn(
                name: "YieldQuantity",
                table: "Recipes");

            migrationBuilder.DropColumn(
                name: "YieldUnit",
                table: "Recipes");

            migrationBuilder.DropColumn(
                name: "Unit",
                table: "RecipeComponents");
        }
    }
}
