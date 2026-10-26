using System.ComponentModel.DataAnnotations;

public class SaveRecipe : IValidatableObject
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = "";

    // Empty means the recipe isn't sold on its own, e.g. a biscuit base only used as a component
    [RegularExpression(
        @"^\d*\.?\d{1,2}$",
        ErrorMessage = "Selling price must be a number with up to 2 decimal places"
    )]
    public string? SellingPrice { get; set; }

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
    public List<RecipeStepDto> Steps { get; set; } = new();

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (decimal.TryParse(SellingPrice, out var sellingPrice) && sellingPrice <= 0)
            yield return new ValidationResult(
                "Selling price must be greater than 0",
                [nameof(SellingPrice)]
            );

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

        foreach (var error in ValidateSteps())
            yield return error;

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

    private IEnumerable<ValidationResult> ValidateSteps()
    {
        if (
            Steps.Any(s =>
                s.Ingredients.GroupBy(i => i.IngredientId).Any(g => g.Count() > 1)
                || s.Components.GroupBy(c => c.ComponentId).Any(g => g.Count() > 1)
            )
        )
            yield return new ValidationResult(
                "Each ingredient and component can only be added to a step once",
                [nameof(Steps)]
            );

        var ingredientErrors = Steps
            .SelectMany(s => s.Ingredients)
            .GroupBy(si => si.IngredientId)
            .Select(g =>
                StepUsageError(
                    Ingredients.FirstOrDefault(i => i.IngredientId == g.Key) is { } line
                        ? (line.Quantity, line.Unit)
                        : null,
                    g.Select(si => (si.Quantity, si.Unit))
                )
            );
        var componentErrors = Steps
            .SelectMany(s => s.Components)
            .GroupBy(sc => sc.ComponentId)
            .Select(g =>
                StepUsageError(
                    Components.FirstOrDefault(c => c.ComponentId == g.Key) is { } line
                        ? (line.Quantity, line.Unit)
                        : null,
                    g.Select(sc => (sc.Quantity, sc.Unit))
                )
            );

        var error = ingredientErrors.Concat(componentErrors).FirstOrDefault(e => e != null);
        if (error != null)
            yield return new ValidationResult(error, [nameof(Steps)]);
    }

    private static string? StepUsageError(
        (decimal Quantity, IngredientUnit Unit)? total,
        IEnumerable<(decimal Quantity, IngredientUnit Unit)> uses
    )
    {
        if (total == null)
            return "Steps can only use ingredients and components in this recipe";

        var (quantity, unit) = total.Value;
        if (uses.Any(u => u.Unit.Kind() != unit.Kind()))
            return "Step amounts must use the same kind of unit as the recipe";
        if (uses.Sum(u => u.Quantity * u.Unit.Factor()) > quantity * unit.Factor())
            return "Steps use more of an ingredient or component than the recipe has";
        return null;
    }
}
