public class RecipeResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Price { get; set; } = "";
    public string Description { get; set; } = "";
    public decimal YieldQuantity { get; set; }
    public IngredientUnit YieldUnit { get; set; }
    public string YieldLabel { get; set; } = "";
    public TinShape? TinShape { get; set; }
    public decimal? TinSize { get; set; }
    public decimal? TinWidth { get; set; }
    public LengthUnit? TinUnit { get; set; }
    public bool IsUsedAsComponent { get; set; }
    public List<RecipeIngredientDto> Ingredients { get; set; } = new();
    public List<RecipeComponentDto> Components { get; set; } = new();
}
