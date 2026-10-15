import { useEffect, useState } from "react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { Link, useNavigate, useParams } from "react-router-dom";
import SubTitle from "../components/ui/SubTitle";
import type { ExistingRecipe, NewRecipe } from "../types/Recipe";
import { unitLabel, type ExistingIngredient } from "../types/Ingredient";
import { ArrowLeft, Edit, Trash, X } from "lucide-react";

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

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);

            await loadAllIngredients();
            if (!isNew) {
                await loadRecipe();
            } else {
                setEditMode(true);
            }

            setLoading(false);
        };

        const loadRecipe = async () => {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/recipes/${id}`);

            if (res.ok) {
                const data: ExistingRecipe = await res.json();
                setRecipe({
                    name: data.name,
                    price: data.price,
                    description: data.description,
                    ingredients: data.ingredients,
                });
            } else {
                setLoadFailed(true);
                console.error("load failed: ", res.status);
            }
        };

        const loadAllIngredients = async () => {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/ingredients`);
            const data = await res.json();
            setAllIngredients(data);
        };

        loadData();
    }, [id, isNew]);

    const handleSubmit = async () => {
        //if (!validate()) return;

        setSubmitting(true);

        let res;

        if (isNew) {
            res = await fetch(`${import.meta.env.VITE_API_URL}/recipes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(recipe),
            });
        } else {
            res = await fetch(`${import.meta.env.VITE_API_URL}/recipes/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(recipe),
            });
        }

        if (res.ok) {
            const data = await res.json();
            setEditMode(false);
            navigate(`/recipes/${data.id}`);
        } else {
            console.error(`${isNew ? "create" : "edit"} failed: `, res.status);
        }

        setSubmitting(false);
    };

    const addIngredientToRecipe = (id: number) => {
        if (recipe.ingredients.some((ri) => ri.ingredientId === id)) return;
        setRecipe({
            ...recipe,
            ingredients: [...recipe.ingredients, { ingredientId: id, quantity: 0 }],
        });
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

    if (!isNew && loadFailed) return <div>Failed to load data</div>;

    if (loading)
        return (
            <div className="flex min-h-screen justify-center items-center">
                <LoadingSpinner className="h-12 w-12 border-4 text-primary" />
            </div>
        );

    return (
        <>
            {/* Edit View vs Read View important */}

            {/* ----- Page content ------ */}
            {/* Title Part, Back arrow */}
            <div className="flex mb-4 items-center justify-between">
                <div className="flex gap-3 items-center">
                    <Link to="/recipes">
                        <ArrowLeft className="h-8 w-8" />
                    </Link>

                    <div className="text-4xl font-semibold">{buttonLabel}</div>
                </div>
                <div hidden={isNew} className="flex gap-3 items-center">
                    <button
                        type="button"
                        className="text-header rounded-4xl p-2 bg-secondary hover:bg-secondary-dark"
                        onClick={() => switchEditMode()}
                    >
                        {editMode ? <X className="w-6 h-6"></X> : <Edit className="w-6 h-6"></Edit>}
                    </button>
                    <button
                        type="button"
                        className="text-header rounded-4xl p-2 bg-primary hover:bg-primary-dark"
                    >
                        <Trash className="w-6 h-6"></Trash>
                    </button>
                </div>
            </div>

            {/* Summary (Name, Total Price, Description) */}
            <div className="border rounded-2xl flex flex-col max-h-80 p-2 my-4 bg-surface">
                <SubTitle title="Summary"></SubTitle>
                <div className="flex mb-3 gap-3 items-center">
                    <label htmlFor="name">Name:</label>
                    {editMode ? (
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
                    ) : (
                        <div>{recipe.name}</div>
                    )}
                </div>

                <div className="flex mb-3 gap-3 items-center">
                    <label htmlFor="price">Price:</label>
                    {editMode ? (
                        <input
                            id="price"
                            type="text"
                            className="border border-border bg-surface w-full rounded-2xl py-2 px-4"
                            value={recipe.price}
                            onChange={(e) =>
                                setRecipe((prev) => ({
                                    ...prev,
                                    price: e.target.value,
                                }))
                            }
                        />
                    ) : (
                        <div>£{recipe.price}</div>
                    )}
                </div>

                <div className="flex mb-3 gap-3 items-center">
                    <label htmlFor="description">Description:</label>
                    {editMode ? (
                        <input
                            id="description"
                            type="text"
                            className="border border-border bg-surface w-full rounded-2xl py-2 px-4"
                            value={recipe.description}
                            onChange={(e) =>
                                setRecipe((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                }))
                            }
                        />
                    ) : (
                        <div>{recipe.description}</div>
                    )}
                </div>
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

            <div className="border rounded-2xl flex flex-col max-h-80 p-2 my-4 bg-surface">
                <SubTitle title="Ingredients"></SubTitle>
                <div className="flex-1 overflow-y-auto">
                    {recipe.ingredients.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                            {recipe.ingredients.map((ri) => {
                                const ingredient = allIngredients.find(
                                    (i) => i.id === ri.ingredientId,
                                );
                                return (
                                    <div key={ri.ingredientId}>
                                        {ingredient?.name}: {ri.quantity}
                                        {unitLabel[ingredient?.ingredientUnit ?? ""] ??
                                            ingredient?.ingredientUnit}
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
                                (i) => !recipe.ingredients.some((ri) => ri.ingredientId === i.id),
                            )
                            .map((i) => (
                                <option key={i.id} value={i.id}>
                                    {i.name}
                                </option>
                            ))}
                    </select>
                </div>
            </div>

            <div hidden={!editMode} className="flex justify-end">
                <button
                    type="button"
                    disabled={submitting}
                    className="border flex min-w-40 min-h-8 items-center justify-center border-border text-header rounded-2xl py-1 px-3 bg-primary hover:bg-primary-dark"
                    onClick={() => handleSubmit()}
                >
                    {submitting ? (
                        <LoadingSpinner className="w-4 h-4" />
                    ) : editMode ? (
                        "Save Changes"
                    ) : (
                        "Create"
                    )}
                </button>
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
        </>
    );
}

export default RecipeDetails;
