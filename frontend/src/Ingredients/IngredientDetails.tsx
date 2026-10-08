import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ingredientUnits,
    type ExistingIngredient,
    type IngredientUnit,
    type NewIngredient,
} from "../types/Ingredient";
import { useEffect, useState } from "react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { ArrowLeft } from "lucide-react";
import PageTitle from "../components/ui/PageTitle";

function IngredientDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = id !== undefined;
    const buttonLabel = isEditing ? "Update Ingredient" : "Add Ingredient";
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
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
        } else if (isNaN(Number(ingredient.price)) || ingredient.price.endsWith(".")) {
            newErrors.price = "Price must be a number";
        } else if (Number(ingredient.price) <= 0) {
            newErrors.price = "Price must be greater than 0";
        } else if (ingredient.price && !/^\d*\.?\d{0,8}$/.test(ingredient.price)) {
            newErrors.price = "Price must not have more than 8 decimal places";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        if (!isEditing) return;

        const loadIngredient = async () => {
            setLoading(true);

            const res = await fetch(`${import.meta.env.VITE_API_URL}/ingredients/${id}`);

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

            setLoading(false);
        };

        loadIngredient();
    }, [id, isEditing]);

    const handleSubmit = async () => {
        if (!validate()) return;

        setSubmitting(true);

        let res;

        if (isEditing) {
            res = await fetch(`${import.meta.env.VITE_API_URL}/ingredients/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(ingredient),
            });
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
            console.error(`${isEditing ? "edit" : "create"} failed: `, res.status);
        }

        setSubmitting(false);
    };

    if (isEditing && loadFailed) return <div>Failed to load data</div>;

    if (loading)
        return (
            <div className="flex min-h-screen justify-center items-center">
                <LoadingSpinner className="h-12 w-12 border-4 text-primary" />
            </div>
        );

    return (
        <>
            <div className="flex">
                <Link
                    to="/ingredients"
                    className="inline-flex items-center gap-2 w-fit p-2 mb-6 mr-3"
                >
                    <ArrowLeft />
                </Link>

                <PageTitle title={buttonLabel}></PageTitle>
            </div>

            <div className="grid grid-cols-1 mb-4">
                <div>
                    <label htmlFor="ingredientName" className="block mb-2">
                        Ingredient name
                    </label>
                    <input
                        id="ingredientName"
                        type="text"
                        className="border border-border bg-surface w-full rounded-2xl py-2 px-4"
                        value={ingredient.name}
                        onChange={(e) =>
                            setIngredient((prev) => ({
                                ...prev,
                                name: e.target.value,
                            }))
                        }
                    />
                    {errors.name && <span className="text-danger text-sm">{errors.name}</span>}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label htmlFor="ingredientPrice" className="block mb-2">
                        Ingredient Price (per unit)
                    </label>
                    <input
                        id="ingredientPrice"
                        type="text"
                        className="border border-border bg-surface w-full rounded-2xl py-2 px-4"
                        value={ingredient.price}
                        onChange={(e) =>
                            setIngredient((prev) => ({
                                ...prev,
                                price: e.target.value,
                            }))
                        }
                    />
                    {errors.price && <span className="text-danger text-sm">{errors.price}</span>}
                </div>
                <div>
                    <label className="block mb-2">Unit</label>
                    <select
                        value={ingredient.ingredientUnit}
                        className="border border-border bg-surface w-full rounded-2xl py-2 px-4"
                        onChange={(e) =>
                            setIngredient((prev) => ({
                                ...prev,
                                ingredientUnit: e.target.value as IngredientUnit,
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
                    disabled={submitting}
                    className="border flex min-w-40 min-h-8 items-center justify-center border-border text-header rounded-2xl py-1 px-3 bg-primary hover:bg-primary-dark"
                    onClick={() => handleSubmit()}
                >
                    {submitting ? <LoadingSpinner className="w-4 h-4" /> : buttonLabel}
                </button>
            </div>
        </>
    );
}

export default IngredientDetails;
