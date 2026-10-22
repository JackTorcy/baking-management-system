using System.ComponentModel.DataAnnotations;

public class SaveRecipe : IValidatableObject
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
    public List<RecipeComponentDto> Components { get; set; } = new();

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Ingredients.GroupBy(i => i.IngredientId).Any(g => g.Count() > 1))
            yield return new ValidationResult(
                "Each ingredient can only be added once",
                [nameof(Ingredients)]
            );

        if (Components.GroupBy(c => c.ComponentId).Any(g => g.Count() > 1))
            yield return new ValidationResult(
                "Each component can only be added once",
                [nameof(Components)]
            );
    }
}
