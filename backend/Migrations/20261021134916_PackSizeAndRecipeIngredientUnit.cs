using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api_app.Migrations
{
    /// <inheritdoc />
    public partial class PackSizeAndRecipeIngredientUnit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Raw SQL with IF NOT EXISTS because an earlier failed run left columns behind on the dev database
            migrationBuilder.Sql(
                @"ALTER TABLE ""RecipeIngredients"" ADD COLUMN IF NOT EXISTS ""Unit"" integer NOT NULL DEFAULT 0;");

            // Existing quantities were entered in the ingredient's unit, so copy it across to keep their meaning
            migrationBuilder.Sql(
                @"UPDATE ""RecipeIngredients"" ri
                  SET ""Unit"" = i.""IngredientUnit""
                  FROM ""Ingredients"" i
                  WHERE ri.""IngredientId"" = i.""Id"";");

            // Existing prices are per single unit, which is a pack size of 1
            migrationBuilder.Sql(
                @"ALTER TABLE ""Ingredients"" ADD COLUMN IF NOT EXISTS ""PackSize"" numeric(15,4) NOT NULL DEFAULT 1;");

            // A pack size of 0 would divide by zero when pricing
            migrationBuilder.Sql(@"UPDATE ""Ingredients"" SET ""PackSize"" = 1 WHERE ""PackSize"" = 0;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Unit",
                table: "RecipeIngredients");

            migrationBuilder.DropColumn(
                name: "PackSize",
                table: "Ingredients");
        }
    }
}
