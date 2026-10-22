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

    public async Task<List<RecipeResponse>> GetAllAsync()
    {
        var recipes = await _db
            .Recipes.Include(r => r.Ingredients.OrderBy(ri => ri.Id))
            .Include(r => r.Components.OrderBy(rc => rc.Id))
            .ToListAsync();
        return recipes.Select(ToResponse).ToList();
    }

    public async Task<RecipeResponse?> GetAsync(int id)
    {
        var recipe = await _db
            .Recipes.Include(r => r.Ingredients.OrderBy(ri => ri.Id))
            .Include(r => r.Components.OrderBy(rc => rc.Id))
            .FirstOrDefaultAsync(r => r.Id == id);

        if (recipe == null)
            return null;

        return ToResponse(recipe);
    }

    public async Task<RecipeResponse> CreateAsync(SaveRecipe dto)
    {
        Recipe recipe = new Recipe
        {
            Name = dto.Name,
            Price = decimal.Parse(dto.Price),
            Description = dto.Description,
        };

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
            })
            .ToList();

        _db.Recipes.Add(recipe);
        await _db.SaveChangesAsync();
        return ToResponse(recipe);
    }

    public async Task<RecipeResponse?> UpdateAsync(int id, SaveRecipe dto)
    {
        var recipe = await _db
            .Recipes.Include(r => r.Ingredients)
            .Include(r => r.Components)
            .FirstOrDefaultAsync(r => r.Id == id);
        if (recipe == null)
            return null;

        recipe.Name = dto.Name;
        recipe.Price = decimal.Parse(dto.Price);
        recipe.Description = dto.Description;

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
            }
            else
            {
                recipe.Components.Add(
                    new RecipeComponent { ComponentId = c.ComponentId, Quantity = c.Quantity }
                );
            }
        }

        await _db.SaveChangesAsync();
        return ToResponse(recipe);
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

    private static RecipeResponse ToResponse(Recipe r) =>
        new()
        {
            Id = r.Id,
            Name = r.Name,
            Price = r.Price.ToString("0.##"),
            Description = r.Description,
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
