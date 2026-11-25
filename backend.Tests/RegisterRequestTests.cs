using System.ComponentModel.DataAnnotations;

namespace backend.Tests;

public class RegisterRequestTests
{
    private static RegisterRequest Valid() =>
        new()
        {
            BakeryName = "Rise & Shine",
            Email = "baker@bakery.com",
            Password = new string('p', 15),
        };

    private static RegisterRequest With(string member, string value)
    {
        var dto = Valid();
        typeof(RegisterRequest).GetProperty(member)!.SetValue(dto, value);
        return dto;
    }

    private static string OfLength(string member, int length) =>
        member == nameof(RegisterRequest.Email)
            ? new string('a', length - "@b.com".Length) + "@b.com"
            : new string('a', length);

    private static List<ValidationResult> Errors(RegisterRequest dto)
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
    [InlineData("BakeryName", "", "Enter your bakery name")]
    [InlineData("BakeryName", "   ", "Enter your bakery name")]
    [InlineData("Email", "", "Enter your email")]
    [InlineData("Email", "   ", "Enter your email")]
    [InlineData("Password", "", "Enter your password")]
    [InlineData("Password", "   ", "Enter your password")]
    public void Validation_RequiresEachFieldWithOnlyTheRequiredError(
        string member,
        string value,
        string message
    )
    {
        var error = Assert.Single(Errors(With(member, value)));

        Assert.Equal(message, error.ErrorMessage);
        Assert.Equal([member], error.MemberNames);
    }

    [Theory]
    [InlineData("BakeryName", 100)]
    [InlineData("Email", 256)]
    [InlineData("Password", 15)]
    [InlineData("Password", 128)]
    public void Validation_AcceptsLengthsAtTheLimits(string member, int length)
    {
        Assert.Empty(Errors(With(member, OfLength(member, length))));
    }

    [Theory]
    [InlineData("BakeryName", 101, "Bakery name must be 100 characters or less")]
    [InlineData(
        "Email",
        257,
        "The field Email must be a string or array type with a maximum length of '256'."
    )]
    [InlineData("Password", 14, "Password must be at least 15 characters")]
    [InlineData("Password", 129, "Password must be 128 characters or less")]
    public void Validation_RejectsLengthsPastTheLimits(string member, int length, string message)
    {
        var error = Assert.Single(Errors(With(member, OfLength(member, length))));

        Assert.Equal(message, error.ErrorMessage);
        Assert.Equal([member], error.MemberNames);
    }

    [Theory]
    [InlineData("baker")]
    [InlineData("@bakery.com")]
    [InlineData("baker@")]
    [InlineData("a@b@c")]
    public void Validation_RejectsMalformedEmails(string email)
    {
        var error = Assert.Single(Errors(With("Email", email)));

        Assert.Equal("Enter a valid email address", error.ErrorMessage);
        Assert.Equal(["Email"], error.MemberNames);
    }

    // EmailAddressAttribute only checks for one @ that isn't first or last
    [Fact]
    public void Validation_AcceptsAnEmailWithoutADomainSuffix()
    {
        Assert.Empty(Errors(With("Email", "a@b")));
    }
}
