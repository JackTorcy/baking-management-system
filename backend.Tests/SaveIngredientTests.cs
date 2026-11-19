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
    public void Validate_SkipsTheCapForAnEmptyPack()
    {
        Assert.Empty(Errors(Save("1000", "0", IngredientUnit.kilogram)));
    }

    // Goes through Validator, which like MVC only calls Validate once the attributes pass,
    // so the Range on Price stops a huge price before Validate divides it and overflows
    [Fact]
    public void Validation_RejectsAHugePriceWithoutOverflowing()
    {
        var dto = Save("10000000000000000000000000000", "0.0001", IngredientUnit.kilogram);
        var results = new List<ValidationResult>();

        Assert.False(Validator.TryValidateObject(dto, new ValidationContext(dto), results, true));
        var error = Assert.Single(results);
        Assert.Equal(["Price"], error.MemberNames);
    }
}
