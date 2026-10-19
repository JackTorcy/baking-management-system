using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

public class AppDbContext : IdentityDbContext<AppUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<Bakery> Bakeries => Set<Bakery>();
    public DbSet<Ingredient> Ingredients => Set<Ingredient>();
    public DbSet<IngredientTag> IngredientTags => Set<IngredientTag>();
    public DbSet<RecipeIngredient> RecipeIngredients => Set<RecipeIngredient>();
    public DbSet<Recipe> Recipes => Set<Recipe>();
    public DbSet<RecipeTag> RecipeTags => Set<RecipeTag>();
    public DbSet<RecipeComponent> RecipeComponents => Set<RecipeComponent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        //Must be first line.
        base.OnModelCreating(modelBuilder);

        modelBuilder
            .Entity<AppUser>()
            .HasOne(u => u.Bakery)
            .WithMany(b => b.Users)
            .HasForeignKey(u => u.BakeryId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Ingredient>().HasQueryFilter(i => i.DeletedAt == null);

        modelBuilder.Entity<Recipe>().HasQueryFilter(r => r.DeletedAt == null);

        // Recipe ↔ Recipe (self-referencing — needs explicit FK mapping)
        modelBuilder
            .Entity<RecipeComponent>()
            .HasOne(rc => rc.ParentRecipe)
            .WithMany(r => r.Components)
            .HasForeignKey(rc => rc.ParentRecipeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder
            .Entity<RecipeComponent>()
            .HasOne(rc => rc.ComponentRecipe)
            .WithMany(r => r.UsedIn)
            .HasForeignKey(rc => rc.ComponentRecipeId)
            .OnDelete(DeleteBehavior.Restrict);

        // Recipe ↔ Ingredient (standard — EF can mostly infer this, but explicit is clear)
        modelBuilder
            .Entity<RecipeIngredient>()
            .HasOne(ri => ri.Recipe)
            .WithMany(r => r.Ingredients)
            .HasForeignKey(ri => ri.RecipeId);

        modelBuilder
            .Entity<RecipeIngredient>()
            .HasOne(ri => ri.Ingredient)
            .WithMany(i => i.UsedInRecipes)
            .HasForeignKey(ri => ri.IngredientId);
    }
}
