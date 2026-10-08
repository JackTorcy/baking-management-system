public class RecipeComponent
{
    public int Id { get; set; }
    public int ParentRecipeId { get; set; }
    public Recipe ParentRecipe { get; set; } = null!;
    public int ComponentRecipeId { get; set; }
    public Recipe ComponentRecipe { get; set; } = null!;
    //not sure whether we need quantity and unittype here
}