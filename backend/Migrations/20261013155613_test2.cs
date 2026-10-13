using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api_app.Migrations
{
    /// <inheritdoc />
    public partial class test2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_IngredientIngredientTag_IngredientTag_IngredientTagsId",
                table: "IngredientIngredientTag");

            migrationBuilder.DropForeignKey(
                name: "FK_RecipeComponent_Recipes_ComponentRecipeId",
                table: "RecipeComponent");

            migrationBuilder.DropForeignKey(
                name: "FK_RecipeComponent_Recipes_ParentRecipeId",
                table: "RecipeComponent");

            migrationBuilder.DropForeignKey(
                name: "FK_RecipeIngredient_Ingredients_IngredientId",
                table: "RecipeIngredient");

            migrationBuilder.DropForeignKey(
                name: "FK_RecipeIngredient_Recipes_RecipeId",
                table: "RecipeIngredient");

            migrationBuilder.DropForeignKey(
                name: "FK_RecipeRecipeTag_RecipeTag_RecipeTagsId",
                table: "RecipeRecipeTag");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RecipeTag",
                table: "RecipeTag");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RecipeIngredient",
                table: "RecipeIngredient");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RecipeComponent",
                table: "RecipeComponent");

            migrationBuilder.DropPrimaryKey(
                name: "PK_IngredientTag",
                table: "IngredientTag");

            migrationBuilder.RenameTable(
                name: "RecipeTag",
                newName: "RecipeTags");

            migrationBuilder.RenameTable(
                name: "RecipeIngredient",
                newName: "RecipeIngredients");

            migrationBuilder.RenameTable(
                name: "RecipeComponent",
                newName: "RecipeComponents");

            migrationBuilder.RenameTable(
                name: "IngredientTag",
                newName: "IngredientTags");

            migrationBuilder.RenameIndex(
                name: "IX_RecipeIngredient_RecipeId",
                table: "RecipeIngredients",
                newName: "IX_RecipeIngredients_RecipeId");

            migrationBuilder.RenameIndex(
                name: "IX_RecipeIngredient_IngredientId",
                table: "RecipeIngredients",
                newName: "IX_RecipeIngredients_IngredientId");

            migrationBuilder.RenameIndex(
                name: "IX_RecipeComponent_ParentRecipeId",
                table: "RecipeComponents",
                newName: "IX_RecipeComponents_ParentRecipeId");

            migrationBuilder.RenameIndex(
                name: "IX_RecipeComponent_ComponentRecipeId",
                table: "RecipeComponents",
                newName: "IX_RecipeComponents_ComponentRecipeId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RecipeTags",
                table: "RecipeTags",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RecipeIngredients",
                table: "RecipeIngredients",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RecipeComponents",
                table: "RecipeComponents",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_IngredientTags",
                table: "IngredientTags",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_IngredientIngredientTag_IngredientTags_IngredientTagsId",
                table: "IngredientIngredientTag",
                column: "IngredientTagsId",
                principalTable: "IngredientTags",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

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

            migrationBuilder.AddForeignKey(
                name: "FK_RecipeIngredients_Ingredients_IngredientId",
                table: "RecipeIngredients",
                column: "IngredientId",
                principalTable: "Ingredients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RecipeIngredients_Recipes_RecipeId",
                table: "RecipeIngredients",
                column: "RecipeId",
                principalTable: "Recipes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RecipeRecipeTag_RecipeTags_RecipeTagsId",
                table: "RecipeRecipeTag",
                column: "RecipeTagsId",
                principalTable: "RecipeTags",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_IngredientIngredientTag_IngredientTags_IngredientTagsId",
                table: "IngredientIngredientTag");

            migrationBuilder.DropForeignKey(
                name: "FK_RecipeComponents_Recipes_ComponentRecipeId",
                table: "RecipeComponents");

            migrationBuilder.DropForeignKey(
                name: "FK_RecipeComponents_Recipes_ParentRecipeId",
                table: "RecipeComponents");

            migrationBuilder.DropForeignKey(
                name: "FK_RecipeIngredients_Ingredients_IngredientId",
                table: "RecipeIngredients");

            migrationBuilder.DropForeignKey(
                name: "FK_RecipeIngredients_Recipes_RecipeId",
                table: "RecipeIngredients");

            migrationBuilder.DropForeignKey(
                name: "FK_RecipeRecipeTag_RecipeTags_RecipeTagsId",
                table: "RecipeRecipeTag");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RecipeTags",
                table: "RecipeTags");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RecipeIngredients",
                table: "RecipeIngredients");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RecipeComponents",
                table: "RecipeComponents");

            migrationBuilder.DropPrimaryKey(
                name: "PK_IngredientTags",
                table: "IngredientTags");

            migrationBuilder.RenameTable(
                name: "RecipeTags",
                newName: "RecipeTag");

            migrationBuilder.RenameTable(
                name: "RecipeIngredients",
                newName: "RecipeIngredient");

            migrationBuilder.RenameTable(
                name: "RecipeComponents",
                newName: "RecipeComponent");

            migrationBuilder.RenameTable(
                name: "IngredientTags",
                newName: "IngredientTag");

            migrationBuilder.RenameIndex(
                name: "IX_RecipeIngredients_RecipeId",
                table: "RecipeIngredient",
                newName: "IX_RecipeIngredient_RecipeId");

            migrationBuilder.RenameIndex(
                name: "IX_RecipeIngredients_IngredientId",
                table: "RecipeIngredient",
                newName: "IX_RecipeIngredient_IngredientId");

            migrationBuilder.RenameIndex(
                name: "IX_RecipeComponents_ParentRecipeId",
                table: "RecipeComponent",
                newName: "IX_RecipeComponent_ParentRecipeId");

            migrationBuilder.RenameIndex(
                name: "IX_RecipeComponents_ComponentRecipeId",
                table: "RecipeComponent",
                newName: "IX_RecipeComponent_ComponentRecipeId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RecipeTag",
                table: "RecipeTag",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RecipeIngredient",
                table: "RecipeIngredient",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RecipeComponent",
                table: "RecipeComponent",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_IngredientTag",
                table: "IngredientTag",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_IngredientIngredientTag_IngredientTag_IngredientTagsId",
                table: "IngredientIngredientTag",
                column: "IngredientTagsId",
                principalTable: "IngredientTag",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RecipeComponent_Recipes_ComponentRecipeId",
                table: "RecipeComponent",
                column: "ComponentRecipeId",
                principalTable: "Recipes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RecipeComponent_Recipes_ParentRecipeId",
                table: "RecipeComponent",
                column: "ParentRecipeId",
                principalTable: "Recipes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RecipeIngredient_Ingredients_IngredientId",
                table: "RecipeIngredient",
                column: "IngredientId",
                principalTable: "Ingredients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RecipeIngredient_Recipes_RecipeId",
                table: "RecipeIngredient",
                column: "RecipeId",
                principalTable: "Recipes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RecipeRecipeTag_RecipeTag_RecipeTagsId",
                table: "RecipeRecipeTag",
                column: "RecipeTagsId",
                principalTable: "RecipeTag",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
