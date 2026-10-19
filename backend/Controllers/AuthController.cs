using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly SignInManager<AppUser> _signInManager;
    private readonly AppDbContext _db;

    public AuthController(
        UserManager<AppUser> userManager,
        SignInManager<AppUser> signInManager,
        AppDbContext db
    )
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _db = db;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<ActionResult> Register(RegisterRequest dto)
    {
        await using var transaction = await _db.Database.BeginTransactionAsync();

        var bakery = new Bakery { Name = dto.BakeryName };
        _db.Bakeries.Add(bakery);
        await _db.SaveChangesAsync();

        var user = new AppUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            BakeryId = bakery.Id,
        };
        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return BadRequest(result.Errors.Select(e => e.Description));

        await transaction.CommitAsync();
        await _signInManager.SignInAsync(user, isPersistent: true);
        return NoContent();
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<ActionResult> Login(LoginRequest dto)
    {
        var result = await _signInManager.PasswordSignInAsync(
            dto.Email,
            dto.Password,
            isPersistent: true,
            lockoutOnFailure: true
        );

        if (!result.Succeeded)
            return Unauthorized("Invalid email or password");

        return NoContent();
    }

    [HttpPost("logout")]
    public async Task<ActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        return NoContent();
    }

    [HttpGet("me")]
    public async Task<ActionResult<MeResponse>> Me()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();

        var bakery = await _db.Bakeries.FindAsync(user.BakeryId);
        return Ok(
            new MeResponse
            {
                Email = user.Email!,
                BakeryId = user.BakeryId,
                BakeryName = bakery!.Name,
            }
        );
    }
}
