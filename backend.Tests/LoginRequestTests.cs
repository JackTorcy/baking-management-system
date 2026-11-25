using System.ComponentModel.DataAnnotations;

namespace backend.Tests;

public class LoginRequestTests
{
    private static LoginRequest Valid() =>
        new() { Email = "baker@bakery.com", Password = new string('p', 15) };

    private static LoginRequest With(string member, string value)
    {
        var dto = Valid();
        typeof(LoginRequest).GetProperty(member)!.SetValue(dto, value);
        return dto;
    }

    private static List<ValidationResult> Errors(LoginRequest dto)
    {
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(dto, new ValidationContext(dto), results, true);
        return results;
    }

    [Fact]
    public void Validation_AcceptsAValidRequest()
    {
        Assert.Empty(Errors(Valid()));
    }

    [Theory]
    [InlineData("Email", "", "Enter your email")]
    [InlineData("Email", "   ", "Enter your email")]
    [InlineData("Password", "", "Enter your password")]
    [InlineData("Password", "   ", "Enter your password")]
    public void Validation_RequiresEachField(string member, string value, string message)
    {
        var error = Assert.Single(Errors(With(member, value)));

        Assert.Equal(message, error.ErrorMessage);
        Assert.Equal([member], error.MemberNames);
    }

    // Wrong credentials are left to sign-in, which answers 401 without saying which field was wrong
    [Fact]
    public void Validation_DoesNotApplyTheRegisterRules()
    {
        var dto = new LoginRequest { Email = "baker", Password = "a" };

        Assert.Empty(Errors(dto));
    }
}
