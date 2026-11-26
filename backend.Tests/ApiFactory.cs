using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace backend.Tests;

public class ApiFactory : WebApplicationFactory<Program>
{
    public ApiFactory()
    {
        if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable("ConnectionStrings__Default")))
            throw new InvalidOperationException(
                "Set ConnectionStrings__Default to a test database before running integration tests"
            );
    }

    public async Task<(HttpClient Client, int BakeryId)> CreateBakeryClientAsync()
    {
        using var scope = Services.CreateScope();
        var services = scope.ServiceProvider;

        var bakery = new Bakery { Name = $"Test {Guid.NewGuid()}" };
        var db = services.GetRequiredService<AppDbContext>();
        db.Bakeries.Add(bakery);
        await db.SaveChangesAsync();

        var email = $"{Guid.NewGuid()}@test.local";
        var user = new AppUser
        {
            UserName = email,
            Email = email,
            BakeryId = bakery.Id,
        };
        var result = await services.GetRequiredService<UserManager<AppUser>>().CreateAsync(user);
        if (!result.Succeeded)
            throw new InvalidOperationException(
                string.Join(", ", result.Errors.Select(e => e.Description))
            );

        var principal = await services
            .GetRequiredService<SignInManager<AppUser>>()
            .CreateUserPrincipalAsync(user);
        var options = services
            .GetRequiredService<IOptionsMonitor<CookieAuthenticationOptions>>()
            .Get(IdentityConstants.ApplicationScheme);
        var cookie = options.TicketDataFormat.Protect(
            new AuthenticationTicket(principal, IdentityConstants.ApplicationScheme)
        );

        // Signs in without /auth/login: TestServer requests have no RemoteIpAddress, so they share one 5/min rate-limit bucket
        var client = CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        client.DefaultRequestHeaders.Add("Cookie", $"{options.Cookie.Name}={cookie}");
        return (client, bakery.Id);
    }
}
