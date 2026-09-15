using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing.Tree;
using Microsoft.EntityFrameworkCore;

public interface IRecipeService
{
    Task<List<Recipe>> GetAllAsync();
    Task<Recipe?> GetAsync(int id);
    Task<Recipe> CreateAsync(Recipe recipe);
    Task<bool> DeleteAsync(int id);
    Task<bool> EditAsync(int id, Recipe recipe);
}

public class RecipeService : IRecipeService
{
    private readonly AppDbContext _db;
    public RecipeService(AppDbContext db) 
    {
        _db = db;
    }

    public async Task<List<Recipe>> GetAllAsync()
    {
        return await _db.Recipes.ToListAsync();
    }

    public async Task<Recipe?> GetAsync(int id)
    {
        return await _db.Recipes.FindAsync(id);
    }

    public async Task<Recipe> CreateAsync(Recipe recipe)
    {
        _db.Recipes.Add(recipe);
        await _db.SaveChangesAsync();
        return recipe;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var recipe = await _db.Recipes.FindAsync(id);
        if (recipe == null) return false;
        _db.Recipes.Remove(recipe);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> EditAsync(int id, Recipe recipe)
    {
        var exists = await _db.Recipes.FindAsync(id);
        if (exists is null) return false;

        exists.Name = recipe.Name;
        exists.Description = recipe.Description;
        exists.Price = recipe.Price;

        await _db.SaveChangesAsync();
        return true;
    }
}