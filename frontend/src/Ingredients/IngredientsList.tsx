import { useEffect, useState } from "react";
import { Pencil, Trash } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import type { ExistingIngredient } from "../types/Ingredient";

function IngredientsList() {
    const [ingredients, setIngredients] = useState<ExistingIngredient[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const loadIngredients = async () => {
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

    if (loading) return <p>Loading...</p>;

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="text-4xl mb-6 underline font-semibold">
                Ingredients page
            </div>
            <Link to="/ingredients/new">Create Ingredient</Link>
            <table className="w-full table-auto">
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
            </table>
        </div>
    );
}

export default IngredientsList;
