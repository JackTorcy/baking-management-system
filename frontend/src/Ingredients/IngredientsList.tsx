import { useEffect, useState } from "react";
import { Pencil, Trash, Plus, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import type { ExistingIngredient } from "../types/Ingredient";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import PageTitle from "../components/ui/PageTitle";

function IngredientsList() {
    const [ingredients, setIngredients] = useState<ExistingIngredient[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadFailed, setLoadFailed] = useState(false);
    const navigate = useNavigate();

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

    const deleteIngredient = async (id: number) => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/ingredients/${id}`, {
            method: "DELETE",
        });
        if (res.ok) {
            setIngredients((ingredient) => ingredient.filter((i) => i.id != id));
        } else {
            console.error("delete failed: ", res.status);
        }
    };

    const handleEdit = (id: number) => {
        navigate(`/ingredients/${id}`);
    };

    if (loadFailed) return <div>Failed to Load</div>;

    return (
        <div className="h-full flex flex-col">
            <div className="shrink-0">
                <PageTitle title="Ingredients"></PageTitle>

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

                    <Link to="/ingredients/new" className="shrink-0">
                        <button
                            type="button"
                            className="flex items-center gap-1 py-2 px-3 border border-border rounded-2xl text-header bg-primary hover:bg-primary-dark"
                        >
                            <Plus className="h-5 w-5" />
                            <span className="hidden md:inline">Add New Ingredient</span>
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
                        {ingredients.map((i) => (
                            <div
                                className="w-full mb-2 bg-surface border rounded-2xl p-4 border-border"
                                key={i.id}
                            >
                                <div className="flex justify-between mb-2">
                                    <div>{i.name}</div>
                                    <div className="space-x-2">
                                        <button
                                            type="button"
                                            className="rounded-full p-2 border border-border bg-gray-50 hover:bg-secondary"
                                            onClick={() => handleEdit(i.id)}
                                        >
                                            <Pencil className="text-header"></Pencil>
                                        </button>
                                        <button
                                            type="button"
                                            className="rounded-full p-2 border border-border bg-gray-50 hover:bg-danger disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-50"
                                            disabled={i.isUsedInRecipe}
                                            onClick={() => deleteIngredient(i.id)}
                                        >
                                            <Trash className="text-header"></Trash>
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    £{i.price} per {i.ingredientUnit}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default IngredientsList;
