public class RecipeTag
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public List<Recipe> UsedInRecipes { get; set; } = new();
}