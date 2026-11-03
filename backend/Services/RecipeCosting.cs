public static class RecipeCosting
{
    // Recipes need Ingredients (with Ingredient) and Components loaded; components are looked up in the same set
    public static Dictionary<int, decimal> CostAll(IEnumerable<Recipe> recipes)
    {
        var byId = recipes.ToDictionary(r => r.Id);
        var costs = new Dictionary<int, decimal>();
        foreach (var recipe in byId.Values)
            Cost(recipe, byId, costs, new HashSet<int>());
        return costs;
    }

    public static decimal PricePer(Ingredient ingredient, IngredientUnit unit)
    {
        var packAmount = ingredient.PackSize * ingredient.IngredientUnit.Factor();
        return packAmount == 0 ? 0 : ingredient.Price * unit.Factor() / packAmount;
    }

    // How much of a recipe's yield the given amount is, e.g. 300g of a recipe that makes 800g = 0.375
    public static decimal YieldFraction(Recipe recipe, decimal quantity, IngredientUnit unit)
    {
        var yieldAmount = recipe.YieldQuantity * recipe.YieldUnit.Factor();
        return yieldAmount == 0 ? 0 : quantity * unit.Factor() / yieldAmount;
    }

    private static decimal Cost(
        Recipe recipe,
        Dictionary<int, Recipe> byId,
        Dictionary<int, decimal> costs,
        HashSet<int> visiting
    )
    {
        if (costs.TryGetValue(recipe.Id, out var known))
            return known;

        // Loops are blocked on save, but a component already being costed is skipped rather than recursing forever
        visiting.Add(recipe.Id);
        var cost = recipe.Ingredients.Sum(ri => ri.Quantity * PricePer(ri.Ingredient, ri.Unit));
        foreach (var rc in recipe.Components)
        {
            if (visiting.Contains(rc.ComponentId) || !byId.TryGetValue(rc.ComponentId, out var component))
                continue;
            cost +=
                YieldFraction(component, rc.Quantity, rc.Unit)
                * Cost(component, byId, costs, visiting);
        }
        visiting.Remove(recipe.Id);

        costs[recipe.Id] = cost;
        return cost;
    }
}
