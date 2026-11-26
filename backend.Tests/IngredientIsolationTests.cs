using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace backend.Tests;

public class IngredientIsolationTests : IClassFixture<ApiFactory>
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() },
    };

    private readonly ApiFactory _factory;

    public IngredientIsolationTests(ApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetMe_ReturnsTheSignedInUsersBakery()
    {
        var (client, bakeryId) = await _factory.CreateBakeryClientAsync();

        var response = await client.GetAsync("/auth/me");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var me = await response.Content.ReadFromJsonAsync<MeResponse>(Json);
        Assert.Equal(bakeryId, me!.BakeryId);
    }

    [Fact]
    public async Task GetIngredients_WithoutSignIn_ReturnsUnauthorized()
    {
        var response = await _factory.CreateClient().GetAsync("/ingredients");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetIngredients_ForANewBakery_ReturnsEmpty()
    {
        var (client, _) = await _factory.CreateBakeryClientAsync();

        var response = await client.GetAsync("/ingredients");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty((await response.Content.ReadFromJsonAsync<List<IngredientResponse>>(Json))!);
    }

    [Fact]
    public async Task BakeryA_CannotReadBakeryBsIngredients()
    {
        var (bakeryA, _) = await _factory.CreateBakeryClientAsync();
        var (bakeryB, _) = await _factory.CreateBakeryClientAsync();

        var created = await bakeryB.PostAsJsonAsync(
            "/ingredients",
            new
            {
                name = "Flour",
                price = "2",
                packSize = "1000",
                ingredientUnit = "gram",
            }
        );
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        var id = (await created.Content.ReadFromJsonAsync<IngredientResponse>(Json))!.Id;

        var listForA = await bakeryA.GetFromJsonAsync<List<IngredientResponse>>(
            "/ingredients",
            Json
        );
        Assert.DoesNotContain(listForA!, i => i.Id == id);
        Assert.Equal(
            HttpStatusCode.NotFound,
            (await bakeryA.GetAsync($"/ingredients/{id}")).StatusCode
        );
        Assert.Equal(HttpStatusCode.OK, (await bakeryB.GetAsync($"/ingredients/{id}")).StatusCode);
    }
}
