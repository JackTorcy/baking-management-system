using System.Runtime.CompilerServices;
using Microsoft.EntityFrameworkCore;

public interface IIngredientService
{
    Task<List<IngredientResponse>> GetAllAsync();
    Task<IngredientResponse?> GetAsync(int id);
    Task<IngredientResponse> CreateAsync(SaveIngredient dto);
    Task<bool> DeleteAsync(int id);
    Task<IngredientResponse?> UpdateAsync(int id, SaveIngredient dto);
    Task<bool> UnitChangeAllowedAsync(int id, IngredientUnit newUnit);
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

        var usedIngredientIds = await _db
            .RecipeIngredients.Select(ri => ri.IngredientId)
            .Distinct()
            .ToListAsync();
        var usedSet = usedIngredientIds.ToHashSet();

        return ingredients.Select(i => ToResponse(i, usedSet.Contains(i.Id))).ToList();
    }

    public async Task<IngredientResponse?> GetAsync(int id)
    {
        var ingredient = await _db.Ingredients.FindAsync(id);
        if (ingredient == null)
            return null;

        var isUsed = await _db.RecipeIngredients.AnyAsync(ri => ri.IngredientId == id);
        return ToResponse(ingredient, isUsed);
    }

    public async Task<IngredientResponse> CreateAsync(SaveIngredient dto)
    {
        Ingredient ingredient = new Ingredient
        {
            Name = dto.Name,
            Price = decimal.Parse(dto.Price),
            PackSize = decimal.Parse(dto.PackSize),
            IngredientUnit = dto.IngredientUnit,
        };

        _db.Ingredients.Add(ingredient);
        await _db.SaveChangesAsync();

        return ToResponse(ingredient, false);
    }

    public async Task<IngredientResponse?> UpdateAsync(int id, SaveIngredient dto)
    {
        var ingredient = await _db.Ingredients.FindAsync(id);
        if (ingredient == null)
            return null;

        ingredient.Name = dto.Name;
        ingredient.Price = decimal.Parse(dto.Price);
        ingredient.PackSize = decimal.Parse(dto.PackSize);
        ingredient.IngredientUnit = dto.IngredientUnit;

        await _db.SaveChangesAsync();

        var isUsed = await _db.RecipeIngredients.AnyAsync(ri => ri.IngredientId == id);
        return ToResponse(ingredient, isUsed);
    }

    // Recipe quantities are stored in a unit of the same kind, so switching kind (e.g. g to ml) would corrupt them
    public async Task<bool> UnitChangeAllowedAsync(int id, IngredientUnit newUnit)
    {
        var ingredient = await _db.Ingredients.FindAsync(id);
        if (ingredient == null || ingredient.IngredientUnit.Kind() == newUnit.Kind())
            return true;

        return !await _db.RecipeIngredients.AnyAsync(ri => ri.IngredientId == id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var ingredient = await _db.Ingredients.FindAsync(id);
        if (ingredient == null)
            return false;

        var isUsedInRecipe = await _db.RecipeIngredients.AnyAsync(ri => ri.IngredientId == id);
        if (isUsedInRecipe)
            return false;

        ingredient.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return true;
    }

    private static IngredientResponse ToResponse(Ingredient i, bool isUsedInRecipe)
    {
        return new()
        {
            Id = i.Id,
            Name = i.Name,
            Price = i.Price.ToString("0.00######"),
            PackSize = i.PackSize.ToString("0.####"),
            IngredientUnit = i.IngredientUnit,
            isUsedInRecipe = isUsedInRecipe,
        };
    }
}
