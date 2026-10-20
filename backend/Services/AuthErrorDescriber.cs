using Microsoft.AspNetCore.Identity;

public class AuthErrorDescriber : IdentityErrorDescriber
{
    private const string EmailInUse =
        "An account with this email already exists. Try logging in instead.";

    public override IdentityError DuplicateUserName(string userName) =>
        new() { Code = nameof(DuplicateUserName), Description = EmailInUse };

    public override IdentityError DuplicateEmail(string email) =>
        new() { Code = nameof(DuplicateEmail), Description = EmailInUse };
}
