using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace api_app.Migrations
{
    /// <inheritdoc />
    public partial class AddRecipeSteps : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RecipeSteps",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RecipeId = table.Column<int>(type: "integer", nullable: false),
                    Position = table.Column<int>(type: "integer", nullable: false),
                    Instruction = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecipeSteps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RecipeSteps_Recipes_RecipeId",
                        column: x => x.RecipeId,
                        principalTable: "Recipes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RecipeStepComponents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RecipeStepId = table.Column<int>(type: "integer", nullable: false),
                    RecipeComponentId = table.Column<int>(type: "integer", nullable: false),
                    Quantity = table.Column<decimal>(type: "numeric", nullable: false),
                    Unit = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecipeStepComponents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RecipeStepComponents_RecipeComponents_RecipeComponentId",
                        column: x => x.RecipeComponentId,
                        principalTable: "RecipeComponents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RecipeStepComponents_RecipeSteps_RecipeStepId",
                        column: x => x.RecipeStepId,
                        principalTable: "RecipeSteps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RecipeStepIngredients",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RecipeStepId = table.Column<int>(type: "integer", nullable: false),
                    RecipeIngredientId = table.Column<int>(type: "integer", nullable: false),
                    Quantity = table.Column<decimal>(type: "numeric", nullable: false),
                    Unit = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecipeStepIngredients", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RecipeStepIngredients_RecipeIngredients_RecipeIngredientId",
                        column: x => x.RecipeIngredientId,
                        principalTable: "RecipeIngredients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RecipeStepIngredients_RecipeSteps_RecipeStepId",
                        column: x => x.RecipeStepId,
                        principalTable: "RecipeSteps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RecipeStepComponents_RecipeComponentId",
                table: "RecipeStepComponents",
                column: "RecipeComponentId");

            migrationBuilder.CreateIndex(
                name: "IX_RecipeStepComponents_RecipeStepId",
                table: "RecipeStepComponents",
                column: "RecipeStepId");

            migrationBuilder.CreateIndex(
                name: "IX_RecipeStepIngredients_RecipeIngredientId",
                table: "RecipeStepIngredients",
                column: "RecipeIngredientId");

            migrationBuilder.CreateIndex(
                name: "IX_RecipeStepIngredients_RecipeStepId",
                table: "RecipeStepIngredients",
                column: "RecipeStepId");

            migrationBuilder.CreateIndex(
                name: "IX_RecipeSteps_RecipeId",
                table: "RecipeSteps",
                column: "RecipeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RecipeStepComponents");

            migrationBuilder.DropTable(
                name: "RecipeStepIngredients");

            migrationBuilder.DropTable(
                name: "RecipeSteps");
        }
    }
}
