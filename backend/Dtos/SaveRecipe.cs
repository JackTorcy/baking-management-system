using System.ComponentModel.DataAnnotations;

public class SaveRecipe
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = "";

    [Required]
    [RegularExpression(
        @"^\d*\.?\d{1,2}$",
        ErrorMessage = "Price must be a number with up to 2 decimal places"
    )]
    public string Price { get; set; } = "";

    [Required]
    [MaxLength(100)]
    public string Description { get; set; } = "";

    public List<RecipeIngredientDto> Ingredients { get; set; } = new();
}
