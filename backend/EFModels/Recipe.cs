using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;

public class Recipe : IBakeryOwned
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public string Description { get; set; } = "";
    public decimal YieldQuantity { get; set; } = 1;
    public IngredientUnit YieldUnit { get; set; } = IngredientUnit.item;
    public string YieldLabel { get; set; } = "";
    public TinShape? TinShape { get; set; }
    public decimal? TinSize { get; set; }
    public decimal? TinWidth { get; set; }
    public LengthUnit? TinUnit { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }

    public List<RecipeComponent> Components { get; set; } = new();
    public List<RecipeComponent> UsedIn { get; set; } = new();
    public List<RecipeIngredient> Ingredients { get; set; } = new();
    public List<RecipeStep> Steps { get; set; } = new();
    public List<RecipeTag> RecipeTags { get; set; } = new();
    public int BakeryId { get; set; }
    public Bakery Bakery { get; set; } = null!;
}
