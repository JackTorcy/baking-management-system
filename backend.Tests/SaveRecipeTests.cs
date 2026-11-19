using System.ComponentModel.DataAnnotations;

namespace backend.Tests;

public class SaveRecipeTests
{
    private const int Flour = 1;
    private const int Jam = 2;
    private const int NotInRecipe = 99;

    private static RecipeIngredientDto Uses(
        int ingredientId,
        decimal quantity,
        IngredientUnit unit = IngredientUnit.gram
    ) =>
        new()
        {
            IngredientId = ingredientId,
            Quantity = quantity,
            Unit = unit,
        };

    private static RecipeComponentDto UsesRecipe(
        int componentId,
        decimal quantity,
        IngredientUnit unit = IngredientUnit.gram
    ) =>
        new()
        {
            ComponentId = componentId,
            Quantity = quantity,
            Unit = unit,
        };

    private static RecipeStepDto Step(
        List<RecipeIngredientDto>? ingredients = null,
        List<RecipeComponentDto>? components = null
    ) =>
        new()
        {
            Instruction = "Mix",
            Ingredients = ingredients ?? [],
            Components = components ?? [],
        };

    // 300 g flour and 100 g jam, all used in one step
    private static SaveRecipe Valid() =>
        new()
        {
            Name = "Victoria sponge",
            Description = "Classic sponge",
            Ingredients = [Uses(Flour, 300m)],
            Components = [UsesRecipe(Jam, 100m)],
            Steps = [Step([Uses(Flour, 300m)], [UsesRecipe(Jam, 100m)])],
        };

    private static SaveRecipe WithRoundTin()
    {
        var dto = Valid();
        dto.TinShape = TinShape.round;
        dto.TinSize = 20m;
        dto.TinUnit = LengthUnit.centimetre;
        return dto;
    }

    private static List<ValidationResult> Errors(SaveRecipe dto) =>
        dto.Validate(new ValidationContext(dto)).ToList();

    private static void AssertSingleError(SaveRecipe dto, string message, string member)
    {
        var error = Assert.Single(Errors(dto));
        Assert.Equal(message, error.ErrorMessage);
        Assert.Equal([member], error.MemberNames);
    }

