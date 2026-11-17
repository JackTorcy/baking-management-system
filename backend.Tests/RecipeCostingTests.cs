namespace backend.Tests;

public class RecipeCostingTests
{
    // Same rows as the frontend pricePer tests, so both sides agree on unit prices
    public static TheoryData<decimal, decimal, IngredientUnit, IngredientUnit, decimal> UnitPrices =>
        new()
        {
            { 2m, 250m, IngredientUnit.gram, IngredientUnit.gram, 0.008m },
            { 1.50m, 1m, IngredientUnit.kilogram, IngredientUnit.gram, 0.0015m },
            { 2m, 250m, IngredientUnit.gram, IngredientUnit.kilogram, 8m },
            { 1.20m, 2m, IngredientUnit.litre, IngredientUnit.millilitre, 0.0006m },
            { 3m, 12m, IngredientUnit.item, IngredientUnit.item, 0.25m },
            { 4.50m, 1.5m, IngredientUnit.kilogram, IngredientUnit.kilogram, 3m },
        };

    [Theory]
    [MemberData(nameof(UnitPrices))]
    public void PricePer_ConvertsPackPriceToRequestedUnit(
        decimal price,
        decimal packSize,
        IngredientUnit packUnit,
        IngredientUnit per,
        decimal expected
    )
    {
        var ingredient = new Ingredient
        {
            Price = price,
            PackSize = packSize,
            IngredientUnit = packUnit,
        };

        Assert.Equal(expected, RecipeCosting.PricePer(ingredient, per));
    }

    [Fact]
    public void PricePer_ReturnsZeroForEmptyPack()
    {
        var ingredient = new Ingredient
        {
            Price = 2m,
            PackSize = 0m,
            IngredientUnit = IngredientUnit.gram,
        };

        Assert.Equal(0m, RecipeCosting.PricePer(ingredient, IngredientUnit.gram));
    }
}
