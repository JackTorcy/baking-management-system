public enum IngredientUnit
{
    kilogram = 1,
    gram = 2,
    millilitre = 3,
    litre = 4,
    item = 5
}

public enum UnitKind
{
    Weight,
    Volume,
    Count
}

public static class IngredientUnitExtensions
{
    public static UnitKind Kind(this IngredientUnit unit) => unit switch
    {
        IngredientUnit.kilogram or IngredientUnit.gram => UnitKind.Weight,
        IngredientUnit.millilitre or IngredientUnit.litre => UnitKind.Volume,
        IngredientUnit.item => UnitKind.Count,
        _ => throw new ArgumentOutOfRangeException(nameof(unit), unit, null)
    };

    public static decimal Factor(this IngredientUnit unit) => unit switch
    {
        IngredientUnit.kilogram or IngredientUnit.litre => 1000m,
        _ => 1m
    };
}
