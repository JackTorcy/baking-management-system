import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ingredientUnits,
    type ExistingIngredient,
    type IngredientUnit,
    type NewIngredient,
} from "../Types/Ingredient";
import { useEffect, useState } from "react";

function IngredientDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = id !== undefined;
    const [loadFailed, setLoadFailed] = useState(false);
    const [ingredient, setIngredient] = useState<NewIngredient>({
        name: "",
        price: "",
        ingredientUnit: "gram",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!ingredient.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!ingredient.price.trim()) {
            newErrors.price = "Price is required";
        } else if (
            isNaN(Number(ingredient.price)) ||
            Number(ingredient.price) <= 0
        ) {
            newErrors.price = "Price must be a number greater than 0";
        }

        if (ingredient.price && !/^\d*\.?\d{0,8}$/.test(ingredient.price)) {
            newErrors.price = "Price must not have more than 8 decimal places";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        if (!isEditing) return;

        const loadIngredient = async () => {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/ingredients/${id}`,
            );

            if (res.ok) {
                const data: ExistingIngredient = await res.json();
                setIngredient({
                    name: data.name,
                    price: data.price,
                    ingredientUnit: data.ingredientUnit,
                });
            } else {
                setLoadFailed(true);
                console.error("load failed: ", res.status);
            }
        };

        loadIngredient();
    }, [id, isEditing]);

    const handleSubmit = async () => {
        if (!validate()) return;

        let res;

        if (isEditing) {
            res = await fetch(
                `${import.meta.env.VITE_API_URL}/ingredients/${id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(ingredient),
                },
            );
        } else {
            res = await fetch(`${import.meta.env.VITE_API_URL}/ingredients`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(ingredient),
            });
        }

        if (res.ok) {
            const data = await res.json();
            navigate(`/ingredients/${data.id}`);
        } else {
            console.error(
                `${isEditing ? "edit" : "create"} failed: `,
                res.status,
            );
        }
    };

    if (isEditing && loadFailed) return <div>Failed to load data</div>;

    return (
        <div className="max-w-2xl mx-auto p-6 bg-surface">
            <Link to="/ingredients">Back to Ingredients</Link>

            {/* <button type="button" onClick={() => createIngredient}>
                Create
            </button> */}
            <div className="grid grid-cols-1 mb-4">
                <div>
                    <label htmlFor="ingredientName" className="block">
                        Ingredient name
                    </label>
                    <input
                        id="ingredientName"
                        type="text"
                        className="border w-full"
                        value={ingredient.name}
                        onChange={(e) =>
                            setIngredient((prev) => ({
                                ...prev,
                                name: e.target.value,
                            }))
                        }
                    />
                    {errors.name && (
                        <span className="text-danger text-sm">
                            {errors.name}
                        </span>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label htmlFor="ingredientPrice" className="block">
                        Ingredient Price (per unit)
                    </label>
                    <input
                        id="ingredientPrice"
                        type="text"
                        className="border w-full"
                        value={ingredient.price}
                        onChange={(e) =>
                            setIngredient((prev) => ({
                                ...prev,
                                price: e.target.value,
                            }))
                        }
                    />
                    {errors.price && (
                        <span className="text-danger text-sm">
                            {errors.price}
                        </span>
                    )}
                </div>
                <div>
                    <label className="block">Unit</label>
                    <select
                        value={ingredient.ingredientUnit}
                        className="border w-full"
                        onChange={(e) =>
                            setIngredient((prev) => ({
                                ...prev,
                                ingredientUnit: e.target
                                    .value as IngredientUnit,
                            }))
                        }
                    >
                        {ingredientUnits.map((unit) => (
                            <option key={unit} value={unit}>
                                {unit}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="flex justify-end">
                <button
                    type="button"
                    className="border rounded-2xl px-2 bg-primary hover:bg-primary-dark"
                    onClick={() => handleSubmit()}
                >
                    {isEditing ? "Update Ingredient" : "Create Ingredient"}
                </button>
            </div>
        </div>
    );
}

export default IngredientDetails;
