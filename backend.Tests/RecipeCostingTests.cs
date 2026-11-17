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

    public static TheoryData<decimal, IngredientUnit, decimal, IngredientUnit, decimal> YieldFractions =>
        new()
        {
            { 300m, IngredientUnit.gram, 800m, IngredientUnit.gram, 0.375m },
            { 300m, IngredientUnit.gram, 1000m, IngredientUnit.gram, 0.3m },
            { 0.4m, IngredientUnit.litre, 2m, IngredientUnit.litre, 0.2m },
            { 12m, IngredientUnit.item, 16m, IngredientUnit.item, 0.75m },
            { 1800m, IngredientUnit.gram, 3m, IngredientUnit.kilogram, 0.6m },
            { 0.3m, IngredientUnit.kilogram, 600m, IngredientUnit.gram, 0.5m },
            { 1800m, IngredientUnit.millilitre, 3m, IngredientUnit.litre, 0.6m },
            { 0.3m, IngredientUnit.litre, 600m, IngredientUnit.millilitre, 0.5m },
        };

    [Theory]
    [MemberData(nameof(YieldFractions))]
    public void YieldFraction_ConvertsAmountToShareOfYield(
        decimal quantity,
        IngredientUnit unit,
        decimal yieldQuantity,
        IngredientUnit yieldUnit,
        decimal expected
    )
    {
        var recipe = new Recipe { YieldQuantity = yieldQuantity, YieldUnit = yieldUnit };

        Assert.Equal(expected, RecipeCosting.YieldFraction(recipe, quantity, unit));
    }

    [Fact]
    public void YieldFraction_ReturnsZeroForEmptyYield()
    {
        var recipe = new Recipe { YieldQuantity = 0m, YieldUnit = IngredientUnit.gram };

        Assert.Equal(0m, RecipeCosting.YieldFraction(recipe, 300m, IngredientUnit.gram));
    }

    private static readonly Ingredient Flour = new()
    {
        Id = 1,
        Price = 1.50m,
        PackSize = 1m,
        IngredientUnit = IngredientUnit.kilogram,
    };

    private static readonly Ingredient Butter = new()
    {
        Id = 2,
        Price = 2m,
        PackSize = 250m,
        IngredientUnit = IngredientUnit.gram,
    };

    private static readonly Ingredient PoundEach = new()
    {
        Id = 3,
        Price = 1m,
        PackSize = 1m,
        IngredientUnit = IngredientUnit.item,
    };

    private static RecipeIngredient Uses(Ingredient ingredient, decimal quantity, IngredientUnit unit) =>
        new()
        {
            IngredientId = ingredient.Id,
            Ingredient = ingredient,
            Quantity = quantity,
            Unit = unit,
        };

    private static RecipeComponent UsesRecipe(
        int componentId,
        decimal quantity,
        IngredientUnit unit = IngredientUnit.item
    ) =>
        new()
        {
            ComponentId = componentId,
            Quantity = quantity,
            Unit = unit,
        };

    // A uses B and C, which both use D (£4)
    private static List<Recipe> Diamond() =>
        [
            new Recipe { Id = 1, Components = [UsesRecipe(2, 1m), UsesRecipe(3, 1m)] },
            new Recipe { Id = 2, Components = [UsesRecipe(4, 1m)] },
            new Recipe { Id = 3, Components = [UsesRecipe(4, 1m)] },
            new Recipe { Id = 4, Ingredients = [Uses(PoundEach, 4m, IngredientUnit.item)] },
        ];

    [Fact]
    public void CostAll_ReturnsNothingForNoRecipes()
    {
        Assert.Empty(RecipeCosting.CostAll([]));
    }

    [Fact]
    public void CostAll_CostsAnEmptyRecipeAtZero()
    {
        Assert.Equal(
            new Dictionary<int, decimal> { { 1, 0m } },
            RecipeCosting.CostAll([new Recipe { Id = 1 }])
        );
    }

    [Fact]
    public void CostAll_SumsIngredientsConvertedToEachPackUnit()
    {
        var recipe = new Recipe
        {
            Id = 1,
            Ingredients =
            [
                Uses(Flour, 500m, IngredientUnit.gram),
                Uses(Butter, 125m, IngredientUnit.gram),
            ],
        };

        Assert.Equal(1.75m, RecipeCosting.CostAll([recipe])[1]);
    }

    [Fact]
    public void CostAll_ReturnsACostForEveryRecipeById()
    {
        var recipes = new List<Recipe>
        {
            new() { Id = 1, Ingredients = [Uses(Flour, 500m, IngredientUnit.gram)] },
            new() { Id = 2, Ingredients = [Uses(Butter, 125m, IngredientUnit.gram)] },
        };

        Assert.Equal(
            new Dictionary<int, decimal> { { 1, 0.75m }, { 2, 1m } },
            RecipeCosting.CostAll(recipes)
        );
    }

    [Fact]
    public void CostAll_AddsTheShareOfAComponentUsed()
    {
        var recipes = new List<Recipe>
        {
            new() { Id = 1, Components = [UsesRecipe(2, 250m, IngredientUnit.gram)] },
            new()
            {
                Id = 2,
                YieldQuantity = 1m,
                YieldUnit = IngredientUnit.kilogram,
                Ingredients = [Uses(PoundEach, 2m, IngredientUnit.item)],
            },
        };

        Assert.Equal(0.5m, RecipeCosting.CostAll(recipes)[1]);
    }

    [Fact]
    public void CostAll_MultipliesSharesOfNestedComponents()
    {
        var recipes = new List<Recipe>
        {
            new() { Id = 1, Components = [UsesRecipe(2, 0.5m)] },
            new() { Id = 2, Components = [UsesRecipe(3, 0.5m)] },
            new() { Id = 3, Ingredients = [Uses(PoundEach, 4m, IngredientUnit.item)] },
        };

        Assert.Equal(
            new Dictionary<int, decimal> { { 1, 1m }, { 2, 2m }, { 3, 4m } },
            RecipeCosting.CostAll(recipes)
        );
    }

    [Fact]
    public void CostAll_CountsASharedComponentOnEveryBranch()
    {
        Assert.Equal(
            new Dictionary<int, decimal> { { 1, 8m }, { 2, 4m }, { 3, 4m }, { 4, 4m } },
            RecipeCosting.CostAll(Diamond())
        );
    }

    [Fact]
    public void CostAll_GivesTheSameCostsWhateverTheOrder()
    {
        Assert.Equal(
            RecipeCosting.CostAll(Diamond()),
            RecipeCosting.CostAll(Enumerable.Reverse(Diamond()))
        );
    }

    [Fact]
    public void CostAll_SkipsComponentsNotInTheSet()
    {
        var recipe = new Recipe
        {
            Id = 1,
            Ingredients = [Uses(Flour, 500m, IngredientUnit.gram)],
            Components = [UsesRecipe(99, 1m)],
        };

        Assert.Equal(0.75m, RecipeCosting.CostAll([recipe])[1]);
    }

    // Saving blocks loops, so this only checks costing finishes; the amounts depend on which recipe is costed first
    [Fact]
    public void CostAll_FinishesWhenRecipesFormALoop()
    {
        var recipes = new List<Recipe>
        {
            new()
            {
                Id = 1,
                Ingredients = [Uses(PoundEach, 1m, IngredientUnit.item)],
                Components = [UsesRecipe(2, 1m)],
            },
            new()
            {
                Id = 2,
                Ingredients = [Uses(PoundEach, 1m, IngredientUnit.item)],
                Components = [UsesRecipe(1, 1m)],
            },
        };

        Assert.Equal(2, RecipeCosting.CostAll(recipes).Count);
    }

    [Fact]
    public void CostAll_IgnoresARecipeUsingItself()
    {
        var recipe = new Recipe
        {
            Id = 1,
            Ingredients = [Uses(PoundEach, 1m, IngredientUnit.item)],
            Components = [UsesRecipe(1, 1m)],
        };

        Assert.Equal(1m, RecipeCosting.CostAll([recipe])[1]);
    }
}
