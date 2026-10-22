using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("recipes")]
public class RecipeController : ControllerBase
{
    private readonly IRecipeService _service;

    public RecipeController(IRecipeService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<RecipeResponse>>> GetRecipes()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RecipeResponse>> GetRecipe(int id)
    {
        var recipe = await _service.GetAsync(id);
        if (recipe == null)
            return NotFound();

        return Ok(recipe);
    }

    [HttpPost]
    public async Task<ActionResult<RecipeResponse>> CreateRecipe(SaveRecipe dto)
    {
        if (!await _service.IngredientsExistAsync(dto.Ingredients))
            return BadRequest("One or more ingredients don't exist");
        if (!await _service.ComponentsExistAsync(dto.Components))
            return BadRequest("One or more components don't exist");
        if (!await _service.UnitsMatchIngredientsAsync(dto.Ingredients))
            return BadRequest("Each ingredient's unit must match how that ingredient is measured");

        var recipe = await _service.CreateAsync(dto);
        if (recipe == null)
            return BadRequest("Failed to save");

        return CreatedAtAction(nameof(GetRecipe), new { id = recipe.Id }, recipe);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<RecipeResponse>> UpdateRecipe(int id, SaveRecipe dto)
    {
        if (!await _service.IngredientsExistAsync(dto.Ingredients))
            return BadRequest("One or more ingredients don't exist");
        if (!await _service.ComponentsExistAsync(dto.Components))
            return BadRequest("One or more components don't exist");
        if (!await _service.UnitsMatchIngredientsAsync(dto.Ingredients))
            return BadRequest("Each ingredient's unit must match how that ingredient is measured");
        if (await _service.CreatesLoopAsync(id, dto.Components))
            return BadRequest("A recipe can't contain itself, directly or through another recipe");

        var recipe = await _service.UpdateAsync(id, dto);
        if (recipe == null)
            return NotFound();

        return Ok(recipe);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteRecipe(int id)
    {
        if (await _service.IsUsedAsComponentAsync(id))
            return Conflict("This recipe is used in other recipes. Remove it from them first.");

        bool success = await _service.DeleteAsync(id);
        if (!success)
            return NotFound();
        return NoContent();
    }
}
