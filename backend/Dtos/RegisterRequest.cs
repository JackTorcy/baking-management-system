using System.ComponentModel.DataAnnotations;

public class RegisterRequest
{
    [Required]
    [MaxLength(100)]
    public string BakeryName { get; set; } = "";

    [Required]
    [MaxLength(256)]
    public string Email { get; set; } = "";

    [Required]
    [MinLength(15)]
    [MaxLength(128)]
    public string Password { get; set; } = "";
}
