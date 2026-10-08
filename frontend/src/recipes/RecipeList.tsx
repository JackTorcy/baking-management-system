import { useState, useEffect } from "react";
import type { ExistingRecipe } from "../types/Recipe";
import PageTitle from "../components/ui/PageTitle";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { Pencil, Trash } from "lucide-react";

function RecipeList() {
    const [recipes, setRecipes] = useState<ExistingRecipe[]>([]);
    const [loading, setLoading] = useState(false);

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

    // const handleCreate = async () => {
    //     try {
    //         const res = await fetch(`${import.meta.env.VITE_API_URL}/recipes`, {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify(newRecipe),
    //         });

    //         console.log("status:", res.status); // did it reach the server?
    //         if (!res.ok) {
    //             const text = await res.text();
    //             console.error("failed:", res.status, text); // what did the server say?
    //             return;
    //         } else {
    //             await loadRecipes();
    //         }

    //         const created = await res.json();
    //         console.log("created:", created);
    //     } catch (err) {
    //         console.error("fetch threw:", err); // network/CORS-level failure
    //     }
    // };

    // const deleteRecipe = async (id: number) => {
    //     const res = await fetch(`${import.meta.env.VITE_API_URL}/recipes/${id}`, {
    //         method: "DELETE",
    //     });
    //     if (res.ok) {
    //         setRecipes((recipes) => recipes.filter((r) => r.id !== id));
    //     } else {
    //         console.error("delete failed:", res.status);
    //     }
    // };

    // const handleEdit = async (recipe: ExistingRecipe) => {
    //     const editedRecipe = await updateRecipe(recipe);

    //     try {
    //         const res = await fetch(`${import.meta.env.VITE_API_URL}/recipes/${recipe.id}`, {
    //             method: "PUT",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify(editedRecipe),
    //         });

    //         console.log("status:", res.status); // did it reach the server?
    //         if (!res.ok) {
    //             const text = await res.text();
    //             console.error("failed:", res.status, text); // what did the server say?
    //             return;
    //         } else {
    //             await loadRecipes();
    //         }

    //         const edited = await res.json();
    //         console.log("created:", edited);
    //     } catch (err) {
    //         console.error("edit threw:", err);
    //     }
    // };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="h-full flex flex-col">
            <div className="shrink-0">
                <PageTitle title="Recipes"></PageTitle>
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
                                            // onClick={() => handleEdit(r.id)}
                                        >
                                            <Pencil className="text-header"></Pencil>
                                        </button>
                                        <button
                                            type="button"
                                            className="rounded-full p-2 border border-border bg-gray-50 hover:bg-danger"
                                            // onClick={() => deleteIngredient(r.id)}
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
                {/* <ul>
                    {recipes.map((r) => (
                        <li key={r.id}>
                            {r.name}: {r.price}
                            <button type="button">
                                {" "}
                                onClick={() => handleEdit(r)}
                                Edit
                            </button>
                            <button type="button" onClick={() => deleteRecipe(r.id)}>
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
                <button type="button">
                    {" "}
                    onClick={() => handleCreate()}
                    Add Recipe
                </button> */}
            </div>
        </div>
    );
}

export default RecipeList;
