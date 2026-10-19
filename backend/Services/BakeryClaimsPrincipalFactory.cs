using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

public class BakeryClaimsPrincipalFactory : UserClaimsPrincipalFactory<AppUser>
{
    public BakeryClaimsPrincipalFactory(
        UserManager<AppUser> userManager,
        IOptions<IdentityOptions> options
    )
        : base(userManager, options) { }

    protected override async Task<ClaimsIdentity> GenerateClaimsAsync(AppUser user)
    {
        var identity = await base.GenerateClaimsAsync(user);
        identity.AddClaim(new Claim("BakeryId", user.BakeryId.ToString()));
        return identity;
    }
}
