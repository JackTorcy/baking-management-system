import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { ExistingRecipe } from "../types/Recipe";

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

    const deleteRecipe = async (id: number) => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/recipes/${id}`, {
            method: "DELETE",
        });
        if (res.ok) {
            setRecipes((recipes) => recipes.filter((r) => r.id !== id));
        } else {
            console.error("delete failed:", res.status);
        }
    };

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
                <h1>Recipes stuff</h1>
            </div>

            <div className="flex-1 overflow-y-auto">
                <ul>
                    {recipes.map((r) => (
                        <li key={r.id}>
                            {r.name}: {r.price}
                            <button type="button">
                                {" "}
                                {/*onClick={() => handleEdit(r)}*/}
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
                    {/* onClick={() => handleCreate()} */}
                    Add Recipe
                </button>
                <Link to="/test">Go to Test</Link>
            </div>
        </div>
    );
}

export default RecipeList;
