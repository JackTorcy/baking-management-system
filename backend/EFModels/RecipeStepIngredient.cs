public class RecipeStepIngredient
{
    public int Id { get; set; }
    public int RecipeStepId { get; set; }
    public RecipeStep RecipeStep { get; set; } = null!;
    public int RecipeIngredientId { get; set; }
    public RecipeIngredient RecipeIngredient { get; set; } = null!;
    public decimal Quantity { get; set; }
    public IngredientUnit Unit { get; set; }
}
