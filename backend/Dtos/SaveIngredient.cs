using System.ComponentModel.DataAnnotations;

public class SaveIngredient : IValidatableObject
{
    private const decimal MaxUnitPrice = 999m;

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = "";

    // No [Range] on these strings: it throws when a number is too big for decimal, so the regexes cap
    // the whole digits to fit the numeric(15,8) and numeric(15,4) columns and Validate checks they're above 0
    [Required]
    [RegularExpression(
        @"^(\d{1,7}(\.\d{1,4})?|\.\d{1,4})$",
        ErrorMessage = "Price must be a number under 10,000,000 with up to 4 decimal places")]
    public string Price { get; set; } = "";

    [Required]
    [RegularExpression(
        @"^(\d{1,11}(\.\d{1,4})?|\.\d{1,4})$",
        ErrorMessage = "Pack size must be a number up to 11 digits long with up to 4 decimal places")]
    public string PackSize { get; set; } = "1";

    [Required]
    [EnumDataType(typeof(IngredientUnit))]
    public IngredientUnit IngredientUnit { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var hasPrice = decimal.TryParse(Price, out var price);
        var hasPackSize = decimal.TryParse(PackSize, out var packSize);

        if (hasPrice && price <= 0)
        {
            yield return new ValidationResult("Price must be greater than 0", [nameof(Price)]);
        }

        if (hasPackSize && packSize <= 0)
        {
            yield return new ValidationResult("Pack size must be greater than 0", [nameof(PackSize)]);
        }

        if (hasPrice && hasPackSize && packSize > 0 && price / packSize > MaxUnitPrice)
        {
            yield return new ValidationResult(
                $"Price per {IngredientUnit} can't be over £{MaxUnitPrice}",
                [nameof(Price)]);
        }
    }
}
