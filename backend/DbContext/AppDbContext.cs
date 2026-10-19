using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

public class AppDbContext : IdentityDbContext<AppUser>
{
    private readonly ICurrentUser _currentUser;

    public AppDbContext(DbContextOptions<AppDbContext> options, ICurrentUser currentUser)
        : base(options)
    {
        _currentUser = currentUser;
    }

    private int CurrentBakeryId => _currentUser.BakeryId;
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

        modelBuilder
            .Entity<Ingredient>()
            .HasQueryFilter(i => i.DeletedAt == null && i.BakeryId == CurrentBakeryId);
        modelBuilder
            .Entity<Recipe>()
            .HasQueryFilter(r => r.DeletedAt == null && r.BakeryId == CurrentBakeryId);
        modelBuilder.Entity<IngredientTag>().HasQueryFilter(t => t.BakeryId == CurrentBakeryId);
        modelBuilder.Entity<RecipeTag>().HasQueryFilter(t => t.BakeryId == CurrentBakeryId);

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

    public override Task<int> SaveChangesAsync(
        bool acceptAllChangesOnSuccess,
        CancellationToken cancellationToken = default
    )
    {
        foreach (
            var entry in ChangeTracker
                .Entries<IBakeryOwned>()
                .Where(e => e.State == EntityState.Added)
        )
            entry.Entity.BakeryId = _currentUser.BakeryId;

        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }
}
