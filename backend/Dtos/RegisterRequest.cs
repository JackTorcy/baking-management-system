using System.ComponentModel.DataAnnotations;

public class RegisterRequest
{
    [Required(ErrorMessage = "Enter your bakery name")]
    [MaxLength(100, ErrorMessage = "Bakery name must be 100 characters or less")]
    public string BakeryName { get; set; } = "";

    [Required(ErrorMessage = "Enter your email")]
    [EmailAddress(ErrorMessage = "Enter a valid email address")]
    [MaxLength(256)]
    public string Email { get; set; } = "";

    [Required(ErrorMessage = "Enter your email")]
    [MinLength(15, ErrorMessage = "Password must be at least 15 characters")]
    [MaxLength(128, ErrorMessage = "Password must be 128 characters or less")]
    public string Password { get; set; } = "";
}
