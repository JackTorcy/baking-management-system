using System.Security.Claims;

public interface ICurrentUser
{
    int BakeryId { get; }
}

public class CurrentUser : ICurrentUser
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUser(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public int BakeryId =>
        int.TryParse(_httpContextAccessor.HttpContext?.User.FindFirstValue("BakeryId"), out var id)
            ? id
            : throw new InvalidOperationException("No bakery for the current request");
}
