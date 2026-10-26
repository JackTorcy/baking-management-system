using Microsoft.EntityFrameworkCore;

public interface IRecipeService
{
    Task<List<RecipeResponse>> GetAllAsync();
    Task<RecipeResponse?> GetAsync(int id);
    Task<RecipeResponse> CreateAsync(SaveRecipe dto);
    Task<bool> DeleteAsync(int id);
    Task<RecipeResponse?> UpdateAsync(int id, SaveRecipe dto);
    Task<bool> IngredientsExistAsync(List<RecipeIngredientDto> ingredients);
    Task<bool> ComponentsExistAsync(List<RecipeComponentDto> components);
    Task<bool> UnitsMatchIngredientsAsync(List<RecipeIngredientDto> ingredients);
    Task<bool> ComponentUnitsMatchYieldAsync(List<RecipeComponentDto> components);
    Task<bool> YieldChangeAllowedAsync(int id, IngredientUnit newUnit);
    Task<bool> CreatesLoopAsync(int id, List<RecipeComponentDto> components);
    Task<bool> IsUsedAsComponentAsync(int id);
}

public class RecipeService : IRecipeService
{
    private readonly AppDbContext _db;

    public RecipeService(AppDbContext db)
    {
        _db = db;
    }

    private IQueryable<Recipe> RecipesWithDetails() =>
        _db
            .Recipes.Include(r => r.Ingredients.OrderBy(ri => ri.Id))
            .Include(r => r.Components.OrderBy(rc => rc.Id))
            .Include(r => r.Steps)
                .ThenInclude(s => s.Ingredients)
            .Include(r => r.Steps)
                .ThenInclude(s => s.Components)
            .AsSplitQuery();

    public async Task<List<RecipeResponse>> GetAllAsync()
    {
        var recipes = await RecipesWithDetails().ToListAsync();

        var usedAsComponentIds = await _db
            .RecipeComponents.Select(rc => rc.ComponentId)
            .Distinct()
            .ToListAsync();
        var usedSet = usedAsComponentIds.ToHashSet();

        return recipes.Select(r => ToResponse(r, usedSet.Contains(r.Id))).ToList();
    }

    public async Task<RecipeResponse?> GetAsync(int id)
    {
        var recipe = await RecipesWithDetails().FirstOrDefaultAsync(r => r.Id == id);

        if (recipe == null)
            return null;

        return ToResponse(recipe, await IsUsedAsComponentAsync(id));
    }

    public async Task<RecipeResponse> CreateAsync(SaveRecipe dto)
    {
        Recipe recipe = new Recipe
        {
            Name = dto.Name,
            Price = decimal.Parse(dto.Price),
            Description = dto.Description,
        };
        SetYield(recipe, dto);

        recipe.Ingredients = dto
            .Ingredients.Select(i => new RecipeIngredient
            {
                IngredientId = i.IngredientId,
                Quantity = i.Quantity,
                Unit = i.Unit,
            })
            .ToList();

        recipe.Components = dto
            .Components.Select(c => new RecipeComponent
            {
                ComponentId = c.ComponentId,
                Quantity = c.Quantity,
                Unit = c.Unit,
            })
            .ToList();

        SetSteps(recipe, dto);

        _db.Recipes.Add(recipe);
        await _db.SaveChangesAsync();
        return ToResponse(recipe, false);
    }

