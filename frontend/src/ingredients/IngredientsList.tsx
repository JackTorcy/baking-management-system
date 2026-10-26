import { useEffect, useState } from "react";
import { Plus, Search, Link2 } from "lucide-react";
import { Link } from "react-router-dom";

import { formatUnitPrice, pricePer, unitLabel, type ExistingIngredient } from "../types/Ingredient";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import PageTitle from "../components/ui/PageTitle";
import { useAuth } from "../auth/AuthContext";
import UnitBadge from "../components/ui/UnitBadge";

function IngredientsList() {
    const [ingredients, setIngredients] = useState<ExistingIngredient[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadFailed, setLoadFailed] = useState(false);
    const { user } = useAuth();

    const shownIngredients = ingredients.filter((i) =>
        i.name.toLowerCase().includes(search.trim().toLowerCase()),
    );

    useEffect(() => {
        const loadIngredients = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/ingredients`);
                if (!res.ok) throw new Error(`load failed: ${res.status}`);
                setIngredients(await res.json());
            } catch (err) {
                console.error(err);
                setLoadFailed(true);
            } finally {
                setLoading(false);
            }
        };

        loadIngredients();
    }, []);

    if (loadFailed) return <div>Failed to Load</div>;

    return (
        <div className="h-full flex flex-col">
            <div className="shrink-0">
                <PageTitle title="Ingredients"></PageTitle>

                <div className="flex items-center gap-4 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="search"
                            aria-label="Search ingredients"
                            className="border rounded-2xl border-border bg-surface w-full pl-10 pr-3 py-2"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <Link
                        to="/ingredients/new"
                        aria-label="Add new ingredient"
                        className="shrink-0 flex items-center gap-1 py-2 px-3 border border-border rounded-2xl text-header bg-primary hover:bg-primary-dark"
                    >
                        <Plus className="h-5 w-5" />
                        <span className="hidden md:inline">Add New Ingredient</span>
                    </Link>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner className="h-12 w-12 border-4 text-primary" />
                    </div>
                ) : (
                    <div>
                        {ingredients.length === 0 ? (
                            <div
                                role="status"
                                className="mb-4 rounded-xl bg-secondary/10 px-4 py-3 text-secondary-dark"
                            >
                                Welcome, {user?.bakeryName}! Get started by adding your first
                                ingredient.
                            </div>
                        ) : shownIngredients.length === 0 ? (
                            <div role="status" className="py-12 text-center">
                                No ingredients match “{search.trim()}”.
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                                {shownIngredients.map((i) => (
                                    <Link
                                        to={`/ingredients/${i.id}`}
                                        className="block bg-surface border rounded-2xl p-4 border-border transition hover:border-primary focus-visible:outline-2 focus-visible:outline-primary"
                                        key={i.id}
                                    >
                                        <div className="flex flex-col">
                                            <div className="mb-1 text-xl font-bold text-header truncate">
                                                {i.name}
                                            </div>
                                            <div className="flex mb-3" hidden={!i.isUsedInRecipe}>
                                                <div className="flex text-xs px-2 rounded-full text-header bg-background">
                                                    <Link2 className="w-4 h-4 mr-1" /> Used in
                                                    recipe
                                                </div>
                                            </div>
                                            <div className="flex">
                                                <div className="mr-2">
                                                    <UnitBadge unit={i.ingredientUnit} />
                                                </div>
                                                {/*  */}
                                                <div className="flex flex-col">
                                                    <div className="font-bold text-2xl tracking-tight">
                                                        {formatUnitPrice(
                                                            pricePer(i, i.ingredientUnit),
                                                        )}
                                                    </div>
                                                    <div>
                                                        per{" "}
                                                        {unitLabel[i.ingredientUnit] ||
                                                            i.ingredientUnit}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default IngredientsList;
