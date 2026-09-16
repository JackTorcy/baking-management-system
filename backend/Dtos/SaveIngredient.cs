using System.ComponentModel.DataAnnotations;

public class SaveIngredient
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = "";

    [Required]
    [RegularExpression(@"^\d*\.?\d{1,8}$", ErrorMessage = "Price must be a number with up to 8 decimal places")]
    public string Price { get; set; } = "";

    [Required]
    public IngredientUnit IngredientUnit { get; set; }
}