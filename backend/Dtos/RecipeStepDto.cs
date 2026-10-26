using System.ComponentModel.DataAnnotations;

public class RecipeStepDto
{
    public int? Id { get; set; }

    [Required]
    [MaxLength(2000)]
    public string Instruction { get; set; } = "";

    public List<RecipeIngredientDto> Ingredients { get; set; } = new();
    public List<RecipeComponentDto> Components { get; set; } = new();
}
