using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace api_app.Migrations
{
    /// <inheritdoc />
    public partial class AddIngredientRecipeTags : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "IngredientTag",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IngredientTag", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RecipeTag",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecipeTag", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "IngredientIngredientTag",
                columns: table => new
                {
                    IngredientTagsId = table.Column<int>(type: "integer", nullable: false),
                    UsedInIngredientsId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IngredientIngredientTag", x => new { x.IngredientTagsId, x.UsedInIngredientsId });
                    table.ForeignKey(
                        name: "FK_IngredientIngredientTag_IngredientTag_IngredientTagsId",
                        column: x => x.IngredientTagsId,
                        principalTable: "IngredientTag",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_IngredientIngredientTag_Ingredients_UsedInIngredientsId",
                        column: x => x.UsedInIngredientsId,
                        principalTable: "Ingredients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RecipeRecipeTag",
                columns: table => new
                {
                    RecipeTagsId = table.Column<int>(type: "integer", nullable: false),
                    UsedInRecipesId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecipeRecipeTag", x => new { x.RecipeTagsId, x.UsedInRecipesId });
                    table.ForeignKey(
                        name: "FK_RecipeRecipeTag_RecipeTag_RecipeTagsId",
                        column: x => x.RecipeTagsId,
                        principalTable: "RecipeTag",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RecipeRecipeTag_Recipes_UsedInRecipesId",
                        column: x => x.UsedInRecipesId,
                        principalTable: "Recipes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_IngredientIngredientTag_UsedInIngredientsId",
                table: "IngredientIngredientTag",
                column: "UsedInIngredientsId");

            migrationBuilder.CreateIndex(
                name: "IX_RecipeRecipeTag_UsedInRecipesId",
                table: "RecipeRecipeTag",
                column: "UsedInRecipesId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "IngredientIngredientTag");

            migrationBuilder.DropTable(
                name: "RecipeRecipeTag");

            migrationBuilder.DropTable(
                name: "IngredientTag");

            migrationBuilder.DropTable(
                name: "RecipeTag");
        }
    }
}
