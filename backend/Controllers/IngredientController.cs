
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("ingredients")]
public class IngredientController : ControllerBase
{
    private readonly IIngredientService _service;
    public IngredientController(IIngredientService service) 
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<IngredientResponse>>> GetIngredients()
    {
       return Ok(await _service.GetAllAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<IngredientResponse>> GetIngredient(int id)
    {
        var ingredient = await _service.GetAsync(id);
        if (ingredient == null) return NotFound();

        return Ok(ingredient);
    }

    [HttpPost]
    public async Task<ActionResult<IngredientResponse>> CreateIngredient(SaveIngredient dto)
    {
        var ingredient = await _service.CreateAsync(dto);
        if (ingredient == null) return BadRequest("Failed to save");

        return CreatedAtAction(nameof(GetIngredient), new { id = ingredient.Id}, ingredient);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<IngredientResponse>> EditIngredient(int id, SaveIngredient dto)
    {
        var ingredient = await _service.UpdateAsync(id, dto);
        if (ingredient == null) return NotFound();

        return Ok(ingredient);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteIngredient(int id)
    {   
        bool success = await _service.DeleteAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }
}