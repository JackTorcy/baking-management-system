using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api_app.Migrations
{
    /// <inheritdoc />
    public partial class AddBakeryOwnership : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DELETE FROM "RecipeIngredients";
                DELETE FROM "RecipeComponents";
                DELETE FROM "RecipeRecipeTag";
                DELETE FROM "IngredientIngredientTag";
                DELETE FROM "Recipes";
                DELETE FROM "Ingredients";
                DELETE FROM "RecipeTags";
                DELETE FROM "IngredientTags";
                """
            );

            migrationBuilder.AddColumn<int>(
                name: "BakeryId",
                table: "RecipeTags",
                type: "integer",
                nullable: false,
                defaultValue: 0
            );

            migrationBuilder.AddColumn<int>(
                name: "BakeryId",
                table: "Recipes",
                type: "integer",
                nullable: false,
                defaultValue: 0
            );

            migrationBuilder.AddColumn<int>(
                name: "BakeryId",
                table: "IngredientTags",
                type: "integer",
                nullable: false,
                defaultValue: 0
            );

            migrationBuilder.AddColumn<int>(
                name: "BakeryId",
                table: "Ingredients",
                type: "integer",
                nullable: false,
                defaultValue: 0
            );

            migrationBuilder.CreateIndex(
                name: "IX_RecipeTags_BakeryId",
                table: "RecipeTags",
                column: "BakeryId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Recipes_BakeryId",
                table: "Recipes",
                column: "BakeryId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_IngredientTags_BakeryId",
                table: "IngredientTags",
                column: "BakeryId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Ingredients_BakeryId",
                table: "Ingredients",
                column: "BakeryId"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_Ingredients_Bakeries_BakeryId",
                table: "Ingredients",
                column: "BakeryId",
                principalTable: "Bakeries",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_IngredientTags_Bakeries_BakeryId",
                table: "IngredientTags",
                column: "BakeryId",
                principalTable: "Bakeries",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_Recipes_Bakeries_BakeryId",
                table: "Recipes",
                column: "BakeryId",
                principalTable: "Bakeries",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_RecipeTags_Bakeries_BakeryId",
                table: "RecipeTags",
                column: "BakeryId",
                principalTable: "Bakeries",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Ingredients_Bakeries_BakeryId",
                table: "Ingredients"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_IngredientTags_Bakeries_BakeryId",
                table: "IngredientTags"
            );

            migrationBuilder.DropForeignKey(name: "FK_Recipes_Bakeries_BakeryId", table: "Recipes");

            migrationBuilder.DropForeignKey(
                name: "FK_RecipeTags_Bakeries_BakeryId",
                table: "RecipeTags"
            );

            migrationBuilder.DropIndex(name: "IX_RecipeTags_BakeryId", table: "RecipeTags");

            migrationBuilder.DropIndex(name: "IX_Recipes_BakeryId", table: "Recipes");

            migrationBuilder.DropIndex(name: "IX_IngredientTags_BakeryId", table: "IngredientTags");

            migrationBuilder.DropIndex(name: "IX_Ingredients_BakeryId", table: "Ingredients");

            migrationBuilder.DropColumn(name: "BakeryId", table: "RecipeTags");

            migrationBuilder.DropColumn(name: "BakeryId", table: "Recipes");

            migrationBuilder.DropColumn(name: "BakeryId", table: "IngredientTags");

            migrationBuilder.DropColumn(name: "BakeryId", table: "Ingredients");
        }
    }
}
