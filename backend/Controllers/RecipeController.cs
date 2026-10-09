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
        if (recipe == null) return NotFound();

        return Ok(recipe);
    }

    [HttpPost]
    public async Task<ActionResult<RecipeResponse>> CreateRecipe(SaveRecipe dto)
    {
        var recipe = await _service.CreateAsync(dto);
        if (recipe == null) return BadRequest("Failed to save");

        return CreatedAtAction(nameof(GetRecipe), new { id = recipe.Id }, recipe);
    }
    
    [HttpPut("{id}")]
    public async Task<ActionResult<RecipeResponse>> UpdateRecipe(int id, SaveRecipe dto)
    {
        var recipe = await _service.UpdateAsync(id, dto);
        if (recipe == null) return NotFound();

        return Ok(recipe);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteRecipe(int id)
    {
        bool success = await _service.DeleteAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }
}