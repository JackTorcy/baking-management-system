using Microsoft.EntityFrameworkCore;

public interface IIngredientService
{
    Task<List<Ingredient>> GetAllAsync();
    // Task<Ingredient?> GetAsync(int id);
    // Task<Ingredient> CreateAsync(Ingredient ingredient);
    // Task<bool> DeleteAsync(int id);
    // Task<bool> EditAsync(int id, Ingredient ingredient);
}

public class IngredientService : IIngredientService
{
    private readonly AppDbContext _db;
    public IngredientService(AppDbContext db) 
    {
        _db = db;
    }

    public async Task<List<Ingredient>> GetAllAsync()
    {
        return await _db.Ingredients.ToListAsync();
    }
}