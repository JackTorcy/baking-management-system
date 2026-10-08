public class IngredientTag
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<Ingredient> UsedInIngredients { get; set; } = new();
}