namespace backend.Tests;

public class IngredientUnitExtensionsTests
{
    // Same rows as the frontend unitKind table, so both sides agree on which units can be mixed
    [Theory]
    [InlineData(IngredientUnit.kilogram, UnitKind.Weight)]
    [InlineData(IngredientUnit.gram, UnitKind.Weight)]
    [InlineData(IngredientUnit.millilitre, UnitKind.Volume)]
    [InlineData(IngredientUnit.litre, UnitKind.Volume)]
    [InlineData(IngredientUnit.item, UnitKind.Count)]
    public void Kind_GroupsEachUnitByWhatItMeasures(IngredientUnit unit, UnitKind expected)
    {
        Assert.Equal(expected, unit.Kind());
    }

    [Fact]
    public void Kind_ThrowsForAnUndefinedUnit()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => ((IngredientUnit)0).Kind());
    }

    // Same rows as the frontend unitFactor table; costing only compares ratios, so this is what pins the absolute values
    public static TheoryData<IngredientUnit, decimal> Factors =>
        new()
        {
            { IngredientUnit.kilogram, 1000m },
            { IngredientUnit.gram, 1m },
            { IngredientUnit.millilitre, 1m },
            { IngredientUnit.litre, 1000m },
            { IngredientUnit.item, 1m },
        };

    [Theory]
    [MemberData(nameof(Factors))]
    public void Factor_GivesHowManyBaseUnitsEachUnitHolds(IngredientUnit unit, decimal expected)
    {
        Assert.Equal(expected, unit.Factor());
    }
}