    public async Task<RecipeResponse?> UpdateAsync(int id, SaveRecipe dto)
    {
        var recipe = await RecipesWithDetails().FirstOrDefaultAsync(r => r.Id == id);
        if (recipe == null)
            return null;

        recipe.Name = dto.Name;
        recipe.Price = decimal.Parse(dto.Price);
        recipe.Description = dto.Description;
        SetYield(recipe, dto);

        recipe.Ingredients.RemoveAll(ri =>
            !dto.Ingredients.Any(i => i.IngredientId == ri.IngredientId)
        );

        foreach (var i in dto.Ingredients)
        {
            var existing = recipe.Ingredients.FirstOrDefault(ri =>
                ri.IngredientId == i.IngredientId
            );
            if (existing != null)
            {
                existing.Quantity = i.Quantity;
                existing.Unit = i.Unit;
            }
            else
                recipe.Ingredients.Add(
                    new RecipeIngredient
                    {
                        IngredientId = i.IngredientId,
                        Quantity = i.Quantity,
                        Unit = i.Unit,
                    }
                );
        }

        recipe.Components.RemoveAll(rc =>
            !dto.Components.Any(c => c.ComponentId == rc.ComponentId)
        );

        foreach (var c in dto.Components)
        {
            var existing = recipe.Components.FirstOrDefault(rc => rc.ComponentId == c.ComponentId);
            if (existing != null)
            {
                existing.Quantity = c.Quantity;
                existing.Unit = c.Unit;
            }
            else
            {
                recipe.Components.Add(
                    new RecipeComponent
                    {
                        ComponentId = c.ComponentId,
                        Quantity = c.Quantity,
                        Unit = c.Unit,
                    }
                );
            }
        }

        SetSteps(recipe, dto);

        await _db.SaveChangesAsync();
        return ToResponse(recipe, await IsUsedAsComponentAsync(id));
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var recipe = await _db.Recipes.FindAsync(id);
        if (recipe == null)
            return false;

        recipe.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return true;
    }

    private static void SetYield(Recipe recipe, SaveRecipe dto)
    {
        var hasTin = dto.TinShape != null;
        recipe.YieldQuantity = dto.YieldQuantity;
        recipe.YieldUnit = dto.YieldUnit;
        recipe.YieldLabel = dto.YieldUnit == IngredientUnit.item ? dto.YieldLabel.Trim() : "";
        recipe.TinShape = dto.TinShape;
        recipe.TinSize = hasTin ? dto.TinSize : null;
        recipe.TinWidth = dto.TinShape == TinShape.rectangle ? dto.TinWidth : null;
        recipe.TinUnit = hasTin ? dto.TinUnit : null;
    }

    // Steps keep their Ids across saves so sessions can point at them; step amounts are simply rebuilt
    private static void SetSteps(Recipe recipe, SaveRecipe dto)
    {
        recipe.Steps.RemoveAll(s => !dto.Steps.Any(d => d.Id == s.Id));

        for (var position = 0; position < dto.Steps.Count; position++)
        {
            var stepDto = dto.Steps[position];
            var step = recipe.Steps.FirstOrDefault(s => s.Id == stepDto.Id);
            if (step == null)
            {
                step = new RecipeStep();
                recipe.Steps.Add(step);
            }

            step.Position = position;
            step.Instruction = stepDto.Instruction.Trim();
            step.Ingredients = stepDto
                .Ingredients.Select(i => new RecipeStepIngredient
                {
                    RecipeIngredient = recipe.Ingredients.First(ri =>
                        ri.IngredientId == i.IngredientId
                    ),
                    Quantity = i.Quantity,
                    Unit = i.Unit,
                })
                .ToList();
            step.Components = stepDto
                .Components.Select(c => new RecipeStepComponent
                {
                    RecipeComponent = recipe.Components.First(rc =>
                        rc.ComponentId == c.ComponentId
                    ),
                    Quantity = c.Quantity,
                    Unit = c.Unit,
                })
                .ToList();
        }
    }

