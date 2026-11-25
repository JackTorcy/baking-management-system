using System.ComponentModel.DataAnnotations;

public class LoginRequest
{
    [Required(ErrorMessage = "Enter your email")]
    public string Email { get; set; } = "";

    [Required(ErrorMessage = "Enter your password")]
    public string Password { get; set; } = "";
}
