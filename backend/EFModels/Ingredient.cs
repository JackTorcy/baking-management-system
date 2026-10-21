using System.ComponentModel.DataAnnotations.Schema;

public class Ingredient : IBakeryOwned
{
    public int Id { get; set; }
    public string Name { get; set; } = "";

    [Column(TypeName = "numeric(15,8)")]
    public decimal Price { get; set; }

    [Column(TypeName = "numeric(15,4)")]
    public decimal PackSize { get; set; } = 1;
    public IngredientUnit IngredientUnit { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }

    public List<RecipeIngredient> UsedInRecipes { get; set; } = new();
    public List<IngredientTag> IngredientTags { get; set; } = new();
    public int BakeryId { get; set; }
    public Bakery Bakery { get; set; } = null!;
}
