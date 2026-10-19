using Microsoft.EntityFrameworkCore;

public interface IRecipeService
{
    Task<List<RecipeResponse>> GetAllAsync();
    Task<RecipeResponse?> GetAsync(int id);
    Task<RecipeResponse> CreateAsync(SaveRecipe dto);
    Task<bool> DeleteAsync(int id);
    Task<RecipeResponse?> UpdateAsync(int id, SaveRecipe dto);
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
        //Need to copy include from GetAsync in order to get RecipeIngredients, if needed later
        var recipes = await _db.Recipes.ToListAsync();
        return recipes.Select(ToResponse).ToList();
    }

    public async Task<RecipeResponse?> GetAsync(int id)
    {
        var recipe = await _db
            .Recipes.Include(r => r.Ingredients.OrderBy(ri => ri.Id))
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
                existing.Quantity = i.Quantity;
            else
                recipe.Ingredients.Add(
                    new RecipeIngredient { IngredientId = i.IngredientId, Quantity = i.Quantity }
                );
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
                })
                .ToList(),
        };
}
