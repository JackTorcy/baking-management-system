
using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;

public class Recipe
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set;}
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}