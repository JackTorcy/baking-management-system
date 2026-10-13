public class IngredientResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Price { get; set; } = "";
    public IngredientUnit IngredientUnit { get; set; }
    public bool isUsedInRecipe {get; set;}
}