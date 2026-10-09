using Microsoft.EntityFrameworkCore;

public interface IIngredientService
{
    Task<List<IngredientResponse>> GetAllAsync();
    Task<IngredientResponse?> GetAsync(int id);
    Task<IngredientResponse> CreateAsync(SaveIngredient dto);
    Task<bool> DeleteAsync(int id);
    Task<IngredientResponse?> UpdateAsync(int id, SaveIngredient dto);
}

public class IngredientService : IIngredientService
{
    private readonly AppDbContext _db;
    public IngredientService(AppDbContext db) 
    {
        _db = db;
    }

    public async Task<List<IngredientResponse>> GetAllAsync()
    {
        var ingredients = await _db.Ingredients.ToListAsync();
        return ingredients.Select(ToResponse).ToList();
    }

    public async Task<IngredientResponse?> GetAsync(int id)
    {
        var ingredient = await _db.Ingredients.FindAsync(id);
        if (ingredient == null) return null;

        return ToResponse(ingredient);
    }

    public async Task<IngredientResponse> CreateAsync(SaveIngredient dto)
    {
        Ingredient ingredient = new Ingredient
        {
            Name = dto.Name,
            Price = decimal.Parse(dto.Price),
            IngredientUnit = dto.IngredientUnit
        };

        _db.Ingredients.Add(ingredient);
        await _db.SaveChangesAsync();
        return ToResponse(ingredient);
    }

    public async Task<IngredientResponse?> UpdateAsync(int id, SaveIngredient dto)
    {
        var ingredient = await _db.Ingredients.FindAsync(id);
        if (ingredient == null) return null;

        ingredient.Name = dto.Name;
        ingredient.Price = decimal.Parse(dto.Price);
        ingredient.IngredientUnit = dto.IngredientUnit;

        await _db.SaveChangesAsync();
        return ToResponse(ingredient);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var ingredient = await _db.Ingredients.FindAsync(id);
        if (ingredient == null) return false;
        
        ingredient.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return true;
    }

    private static IngredientResponse ToResponse(Ingredient i) => new()
    {
        Id = i.Id,
        Name = i.Name,
        Price = i.Price.ToString("0.########"),        
        IngredientUnit = i.IngredientUnit,
    };
}