    private static RecipeResponse ToResponse(Recipe r, bool isUsedAsComponent) =>
        new()
        {
            Id = r.Id,
            Name = r.Name,
            Price = r.Price.ToString("0.##"),
            Description = r.Description,
            YieldQuantity = r.YieldQuantity,
            YieldUnit = r.YieldUnit,
            YieldLabel = r.YieldLabel,
            TinShape = r.TinShape,
            TinSize = r.TinSize,
            TinWidth = r.TinWidth,
            TinUnit = r.TinUnit,
            IsUsedAsComponent = isUsedAsComponent,
            Ingredients = r
                .Ingredients.Select(i => new RecipeIngredientDto
                {
                    IngredientId = i.IngredientId,
                    Quantity = i.Quantity,
                    Unit = i.Unit,
                })
                .ToList(),
            Components = r
                .Components.Select(c => new RecipeComponentDto
                {
                    ComponentId = c.ComponentId,
                    Quantity = c.Quantity,
                    Unit = c.Unit,
                })
                .ToList(),
            Steps = r
                .Steps.OrderBy(s => s.Position)
                .Select(s => new RecipeStepDto
                {
                    Id = s.Id,
                    Instruction = s.Instruction,
                    Ingredients = s
                        .Ingredients.OrderBy(si => si.Id)
                        .Select(si => new RecipeIngredientDto
                        {
                            IngredientId = si.RecipeIngredient.IngredientId,
                            Quantity = si.Quantity,
                            Unit = si.Unit,
                        })
                        .ToList(),
                    Components = s
                        .Components.OrderBy(sc => sc.Id)
                        .Select(sc => new RecipeComponentDto
                        {
                            ComponentId = sc.RecipeComponent.ComponentId,
                            Quantity = sc.Quantity,
                            Unit = sc.Unit,
                        })
                        .ToList(),
                })
                .ToList(),
        };

    public async Task<bool> IngredientsExistAsync(List<RecipeIngredientDto> ingredients)
    {
        var ids = ingredients.Select(i => i.IngredientId).Distinct().ToList();
        var found = await _db.Ingredients.CountAsync(i => ids.Contains(i.Id));
        return found == ids.Count;
    }

    public async Task<bool> ComponentsExistAsync(List<RecipeComponentDto> components)
    {
        var ids = components.Select(c => c.ComponentId).Distinct().ToList();
        var found = await _db.Recipes.CountAsync(r => ids.Contains(r.Id));
        return found == ids.Count;
    }

    public async Task<bool> UnitsMatchIngredientsAsync(List<RecipeIngredientDto> ingredients)
    {
        var ids = ingredients.Select(i => i.IngredientId).Distinct().ToList();
        var units = await _db
            .Ingredients.Where(i => ids.Contains(i.Id))
            .ToDictionaryAsync(i => i.Id, i => i.IngredientUnit);

        return ingredients.All(ri =>
            units.TryGetValue(ri.IngredientId, out var unit) && unit.Kind() == ri.Unit.Kind()
        );
    }

    public async Task<bool> ComponentUnitsMatchYieldAsync(List<RecipeComponentDto> components)
    {
        var ids = components.Select(c => c.ComponentId).Distinct().ToList();
        var yieldUnits = await _db
            .Recipes.Where(r => ids.Contains(r.Id))
            .ToDictionaryAsync(r => r.Id, r => r.YieldUnit);

        return components.All(rc =>
            yieldUnits.TryGetValue(rc.ComponentId, out var unit) && unit.Kind() == rc.Unit.Kind()
        );
    }

    // Parent recipes store component quantities in a unit of the same kind as this yield, so switching kind would corrupt them
    public async Task<bool> YieldChangeAllowedAsync(int id, IngredientUnit newUnit)
    {
        var recipe = await _db.Recipes.FindAsync(id);
        if (recipe == null || recipe.YieldUnit.Kind() == newUnit.Kind())
            return true;

        return !await IsUsedAsComponentAsync(id);
    }

    public async Task<bool> CreatesLoopAsync(int recipeId, List<RecipeComponentDto> components)
    {
        var toVisit = new Queue<int>(components.Select(c => c.ComponentId));
        var visited = new HashSet<int>();

        while (toVisit.Count > 0)
        {
            var current = toVisit.Dequeue();
            if (current == recipeId)
                return true;
            if (!visited.Add(current))
                continue;

            var children = await _db
                .RecipeComponents.Where(rc => rc.RecipeId == current)
                .Select(rc => rc.ComponentId)
                .ToListAsync();
            foreach (var child in children)
                toVisit.Enqueue(child);
        }
        return false;
    }

    public async Task<bool> IsUsedAsComponentAsync(int id) =>
        await _db.RecipeComponents.AnyAsync(rc => rc.ComponentId == id);
}
