import { useState, useEffect } from "react";
import {
    describeYield,
    formatGBP,
    recipeCost,
    toFormRecipe,
    type ExistingRecipe,
    type RecipeResponse,
} from "../types/Recipe";
import type { ExistingIngredient } from "../types/Ingredient";
import PageTitle from "../components/ui/PageTitle";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { Link2, Plus, Search, TriangleAlert, X } from "lucide-react";
import { Link } from "react-router-dom";

interface RecipeWithStats {
    recipe: ExistingRecipe;
    price: number;
    cost: number;
    margin: number;
    marginPercent: number;
}

const sortOptions = {
    "name-asc": {
        label: "Name (A–Z)",
        compare: (a: RecipeWithStats, b: RecipeWithStats) =>
            a.recipe.name.localeCompare(b.recipe.name),
    },
    "name-desc": {
        label: "Name (Z–A)",
        compare: (a: RecipeWithStats, b: RecipeWithStats) =>
            b.recipe.name.localeCompare(a.recipe.name),
    },
    "margin-asc": {
        label: "Margin (lowest first)",
        compare: (a: RecipeWithStats, b: RecipeWithStats) => a.marginPercent - b.marginPercent,
    },
    "margin-desc": {
        label: "Margin (highest first)",
        compare: (a: RecipeWithStats, b: RecipeWithStats) => b.marginPercent - a.marginPercent,
    },
    "price-asc": {
        label: "Price (lowest first)",
        compare: (a: RecipeWithStats, b: RecipeWithStats) => a.price - b.price,
    },
    "price-desc": {
        label: "Price (highest first)",
        compare: (a: RecipeWithStats, b: RecipeWithStats) => b.price - a.price,
    },
};

type SortKey = keyof typeof sortOptions;

function RecipeList() {
    const [recipes, setRecipes] = useState<ExistingRecipe[]>([]);
    const [ingredients, setIngredients] = useState<ExistingIngredient[]>([]);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<SortKey>("name-asc");
    const [onlyNegativeMargin, setOnlyNegativeMargin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadFailed, setLoadFailed] = useState(false);

    const withStats: RecipeWithStats[] = recipes.map((recipe) => {
        const price = Number(recipe.price);
        const cost = recipeCost(recipe, recipes, ingredients, new Set([recipe.id]));
        const margin = price - cost;
        return {
            recipe,
            price,
            cost,
            margin,
            marginPercent: price > 0 ? (margin / price) * 100 : 0,
        };
    });
    const negativeMarginCount = withStats.filter((r) => r.margin < 0).length;

    const shownRecipes = withStats
        .filter((r) => r.recipe.name.toLowerCase().includes(search.trim().toLowerCase()))
        .filter((r) => !onlyNegativeMargin || r.margin < 0)
        .sort(sortOptions[sort].compare);

    useEffect(() => {
        const loadRecipes = async () => {
            setLoading(true);
            try {
                const [recipesRes, ingredientsRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/recipes`),
                    fetch(`${import.meta.env.VITE_API_URL}/ingredients`),
                ]);
                if (!recipesRes.ok) throw new Error(`load failed: ${recipesRes.status}`);
                if (!ingredientsRes.ok) throw new Error(`load failed: ${ingredientsRes.status}`);
                const data: RecipeResponse[] = await recipesRes.json();
                setRecipes(data.map(toFormRecipe));
                setIngredients(await ingredientsRes.json());
            } catch (err) {
                console.error(err);
                setLoadFailed(true);
            } finally {
                setLoading(false);
            }
        };

        loadRecipes();
    }, []);

    if (loadFailed) return <div>Failed to Load</div>;

    return (
        <div className="h-full flex flex-col">
            <div className="shrink-0">
                <PageTitle title="Recipes"></PageTitle>

                <div className="flex items-center gap-4 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="search"
                            aria-label="Search recipes"
                            className="border rounded-2xl border-border bg-surface w-full pl-10 pr-3 py-2"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <Link
                        to="/recipes/new"
                        aria-label="Add new recipe"
                        className="shrink-0 flex items-center gap-1 py-2 px-3 border border-border rounded-2xl text-header bg-primary hover:bg-primary-dark"
                    >
                        <Plus className="h-5 w-5" />
                        <span className="hidden md:inline">Add New Recipe</span>
                    </Link>
                </div>

                {recipes.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                        {negativeMarginCount > 0 ? (
                            <button
                                type="button"
                                aria-pressed={onlyNegativeMargin}
                                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold transition ${onlyNegativeMargin ? "bg-danger text-white hover:bg-danger/85" : "bg-danger/10 text-danger hover:bg-danger/20"}`}
                                onClick={() => setOnlyNegativeMargin((prev) => !prev)}
                            >
                                <TriangleAlert className="h-4 w-4" />
                                {negativeMarginCount}{" "}
                                {negativeMarginCount === 1 ? "recipe has" : "recipes have"} a
                                negative margin
                                {onlyNegativeMargin && <X className="h-4 w-4" />}
                            </button>
                        ) : (
                            <span />
                        )}
                        <label className="flex items-center gap-2 text-sm">
                            Sort
                            <select
                                className="border border-border bg-surface rounded-2xl py-1.5 px-3"
                                value={sort}
                                onChange={(e) => setSort(e.target.value as SortKey)}
                            >
                                {Object.entries(sortOptions).map(([key, option]) => (
                                    <option key={key} value={key}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner className="h-12 w-12 border-4 text-primary" />
                    </div>
                ) : recipes.length === 0 ? (
                    <div
                        role="status"
                        className="mb-4 rounded-xl bg-secondary/10 px-4 py-3 text-secondary-dark"
                    >
                        Get started by adding your first recipe.
                    </div>
                ) : shownRecipes.length === 0 ? (
                    <div role="status" className="py-12 text-center">
                        No recipes match “{search.trim()}”.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                        {shownRecipes.map(({ recipe: r, price, cost, margin, marginPercent }) => (
                            <Link
                                key={r.id}
                                to={`/recipes/${r.id}`}
                                className="flex flex-col bg-surface border rounded-2xl p-4 border-border transition hover:border-primary focus-visible:outline-2 focus-visible:outline-primary"
                            >
                                <div className="text-xl font-bold text-header truncate">
                                    {r.name}
                                </div>
                                <div className="mb-2 text-sm">{describeYield(r)}</div>
                                {r.isUsedAsComponent && (
                                    <div className="flex mb-2">
                                        <div className="flex text-xs px-2 rounded-full text-header bg-background">
                                            <Link2 className="w-4 h-4 mr-1" /> Used in other recipes
                                        </div>
                                    </div>
                                )}
                                <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-border/40 pt-3">
                                    <div>
                                        <dt className="text-xs">Price</dt>
                                        <dd className="font-semibold tabular-nums text-header">
                                            {formatGBP(price)}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs">Cost</dt>
                                        <dd className="font-semibold tabular-nums text-header">
                                            {formatGBP(cost)}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs">Margin</dt>
                                        <dd
                                            className={`font-semibold tabular-nums ${margin < 0 ? "text-danger" : "text-header"}`}
                                        >
                                            {price > 0 ? `${Math.round(marginPercent)}%` : "—"}
                                        </dd>
                                    </div>
                                </dl>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default RecipeList;
