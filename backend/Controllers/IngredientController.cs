
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
    public async Task<ActionResult<List<Ingredient>>> GetIngredients()
    {
       return Ok(await _service.GetAllAsync());
    }
}