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
    public async Task<ActionResult<List<Recipe>>> GetRecipes()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Recipe>> GetRecipe(int id)
    {
        var recipe = await _service.GetAsync(id);
        if (recipe == null) return NotFound();
        return recipe;
    }

    [HttpPost]
    public async Task<ActionResult<Recipe>> Create(Recipe recipe)
    {
        var created = await _service.CreateAsync(recipe);
        return CreatedAtAction(nameof(GetRecipe), new { id = created.Id }, created);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        if (!deleted) return NotFound();
        return Ok();
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Recipe>> Edit(int id, Recipe recipe)
    {
        var edited = await _service.EditAsync(id, recipe);
        if (!edited) return NotFound();
        return Ok(edited);
    }
}