using System.ComponentModel.DataAnnotations;

public class RecipeIngredientDto
{
    public int IngredientId { get; set; }
    public decimal Quantity { get; set; }

    [EnumDataType(typeof(IngredientUnit))]
    public IngredientUnit Unit { get; set; }
}
