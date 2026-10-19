public class RecipeTag : IBakeryOwned
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public List<Recipe> UsedInRecipes { get; set; } = new();
    public int BakeryId { get; set; }
    public Bakery Bakery { get; set; } = null!;
}
