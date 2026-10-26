public class RecipeStepComponent
{
    public int Id { get; set; }
    public int RecipeStepId { get; set; }
    public RecipeStep RecipeStep { get; set; } = null!;
    public int RecipeComponentId { get; set; }
    public RecipeComponent RecipeComponent { get; set; } = null!;
    public decimal Quantity { get; set; }
    public IngredientUnit Unit { get; set; }
}
