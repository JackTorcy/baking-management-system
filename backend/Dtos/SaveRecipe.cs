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

    [Range(typeof(decimal), "0.0001", "99999", ErrorMessage = "Yield must be greater than 0")]
    public decimal YieldQuantity { get; set; } = 1;

    [EnumDataType(typeof(IngredientUnit))]
    public IngredientUnit YieldUnit { get; set; } = IngredientUnit.item;

    [MaxLength(30)]
    public string YieldLabel { get; set; } = "";

    [EnumDataType(typeof(TinShape))]
    public TinShape? TinShape { get; set; }

    [Range(typeof(decimal), "0.1", "999", ErrorMessage = "Tin size must be greater than 0")]
    public decimal? TinSize { get; set; }

    [Range(typeof(decimal), "0.1", "999", ErrorMessage = "Tin width must be greater than 0")]
    public decimal? TinWidth { get; set; }

    [EnumDataType(typeof(LengthUnit))]
    public LengthUnit? TinUnit { get; set; }

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

        if (TinShape == null)
            yield break;

        if (YieldUnit != IngredientUnit.item)
            yield return new ValidationResult(
                "Only recipes measured by count can have a tin",
                [nameof(TinShape)]
            );

        if (TinSize == null || TinUnit == null)
            yield return new ValidationResult("Tin size and unit are required", [nameof(TinSize)]);

        if (TinShape == global::TinShape.rectangle && TinWidth == null)
            yield return new ValidationResult("Rectangle tins need a width", [nameof(TinWidth)]);
    }
}
