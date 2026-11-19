using System.ComponentModel.DataAnnotations;

namespace backend.Tests;

public class SaveIngredientTests
{
    private static SaveIngredient Save(string price, string packSize, IngredientUnit unit) =>
        new()
        {
            Name = "Flour",
            Price = price,
            PackSize = packSize,
            IngredientUnit = unit,
        };

    private static List<ValidationResult> Errors(SaveIngredient dto) =>
        dto.Validate(new ValidationContext(dto)).ToList();

    [Fact]
    public void Validate_AcceptsAUnitPriceUnderTheCap()
    {
        Assert.Empty(Errors(Save("2", "250", IngredientUnit.gram)));
    }

    [Fact]
    public void Validate_RejectsAUnitPriceOverTheCapOnPrice()
    {
        var error = Assert.Single(Errors(Save("1000", "1", IngredientUnit.kilogram)));

        Assert.Equal("Price per kilogram can't be over £999", error.ErrorMessage);
        Assert.Equal(["Price"], error.MemberNames);
    }

    [Fact]
    public void Validate_AcceptsAUnitPriceAtTheCap()
    {
        Assert.Empty(Errors(Save("999", "1", IngredientUnit.kilogram)));
    }

    [Fact]
    public void Validate_CapsThePricePerPackUnitWithoutConverting()
    {
        Assert.Empty(Errors(Save("1000", "1000", IngredientUnit.gram)));
    }

    [Fact]
    public void Validate_LeavesUnparseablePricesToTheAttributes()
    {
        Assert.Empty(Errors(Save("abc", "1", IngredientUnit.kilogram)));
    }

    [Fact]
    public void Validate_RejectsAPriceOfZero()
    {
        var error = Assert.Single(Errors(Save("0", "1", IngredientUnit.kilogram)));

        Assert.Equal("Price must be greater than 0", error.ErrorMessage);
        Assert.Equal(["Price"], error.MemberNames);
    }

    [Fact]
    public void Validate_RejectsAnEmptyPackWithoutDividingByIt()
    {
        var error = Assert.Single(Errors(Save("1000", "0", IngredientUnit.kilogram)));

        Assert.Equal("Pack size must be greater than 0", error.ErrorMessage);
        Assert.Equal(["PackSize"], error.MemberNames);
    }

    // The rest go through Validator, which like MVC only calls Validate once the attributes pass
    [Theory]
    [InlineData("10000000", "100000", "Price")]
    [InlineData("1000000000000000000000000000000", "1", "Price")]
    [InlineData("1", "100000000000", "PackSize")]
    [InlineData("1", "1000000000000000000000000000000", "PackSize")]
    public void Validation_RejectsNumbersTooBigForTheColumnWithoutThrowing(
        string price,
        string packSize,
        string member
    )
    {
        var dto = Save(price, packSize, IngredientUnit.gram);
        var results = new List<ValidationResult>();

        Assert.False(Validator.TryValidateObject(dto, new ValidationContext(dto), results, true));
        var error = Assert.Single(results);
        Assert.Equal([member], error.MemberNames);
    }

    [Theory]
    [InlineData("9999999.9999", "99999999999.9999")]
    [InlineData(".5", "1")]
    public void Validation_AcceptsNumbersThatFitTheColumn(string price, string packSize)
    {
        var dto = Save(price, packSize, IngredientUnit.gram);

        Assert.True(Validator.TryValidateObject(dto, new ValidationContext(dto), [], true));
    }
}
