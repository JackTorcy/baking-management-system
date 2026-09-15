using System.ComponentModel.DataAnnotations.Schema;

public class Ingredient
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public double Price { get; set;}
    public IngredientUnit IngredientUnit { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }
}