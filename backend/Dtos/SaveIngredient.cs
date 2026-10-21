using System.ComponentModel.DataAnnotations;

public class SaveIngredient : IValidatableObject
{
    private const decimal MaxUnitPrice = 999m;

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = "";

    [Required]
    [RegularExpression(@"^\d*\.?\d{1,4}$", ErrorMessage = "Price must be a number with up to 4 decimal places")]
    public string Price { get; set; } = "";

    [Required]
    [RegularExpression(@"^\d*\.?\d{1,4}$", ErrorMessage = "Pack size must be a number with up to 4 decimal places")]
    [Range(typeof(decimal), "0.0001", "99999999999", ErrorMessage = "Pack size must be greater than 0")]
    public string PackSize { get; set; } = "1";

    [Required]
    [EnumDataType(typeof(IngredientUnit))]
    public IngredientUnit IngredientUnit { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (decimal.TryParse(Price, out var price)
            && decimal.TryParse(PackSize, out var packSize)
            && packSize > 0
            && price / packSize > MaxUnitPrice)
        {
            yield return new ValidationResult(
                $"Price per {IngredientUnit} can't be over £{MaxUnitPrice}",
                [nameof(Price)]);
        }
    }
}
