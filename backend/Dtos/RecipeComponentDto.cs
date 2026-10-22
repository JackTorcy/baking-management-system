using System.ComponentModel.DataAnnotations;

public class RecipeComponentDto
{
    public int ComponentId { get; set; }

    [Range(typeof(decimal), "0.0001", "99999", ErrorMessage = "Quantity must be greater than 0")]
    public decimal Quantity { get; set; }
}
