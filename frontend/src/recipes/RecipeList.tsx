import { useState, useEffect } from "react";
import type { ExistingRecipe } from "../types/Recipe";
import PageTitle from "../components/ui/PageTitle";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { Pencil, Plus, Search, Trash } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function RecipeList() {
    const [recipes, setRecipes] = useState<ExistingRecipe[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const loadRecipes = async () => {
            setLoading(true);
            const res = await fetch(`${import.meta.env.VITE_API_URL}/recipes`);
            const data = await res.json();
            setRecipes(data);
            setLoading(false);
        };

        loadRecipes();
    }, []);

    const deleteRecipe = async (id: number) => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/recipes/${id}`, {
            method: "DELETE",
        });
        if (res.ok) {
            setRecipes((recipe) => recipe.filter((r) => r.id != id));
        } else {
            console.error("delete failed: ", res.status);
        }
    };

    const handleEdit = (id: number) => {
        navigate(`/recipes/${id}`);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="shrink-0">
                <PageTitle title="Recipes"></PageTitle>

                <div className="flex items-center gap-4 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            className="border rounded-2xl border-border bg-surface w-full pl-10 pr-3 py-2"
                            placeholder="Search..."
                            // value={}
                            // onChange={(e) =>
                            //     setIngredient((prev) => ({
                            //         ...prev,
                            //         price: e.target.value,
                            //     }))
                            //}
                        />
                    </div>

                    <Link to="/recipes/new" className="shrink-0">
                        <button
                            type="button"
                            className="flex items-center gap-1 py-2 px-3 border border-border rounded-2xl text-header bg-primary hover:bg-primary-dark"
                        >
                            <Plus className="h-5 w-5" />
                            <span className="hidden md:inline">Add New Recipe</span>
                        </button>
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
                        {recipes.map((r) => (
                            <div
                                className="w-full mb-2 bg-surface border rounded-2xl p-4 border-border"
                                key={r.id}
                            >
                                <div className="flex justify-between mb-2">
                                    <div>{r.name}</div>
                                    <div className="space-x-2">
                                        <button
                                            type="button"
                                            className="rounded-full p-2 border border-border bg-gray-50 hover:bg-secondary"
                                            onClick={() => handleEdit(r.id)}
                                        >
                                            <Pencil className="text-header"></Pencil>
                                        </button>
                                        <button
                                            type="button"
                                            className="rounded-full p-2 border border-border bg-gray-50 hover:bg-danger"
                                            onClick={() => deleteRecipe(r.id)}
                                        >
                                            <Trash className="text-header"></Trash>
                                        </button>
                                    </div>
                                </div>
                                {/* <div>
                                    £{r.price} per {r.ingredientUnit}
                                </div> */}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default RecipeList;
