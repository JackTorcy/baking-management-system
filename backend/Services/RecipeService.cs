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
        var recipes = await _db.Recipes.ToListAsync();
        return recipes.Select(ToResponse).ToList();
    }

    public async Task<RecipeResponse?> GetAsync(int id)
    {
        var recipe = await _db.Recipes.FindAsync(id);
        if (recipe == null) return null;

        return ToResponse(recipe);
    }

    public async Task<RecipeResponse> CreateAsync(SaveRecipe dto)
    {
        Recipe recipe = new Recipe
        {
            Name = dto.Name,
            Price = decimal.Parse(dto.Price),
            Description = dto.Description
        };

        _db.Recipes.Add(recipe);
        await _db.SaveChangesAsync();
        return ToResponse(recipe);
    }

    public async Task<RecipeResponse?> UpdateAsync(int id, SaveRecipe dto)
    {
        var recipe = await _db.Recipes.FindAsync(id);
        if (recipe == null) return null;

        recipe.Name = dto.Name;
        recipe.Price = decimal.Parse(dto.Price);
        recipe.Description = dto.Description;

        await _db.SaveChangesAsync();
        return ToResponse(recipe);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var recipe = await _db.Recipes.FindAsync(id);
        if (recipe == null) return false;

        recipe.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return true;
    }

    private static RecipeResponse ToResponse(Recipe r) => new()
    {
        Id = r.Id,
        Name = r.Name,
        Price = r.Price.ToString("0.##"),        
        Description = r.Description
    };
}