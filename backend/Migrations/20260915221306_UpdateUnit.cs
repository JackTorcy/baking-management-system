using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api_app.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUnit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ingredientUnit",
                table: "Ingredients",
                newName: "IngredientUnit");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IngredientUnit",
                table: "Ingredients",
                newName: "ingredientUnit");
        }
    }
}
