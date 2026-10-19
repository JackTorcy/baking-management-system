using Microsoft.AspNetCore.Identity;

public class AppUser : IdentityUser
{
    public int BakeryId { get; set; }
    public Bakery Bakery { get; set; } = null!;
}
