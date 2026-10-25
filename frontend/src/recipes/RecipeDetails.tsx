import { useEffect, useState } from "react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useNavigate, useParams } from "react-router-dom";
import SubTitle from "../components/ui/SubTitle";
import type { ExistingRecipe, NewRecipe } from "../types/Recipe";
import {
    baseUnit,
    pricePer,
    unitKind,
    unitLabel,
    unitsOfKind,
    type ExistingIngredient,
    type IngredientUnit,
} from "../types/Ingredient";
import { Edit, Trash, X } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import PageTitleWithBack from "../components/ui/PageTitleWithBack";

const formatGBP = (value: number) =>
    value.toLocaleString("en-GB", { style: "currency", currency: "GBP" });

const statValue = "flex h-11 items-center text-2xl font-semibold tabular-nums";

function RecipeDetails() {
    const { id } = useParams();
    const isNew = id === undefined; //New (no id) vs Existing (id)
    const buttonLabel = isNew ? "Add Recipe" : "Edit Recipe";
    const navigate = useNavigate();
    const [editMode, setEditMode] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadFailed, setLoadFailed] = useState(false);
    const [recipe, setRecipe] = useState<NewRecipe>({
        name: "",
        price: "",
        description: "",
        ingredients: [],
    });
    const [recipeSnapshot, setRecipeSnapshot] = useState<NewRecipe>(recipe);
    const [allIngredients, setAllIngredients] = useState<ExistingIngredient[]>([]);

    const ingredientCost = recipe.ingredients.reduce((total, ri) => {
        const ingredient = allIngredients.find((i) => i.id === ri.ingredientId);
        if (!ingredient) return total;
        return total + Number(ri.quantity) * pricePer(ingredient, ri.unit);
    }, 0);
    const price = Number(recipe.price);
    const margin = price - ingredientCost;

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                await loadAllIngredients();
                if (!isNew) {
                    await loadRecipe();
                } else {
                    setEditMode(true);
                }
            } catch (err) {
                console.error(err);
                setLoadFailed(true);
            } finally {
                setLoading(false);
            }
        };

        const loadRecipe = async () => {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/recipes/${id}`);
            if (!res.ok) throw new Error(`recipe load failed: ${res.status}`);

            const data: ExistingRecipe = await res.json();
            setRecipe({
                name: data.name,
                price: data.price,
                description: data.description,
                ingredients: data.ingredients.map((ri) => ({
                    ...ri,
                    quantity: String(ri.quantity),
                })),
            });
        };

        const loadAllIngredients = async () => {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/ingredients`);
            if (!res.ok) throw new Error(`ingredients load failed: ${res.status}`);
            setAllIngredients(await res.json());
        };

        loadData();
    }, [id, isNew]);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!recipe.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!recipe.price.trim()) {
            newErrors.price = "Price is required";
        } else if (isNaN(Number(recipe.price)) || recipe.price.endsWith(".")) {
            newErrors.price = "Price must be a number";
        } else if (Number(recipe.price) <= 0) {
            newErrors.price = "Price must be greater than 0";
        } else if (recipe.price && !/^\d*\.?\d{0,2}$/.test(recipe.price)) {
            newErrors.price = "Price must not have more than 2 decimal places";
        }

        if (!recipe.description.trim()) {
            newErrors.description = "Description is required";
        }

        if (recipe.ingredients.some((ri) => !(Number(ri.quantity) > 0)))
            newErrors.ingredients = "Ingredient quantities must all be greater than 0";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setSubmitting(true);
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/recipes${isNew ? "" : `/${id}`}`,
                {
                    method: isNew ? "POST" : "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...recipe,
                        ingredients: recipe.ingredients.map((ri) => ({
                            ...ri,
                            quantity: Number(ri.quantity),
                        })),
                    }),
                },
            );
            if (!res.ok) throw new Error(`${isNew ? "create" : "edit"} failed: ${res.status}`);

            const data = await res.json();
            setEditMode(false);
            navigate(`/recipes/${data.id}`);
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const deleteRecipe = async () => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/recipes/${id}`, {
            method: "DELETE",
        });
        if (res.ok) {
            navigate("/recipes");
            return;
        } else {
            console.error("delete failed: ", res.status);
        }
    };

    const addIngredientToRecipe = (id: number) => {
        const ingredient = allIngredients.find((i) => i.id === id);
        if (!ingredient || recipe.ingredients.some((ri) => ri.ingredientId === id)) return;
        setRecipe({
            ...recipe,
            ingredients: [
                ...recipe.ingredients,
                {
                    ingredientId: id,
                    quantity: "",
                    unit: baseUnit[unitKind[ingredient.ingredientUnit]],
                },
            ],
        });
    };

    const removeIngredientFromRecipe = (id: number) => {
        setRecipe((prev) => ({
            ...prev,
            ingredients: prev.ingredients.filter((ri) => ri.ingredientId !== id),
        }));
    };

    const updateIngredientQuantity = (id: number, quantity: string) => {
        setRecipe((prev) => ({
            ...prev,
            ingredients: prev.ingredients.map((ri) =>
                ri.ingredientId === id ? { ...ri, quantity } : ri,
            ),
        }));
    };

    const updateIngredientUnit = (id: number, unit: IngredientUnit) => {
        setRecipe((prev) => ({
            ...prev,
            ingredients: prev.ingredients.map((ri) =>
                ri.ingredientId === id ? { ...ri, unit } : ri,
            ),
        }));
    };

    const switchEditMode = () => {
        if (editMode) {
            setRecipe(recipeSnapshot);
            setEditMode(false);
        } else {
            setRecipeSnapshot(recipe);
            setEditMode(true);
        }
    };

    if (loadFailed) return <div>Failed to load data</div>;

    if (loading)
        return (
            <div className="flex min-h-screen justify-center items-center">
                <LoadingSpinner className="h-12 w-12 border-4 text-primary" />
            </div>
        );

    return (
        <div className="h-full flex flex-col">
            {/* Edit View vs Read View important */}

            {/* ----- Page content ------ */}
            {/* Title Part, Back arrow */}
            <div className="shrink-0 flex items-start justify-between gap-3">
                <PageTitleWithBack
                    title={editMode ? buttonLabel : recipe.name}
                    backPath="/recipes"
                />
                <div hidden={isNew} className="flex gap-3 items-center">
                    <Button
                        variant="secondary"
                        icon
                        aria-label={editMode ? "Cancel editing" : "Edit recipe"}
                        onClick={() => switchEditMode()}
                    >
                        {editMode ? <X className="w-6 h-6" /> : <Edit className="w-6 h-6" />}
                    </Button>
                    <Button variant="danger" icon aria-label="Delete recipe" onClick={deleteRecipe}>
                        <Trash className="w-6 h-6" />
                    </Button>
                </div>
            </div>

            {/* Summary (Name, Total Price, Description) */}
            <div className="flex-1 overflow-y-auto">
                {editMode ? (
                    <Card className="flex flex-col gap-4 mb-4">
                        <div>
                            <label htmlFor="name" className="block mb-2">
                                Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                className="border border-border bg-surface w-full rounded-2xl py-2 px-4"
                                value={recipe.name}
                                onChange={(e) =>
                                    setRecipe((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                            />
                            {errors.name && (
                                <span className="text-danger text-sm">{errors.name}</span>
                            )}
                        </div>
                        <div>
                            <label htmlFor="description" className="block mb-2">
                                Description
                            </label>
                            <textarea
                                id="description"
                                rows={3}
                                className="border border-border bg-surface w-full rounded-2xl py-2 px-4 resize-none"
                                value={recipe.description}
                                onChange={(e) =>
                                    setRecipe((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                            />
                            {errors.description && (
                                <span className="text-danger text-sm">{errors.description}</span>
                            )}
                        </div>
                    </Card>
                ) : (
                    <p className="mb-4 max-w-prose">{recipe.description}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <Card>
                        <label htmlFor="price" className="text-sm">
                            Price
                        </label>
                        {editMode ? (
                            <div className="relative h-11">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2">£</span>
                                <input
                                    id="price"
                                    type="text"
                                    inputMode="decimal"
                                    className="h-full w-full rounded-lg border border-border bg-background pl-7 pr-3 text-xl font-semibold tabular-nums text-header"
                                    value={recipe.price}
                                    onChange={(e) =>
                                        setRecipe((prev) => ({
                                            ...prev,
                                            price: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        ) : (
                            <div className={`${statValue} text-header`}>{formatGBP(price)}</div>
                        )}
                        {errors.price && (
                            <span className="text-danger text-sm">{errors.price}</span>
                        )}
                    </Card>
                    <Card>
                        <div className="text-sm">Ingredient cost</div>
                        <div className={`${statValue} text-header`}>
                            {formatGBP(ingredientCost)}
                        </div>
                    </Card>
                    <Card>
                        <div className="text-sm">Margin</div>
                        <div
                            className={`${statValue} ${margin < 0 ? "text-danger" : "text-header"}`}
                        >
                            {price > 0 ? (
                                <>
                                    {formatGBP(margin)}
                                    <span className="ml-2 text-base font-normal text-body">
                                        {Math.round((margin / price) * 100)}%
                                    </span>
                                </>
                            ) : (
                                "—"
                            )}
                        </div>
                    </Card>
                </div>

                {/* Overview (serves, prep, cook times) */}
                {/* <div className="bg-surface my-4">
                <div className="flex-col">
                    <div className="flex">
                        <div className="flex-1">Serves:</div>
                        <div className="flex-1">Prep Time:</div>
                    </div>
                    <div className="flex">
                        <div className="flex-1">Price:</div>
                        <div className="flex-1">Idk:</div>
                    </div>
                </div>
            </div> */}

                <Card className="flex flex-col max-h-80 mb-4">
                    <SubTitle title="Ingredients"></SubTitle>
                    {errors.ingredients && (
                        <span className="text-danger text-sm">{errors.ingredients}</span>
                    )}
                    <div className="flex-1 overflow-y-auto">
                        {recipe.ingredients.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 gap-x-4 mb-3">
                                {recipe.ingredients.map((ri) => {
                                    const ingredient = allIngredients.find(
                                        (i) => i.id === ri.ingredientId,
                                    );
                                    const unitOptions = unitsOfKind(unitKind[ri.unit]);
                                    return (
                                        <div
                                            key={ri.ingredientId}
                                            className="flex items-center gap-2"
                                        >
                                            {editMode ? (
                                                // <span>
                                                //     <input
                                                //         onChange={(e) =>
                                                //             updateIngredientQuantity(
                                                //                 Number(ri.ingredientId),
                                                //                 Number(e.target.value),
                                                //             )
                                                //         }
                                                //         className="border border-border rounded-2xl w-14 px-2"
                                                //         value={ri.quantity}
                                                //     />
                                                //     &nbsp;
                                                //     {unitLabel[ingredient?.ingredientUnit ?? ""] ??
                                                //         ingredient?.ingredientUnit}
                                                // </span>
                                                <label className="flex w-28 shrink-0 items-center rounded-lg border border-border/70 bg-background px-2 py-0.5 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                                                    <input
                                                        inputMode="decimal"
                                                        aria-label={`Quantity of ${ingredient?.name}`}
                                                        className="w-full min-w-0 bg-transparent text-right tabular-nums text-header outline-none"
                                                        value={ri.quantity}
                                                        onChange={(e) => {
                                                            if (/^\d*\.?\d*$/.test(e.target.value))
                                                                updateIngredientQuantity(
                                                                    ri.ingredientId,
                                                                    e.target.value,
                                                                );
                                                        }}
                                                    />
                                                    {unitOptions.length > 1 ? (
                                                        <select
                                                            aria-label={`Unit for ${ingredient?.name}`}
                                                            className="ml-1 bg-transparent text-sm text-body/70 outline-none"
                                                            value={ri.unit}
                                                            onChange={(e) =>
                                                                updateIngredientUnit(
                                                                    ri.ingredientId,
                                                                    e.target
                                                                        .value as IngredientUnit,
                                                                )
                                                            }
                                                        >
                                                            {unitOptions.map((unit) => (
                                                                <option key={unit} value={unit}>
                                                                    {unitLabel[unit]}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <span className="ml-1 text-sm text-body/70">
                                                            {unitLabel[ri.unit]}
                                                        </span>
                                                    )}
                                                </label>
                                            ) : (
                                                <span className="w-14 shrink-0 text-right tabular-nums font-medium text-header">
                                                    {ri.quantity}
                                                    {unitLabel[ri.unit]}
                                                </span>
                                            )}

                                            <span className="truncate flex-1 min-w-0">
                                                {ingredient?.name}
                                            </span>
                                            {editMode && (
                                                <button
                                                    type="button"
                                                    aria-label={`Remove ${ingredient?.name}`}
                                                    className="shrink-0 rounded-full p-1 text-body/60 hover:bg-danger/10 hover:text-danger"
                                                    onClick={() =>
                                                        removeIngredientFromRecipe(ri.ingredientId)
                                                    }
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="mb-3 text-center">
                                No ingredients added yet. Add ingredients to get started!
                            </div>
                        )}
                    </div>

                    {/* dropdown — fixed at the bottom of the panel, doesn't move */}
                    <div hidden={!editMode} className="shrink-0 border-t pt-3 border-border">
                        <select
                            onChange={(e) => addIngredientToRecipe(Number(e.target.value))}
                            className="w-full border border-border rounded-2xl px-3 py-2"
                        >
                            <option key="" value="">
                                Select
                            </option>
                            {allIngredients
                                .filter(
                                    (i) =>
                                        !recipe.ingredients.some((ri) => ri.ingredientId === i.id),
                                )
                                .map((i) => (
                                    <option key={i.id} value={i.id}>
                                        {i.name}
                                    </option>
                                ))}
                        </select>
                    </div>
                </Card>

                <div hidden={!editMode} className="flex justify-end">
                    <Button disabled={submitting} onClick={() => handleSubmit()}>
                        {submitting ? (
                            <LoadingSpinner className="w-4 h-4" />
                        ) : editMode ? (
                            "Save Changes"
                        ) : (
                            "Create"
                        )}
                    </Button>
                </div>
            </div>

            {/* Scaling? */}
            {/* Components */}
            {/* Ingredients list - measurements, costing (Nutrition later) */}
            {/* Method */}

            {/* Push users towards doing ingredients first. */}
            {/* Then as you add steps to method, tick which ingredients and how much are used in each step. */}
            {/* This allows you to in sessions track and tick off ingredients as the product is made */}
            {/* Should allow for really simple and clean UX */}
            {/* Will need to add a boolean flag to Recipe Ingredient and Recipe Component joins to allow use to tick them off */}
        </div>
    );
}

export default RecipeDetails;