    [Fact]
    public void Validate_AcceptsAValidRecipe()
    {
        Assert.Empty(Errors(Valid()));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void Validate_AllowsNoSellingPrice(string? sellingPrice)
    {
        var dto = Valid();
        dto.SellingPrice = sellingPrice;

        Assert.Empty(Errors(dto));
    }

    [Theory]
    [InlineData("0")]
    [InlineData("0.00")]
    public void Validate_RejectsASellingPriceOfZero(string sellingPrice)
    {
        var dto = Valid();
        dto.SellingPrice = sellingPrice;

        AssertSingleError(dto, "Selling price must be greater than 0", "SellingPrice");
    }

    [Fact]
    public void Validate_LeavesUnparseableSellingPricesToTheAttributes()
    {
        var dto = Valid();
        dto.SellingPrice = "abc";

        Assert.Empty(Errors(dto));
    }

    [Fact]
    public void Validate_RejectsTheSameIngredientTwice()
    {
        var dto = Valid();
        dto.Ingredients = [Uses(Flour, 100m), Uses(Flour, 200m)];
        dto.Steps = [];

        AssertSingleError(dto, "Each ingredient can only be added once", "Ingredients");
    }

    [Fact]
    public void Validate_RejectsTheSameComponentTwice()
    {
        var dto = Valid();
        dto.Components = [UsesRecipe(Jam, 50m), UsesRecipe(Jam, 50m)];
        dto.Steps = [];

        AssertSingleError(dto, "Each component can only be added once", "Components");
    }

    public static TheoryData<RecipeStepDto> StepsUsingALineTwice =>
        new()
        {
            Step([Uses(Flour, 100m), Uses(Flour, 200m)]),
            Step(components: [UsesRecipe(Jam, 50m), UsesRecipe(Jam, 50m)]),
        };

    [Theory]
    [MemberData(nameof(StepsUsingALineTwice))]
    public void Validate_RejectsAStepUsingTheSameLineTwice(RecipeStepDto step)
    {
        var dto = Valid();
        dto.Steps = [step];

        AssertSingleError(
            dto,
            "Each ingredient and component can only be added to a step once",
            "Steps"
        );
    }

    public static TheoryData<RecipeStepDto> StepsUsingLinesNotInTheRecipe =>
        new()
        {
            Step([Uses(NotInRecipe, 100m)]),
            Step(components: [UsesRecipe(NotInRecipe, 50m)]),
        };

    [Theory]
    [MemberData(nameof(StepsUsingLinesNotInTheRecipe))]
    public void Validate_RejectsAStepUsingSomethingNotInTheRecipe(RecipeStepDto step)
    {
        var dto = Valid();
        dto.Steps = [step];

        AssertSingleError(
            dto,
            "Steps can only use ingredients and components in this recipe",
            "Steps"
        );
    }

    public static TheoryData<RecipeStepDto> StepsMeasuringADifferentKind =>
        new()
        {
            Step([Uses(Flour, 100m, IngredientUnit.millilitre)]),
            Step(components: [UsesRecipe(Jam, 1m, IngredientUnit.item)]),
        };

    [Theory]
    [MemberData(nameof(StepsMeasuringADifferentKind))]
    public void Validate_RejectsAStepMeasuringADifferentKindOfUnit(RecipeStepDto step)
    {
        var dto = Valid();
        dto.Steps = [step];

        AssertSingleError(
            dto,
            "Step amounts must use the same kind of unit as the recipe",
            "Steps"
        );
    }

    public static TheoryData<List<RecipeStepDto>> StepsUsingTooMuch =>
        new()
        {
            new List<RecipeStepDto> { Step([Uses(Flour, 200m)]), Step([Uses(Flour, 200m)]) },
            new List<RecipeStepDto>
            {
                Step(components: [UsesRecipe(Jam, 60m)]),
                Step(components: [UsesRecipe(Jam, 60m)]),
            },
        };

    [Theory]
    [MemberData(nameof(StepsUsingTooMuch))]
    public void Validate_RejectsStepsUsingMoreThanTheRecipeHas(List<RecipeStepDto> steps)
    {
        var dto = Valid();
        dto.Steps = steps;

        AssertSingleError(
            dto,
            "Steps use more of an ingredient or component than the recipe has",
            "Steps"
        );
    }

    [Fact]
    public void Validate_AcceptsStepsUsingExactlyWhatTheRecipeHasInAnotherUnit()
    {
        var dto = Valid();
        dto.Ingredients = [Uses(Flour, 0.3m, IngredientUnit.kilogram)];
        dto.Steps = [Step([Uses(Flour, 100m)]), Step([Uses(Flour, 200m)])];

        Assert.Empty(Errors(dto));
    }

    [Fact]
    public void Validate_ReportsOnlyTheFirstStepUsageProblem()
    {
        var dto = Valid();
        dto.Steps = [Step([Uses(Flour, 400m)], [UsesRecipe(Jam, 1m, IngredientUnit.item)])];

        AssertSingleError(
            dto,
            "Steps use more of an ingredient or component than the recipe has",
            "Steps"
        );
    }

    [Fact]
    public void Validate_IgnoresTinRulesWhenThereIsNoTin()
    {
        var dto = Valid();
        dto.YieldUnit = IngredientUnit.gram;

        Assert.Empty(Errors(dto));
    }

    [Fact]
    public void Validate_AcceptsARoundTinWithoutAWidth()
    {
        Assert.Empty(Errors(WithRoundTin()));
    }

    [Fact]
    public void Validate_RejectsATinForARecipeNotMeasuredByCount()
    {
        var dto = WithRoundTin();
        dto.YieldUnit = IngredientUnit.gram;

        AssertSingleError(dto, "Only recipes measured by count can have a tin", "TinShape");
    }

    [Theory]
    [InlineData(null, LengthUnit.centimetre)]
    [InlineData(20.0, null)]
    public void Validate_RequiresATinSizeAndUnit(double? size, LengthUnit? unit)
    {
        var dto = WithRoundTin();
        dto.TinSize = (decimal?)size;
        dto.TinUnit = unit;

        AssertSingleError(dto, "Tin size and unit are required", "TinSize");
    }

    [Fact]
    public void Validate_RequiresAWidthForARectangleTin()
    {
        var dto = WithRoundTin();
        dto.TinShape = TinShape.rectangle;

        AssertSingleError(dto, "Rectangle tins need a width", "TinWidth");
    }

    [Fact]
    public void Validate_ReportsEveryProblemAtOnce()
    {
        var dto = WithRoundTin();
        dto.SellingPrice = "0";
        dto.Ingredients = [Uses(Flour, 100m), Uses(Flour, 200m)];
        dto.Steps = [];
        dto.TinShape = TinShape.rectangle;

        Assert.Equal(
            ["SellingPrice", "Ingredients", "TinWidth"],
            Errors(dto).Select(e => e.MemberNames.Single())
        );
    }

    // Goes through Validator, which like MVC checks the attributes before Validate
    [Theory]
    [InlineData("10000000")]
    [InlineData("1000000000000000000000000000000")]
    public void Validation_RejectsASellingPriceOver7DigitsWithoutThrowing(string sellingPrice)
    {
        var dto = Valid();
        dto.SellingPrice = sellingPrice;
        var results = new List<ValidationResult>();

        Assert.False(Validator.TryValidateObject(dto, new ValidationContext(dto), results, true));
        var error = Assert.Single(results);
        Assert.Equal(["SellingPrice"], error.MemberNames);
    }

    [Theory]
    [InlineData("")]
    [InlineData("9999999.99")]
    [InlineData(".5")]
    public void Validation_AcceptsASellingPriceThatFits(string sellingPrice)
    {
        var dto = Valid();
        dto.SellingPrice = sellingPrice;

        Assert.True(Validator.TryValidateObject(dto, new ValidationContext(dto), [], true));
    }
}
