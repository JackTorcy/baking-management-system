public class RecipeComponent
{
    public int Id { get; set; }
    public int RecipeId { get; set; }
    public Recipe Recipe { get; set; } = null!;
    public int ComponentId { get; set; }
    public Recipe Component { get; set; } = null!;
    public decimal Quantity { get; set; }
    public IngredientUnit Unit { get; set; } = IngredientUnit.item;
}
