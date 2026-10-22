using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api_app.Migrations
{
    /// <inheritdoc />
    public partial class AddQuantityToRecipeComponent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RecipeComponents_Recipes_ComponentRecipeId",
                table: "RecipeComponents");

            migrationBuilder.DropForeignKey(
                name: "FK_RecipeComponents_Recipes_ParentRecipeId",
                table: "RecipeComponents");

            migrationBuilder.RenameColumn(
                name: "ParentRecipeId",
                table: "RecipeComponents",
                newName: "RecipeId");

            migrationBuilder.RenameColumn(
                name: "ComponentRecipeId",
                table: "RecipeComponents",
                newName: "ComponentId");

            migrationBuilder.RenameIndex(
                name: "IX_RecipeComponents_ParentRecipeId",
                table: "RecipeComponents",
                newName: "IX_RecipeComponents_RecipeId");

            migrationBuilder.RenameIndex(
                name: "IX_RecipeComponents_ComponentRecipeId",
                table: "RecipeComponents",
                newName: "IX_RecipeComponents_ComponentId");

            migrationBuilder.AddColumn<decimal>(
                name: "Quantity",
                table: "RecipeComponents",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddForeignKey(
                name: "FK_RecipeComponents_Recipes_ComponentId",
                table: "RecipeComponents",
                column: "ComponentId",
                principalTable: "Recipes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RecipeComponents_Recipes_RecipeId",
                table: "RecipeComponents",
                column: "RecipeId",
                principalTable: "Recipes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RecipeComponents_Recipes_ComponentId",
                table: "RecipeComponents");

            migrationBuilder.DropForeignKey(
                name: "FK_RecipeComponents_Recipes_RecipeId",
                table: "RecipeComponents");

            migrationBuilder.DropColumn(
                name: "Quantity",
                table: "RecipeComponents");

            migrationBuilder.RenameColumn(
                name: "RecipeId",
                table: "RecipeComponents",
                newName: "ParentRecipeId");

            migrationBuilder.RenameColumn(
                name: "ComponentId",
                table: "RecipeComponents",
                newName: "ComponentRecipeId");

            migrationBuilder.RenameIndex(
                name: "IX_RecipeComponents_RecipeId",
                table: "RecipeComponents",
                newName: "IX_RecipeComponents_ParentRecipeId");

            migrationBuilder.RenameIndex(
                name: "IX_RecipeComponents_ComponentId",
                table: "RecipeComponents",
                newName: "IX_RecipeComponents_ComponentRecipeId");

            migrationBuilder.AddForeignKey(
                name: "FK_RecipeComponents_Recipes_ComponentRecipeId",
                table: "RecipeComponents",
                column: "ComponentRecipeId",
                principalTable: "Recipes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RecipeComponents_Recipes_ParentRecipeId",
                table: "RecipeComponents",
                column: "ParentRecipeId",
                principalTable: "Recipes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
