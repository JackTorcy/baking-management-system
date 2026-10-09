
using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;

public class Recipe
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set;}
    public string Description { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }

    public List<RecipeComponent> Components { get; set;} = new();
    public List<RecipeComponent> UsedIn { get; set; } = new();
    public List<RecipeIngredient> Ingredients {get; set; } = new();
    public List<RecipeTag> RecipeTags { get; set; } = new();
}