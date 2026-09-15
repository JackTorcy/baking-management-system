
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
}