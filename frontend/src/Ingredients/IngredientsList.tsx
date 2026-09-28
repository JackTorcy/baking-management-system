import { useEffect, useState } from "react";
import { Pencil, Trash, Plus, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import type { ExistingIngredient } from "../types/Ingredient";
import LoadingSpinner from "../components/ui/LoadingSpinner";

function IngredientsList() {
    const [ingredients, setIngredients] = useState<ExistingIngredient[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const loadIngredients = async () => {
            setLoading(true);
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/ingredients`,
            );
            const data = await res.json();
            setIngredients(data);
            setLoading(false);
        };

        loadIngredients();
    }, []);

    const deleteIngredient = async (id: number) => {
        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/ingredients/${id}`,
            {
                method: "DELETE",
            },
        );
        if (res.ok) {
            setIngredients((ingredient) =>
                ingredient.filter((i) => i.id != id),
            );
        } else {
            console.error("delete failed: ", res.status);
        }
    };

    const handleEdit = (id: number) => {
        navigate(`/ingredients/${id}`);
    };

    return (
        <div>
            <div className="text-4xl mb-4 font-semibold">Ingredients</div>

            <div className="flex justify-between items-center mb-4">
                <div className="relative w-full max-w-100 mr-10">
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

                <Link to="/ingredients/new">
                    <button
                        type="button"
                        className="border flex min-w-50 w-1/3 py-2 min-h-8 items-center justify-center border-border text-header rounded-2xl px-3 bg-primary hover:bg-primary-dark"
                    >
                        <Plus />
                        Add New Ingredient
                    </button>
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner className="h-12 w-12 border-4 text-primary" />
                </div>
            ) : (
                <div>
                    {ingredients.map((i) => (
                        <div
                            className="w-full mb-4 bg-surface border rounded-2xl p-4 border-border"
                            key={i.id}
                        >
                            <div className="flex justify-between mb-2">
                                <div>{i.name}</div>
                                <div className="space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => handleEdit(i.id)}
                                    >
                                        <Pencil></Pencil>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => deleteIngredient(i.id)}
                                    >
                                        <Trash></Trash>
                                    </button>
                                </div>
                            </div>
                            <div>
                                {i.price} per {i.ingredientUnit}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* <table className="w-full table-auto">
                <thead>
                    <tr>
                        <th className="w-2/5">Name</th>
                        <th className="w-1/5">Price</th>
                        <th className="w-1/5">Unit</th>
                        <th className="w-1/5"></th>
                    </tr>
                </thead>
                <tbody>
                    {ingredients.map((i) => (
                        <tr key={i.id}>
                            <td>{i.name}</td>
                            <td>{i.price}</td>
                            <td>{i.ingredientUnit}</td>
                            <td className="flex justify-center space-x-5">
                                <button
                                    type="button"
                                    onClick={() => handleEdit(i.id)}
                                >
                                    <Pencil></Pencil>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => deleteIngredient(i.id)}
                                >
                                    <Trash></Trash>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table> */}
        </div>
    );
}

export default IngredientsList;
