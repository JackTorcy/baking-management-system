import { useEffect, useState } from "react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useNavigate, useParams } from "react-router-dom";
import SubTitle from "../components/ui/SubTitle";
import {
    amountLeft,
    costChanges,
    describeYield,
    formatAmount,
    recipeCost,
    recipesUsingComponent,
    scaleFactor,
    toFormRecipe,
    toSaveRecipe,
    withParentRecipes,
    type CostChange,
    type ExistingRecipe,
    type NewRecipe,
    type RecipeIngredient,
    type RecipeResponse,
    type RecipeYield,
} from "../types/Recipe";
import { baseUnit, unitKind, type ExistingIngredient, type UnitKind } from "../types/Ingredient";
import { Edit, Trash, X } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import PageTitleWithBack from "../components/ui/PageTitleWithBack";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import RecipeComponentsCard from "./RecipeComponentsCard";
import RecipeMethodCard from "./RecipeMethodCard";
import RecipeYieldFields from "./RecipeYieldFields";
import RecipeScaleControl from "./RecipeScaleControl";
import RecipeStats from "./RecipeStats";
import AmountInput from "./AmountInput";
import UsedInRecipes from "./UsedInRecipes";
import CostChangeList from "./CostChangeList";

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
        yieldQuantity: "1",
        yieldUnit: "item",
        yieldLabel: "",
        tinShape: null,
        tinSize: "",
        tinWidth: "",
        tinUnit: "inch",
        ingredients: [],
        components: [],
        steps: [],
    });
    const [recipeSnapshot, setRecipeSnapshot] = useState<NewRecipe>(recipe);
    const [allIngredients, setAllIngredients] = useState<ExistingIngredient[]>([]);
    const [allRecipes, setAllRecipes] = useState<ExistingRecipe[]>([]);
    const [lockedYieldKind, setLockedYieldKind] = useState<UnitKind | null>(null);
    const [scaleTo, setScaleTo] = useState<RecipeYield | null>(null);
    const [dialog, setDialog] = useState<"delete" | "discard" | null>(null);
    const [costImpact, setCostImpact] = useState<CostChange[] | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const recipeId = isNew ? undefined : Number(id);
    const scale = !editMode && scaleTo ? scaleFactor(recipe, scaleTo) : 1;
    const cost = recipeCost(recipe, allRecipes, allIngredients, new Set(isNew ? [] : [recipeId!]));
    const isUsedAsComponent = lockedYieldKind !== null;
    const parentRecipes = isNew ? [] : recipesUsingComponent(recipeId!, allRecipes);
    const hasUnsavedChanges = JSON.stringify(recipe) !== JSON.stringify(recipeSnapshot);

    const updateRecipe = (change: Partial<NewRecipe>) =>
        setRecipe((prev) => ({ ...prev, ...change }));

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                await loadAllIngredients();
                await loadAllRecipes();
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

            const data: RecipeResponse = await res.json();
            setRecipe(toFormRecipe(data));
            setLockedYieldKind(data.isUsedAsComponent ? unitKind[data.yieldUnit] : null);
            setScaleTo(null);
        };

        const loadAllRecipes = async () => {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/recipes`);
            if (!res.ok) throw new Error(`recipes load failed: ${res.status}`);
            const data: RecipeResponse[] = await res.json();
            setAllRecipes(data.map(toFormRecipe));
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

        if (!(Number(recipe.yieldQuantity) > 0)) {
            newErrors.yield = "How much the recipe makes must be greater than 0";
        } else if (
            recipe.tinShape &&
            (!(Number(recipe.tinSize) > 0) ||
                (recipe.tinShape === "rectangle" && !(Number(recipe.tinWidth) > 0)))
        ) {
            newErrors.yield = "Tin size must be greater than 0";
        }

        if (recipe.ingredients.some((ri) => !(Number(ri.quantity) > 0)))
            newErrors.ingredients = "Ingredient quantities must all be greater than 0";

        if (recipe.components.some((rc) => !(Number(rc.quantity) > 0)))
            newErrors.components = "Component quantities must all be greater than 0";

        const overUsed = [
            ...recipe.ingredients.map((ri) => ({
                name: allIngredients.find((i) => i.id === ri.ingredientId)?.name,
                left: amountLeft(
                    ri,
                    recipe.steps.flatMap((s) =>
                        s.ingredients.filter((si) => si.ingredientId === ri.ingredientId),
                    ),
                ),
            })),
            ...recipe.components.map((rc) => ({
                name: allRecipes.find((r) => r.id === rc.componentId)?.name,
                left: amountLeft(
                    rc,
                    recipe.steps.flatMap((s) =>
                        s.components.filter((sc) => sc.componentId === rc.componentId),
                    ),
                ),
            })),
        ].find((line) => line.left < -0.001);

        if (recipe.steps.some((s) => !s.instruction.trim())) {
            newErrors.steps = "Every step needs an instruction";
        } else if (
            recipe.steps.some(
                (s) =>
                    s.ingredients.some((si) => !(Number(si.quantity) > 0)) ||
                    s.components.some((sc) => !(Number(sc.quantity) > 0)),
            )
        ) {
            newErrors.steps = "Step amounts must all be greater than 0";
        } else if (overUsed) {
            newErrors.steps = `Steps use more ${overUsed.name} than the recipe has`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        const changes = isNew
            ? []
            : costChanges(
                  withParentRecipes(parentRecipes, allRecipes),
                  { recipes: allRecipes, ingredients: allIngredients },
                  {
                      recipes: allRecipes.map((r) => (r.id === recipeId ? { ...r, ...recipe } : r)),
                      ingredients: allIngredients,
                  },
              );
        if (changes.length > 0) {
            setCostImpact(changes);
            return;
        }
        saveRecipe();
    };

    const saveRecipe = async () => {
        setSubmitting(true);
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/recipes${isNew ? "" : `/${id}`}`,
                {
                    method: isNew ? "POST" : "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(toSaveRecipe(recipe)),
                },
            );
            if (!res.ok) throw new Error(`${isNew ? "create" : "edit"} failed: ${res.status}`);

            const saved = toFormRecipe(await res.json());
            // Keep step Ids and other recipes' cost checks in line with what the server stored
            setAllRecipes((prev) =>
                prev.some((r) => r.id === saved.id)
                    ? prev.map((r) => (r.id === saved.id ? saved : r))
                    : [...prev, saved],
            );
            if (!isNew) setRecipe(saved);
            setEditMode(false);
            navigate(`/recipes/${saved.id}`);
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const deleteRecipe = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/recipes/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                navigate("/recipes");
                return;
            }
            setDeleteError(
                res.status === 409
                    ? "This recipe is used in other recipes. Remove it from them first."
                    : "Couldn't delete this recipe. Try again.",
            );
        } catch (err) {
            console.error(err);
            setDeleteError("Couldn't delete this recipe. Try again.");
        } finally {
            setDeleting(false);
        }
    };

    const openDeleteDialog = () => {
        setDeleteError("");
        setDialog("delete");
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
            steps: prev.steps.map((s) => ({
                ...s,
                ingredients: s.ingredients.filter((si) => si.ingredientId !== id),
            })),
        }));
    };

    const updateIngredient = (id: number, change: Partial<RecipeIngredient>) => {
        setRecipe((prev) => ({
            ...prev,
            ingredients: prev.ingredients.map((ri) =>
                ri.ingredientId === id ? { ...ri, ...change } : ri,
            ),
        }));
    };

    const startEditing = () => {
        setScaleTo(null);
        setRecipeSnapshot(recipe);
        setEditMode(true);
    };

    const discardChanges = () => {
        setDialog(null);
        if (isNew) {
            navigate("/recipes");
            return;
        }
        setRecipe(recipeSnapshot);
        setErrors({});
        setEditMode(false);
    };

    const cancelEditing = () => {
        if (hasUnsavedChanges) setDialog("discard");
        else discardChanges();
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
                {!editMode && (
                    <Button variant="secondary" className="shrink-0 gap-2" onClick={startEditing}>
                        <Edit className="h-5 w-5" />
                        Edit
                    </Button>
                )}
            </div>

            {/* Summary (Name, Total Price, Description) */}
            <div className="flex-1 overflow-y-auto">
                <UsedInRecipes recipes={parentRecipes} />
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
                                onChange={(e) => updateRecipe({ name: e.target.value })}
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
                                onChange={(e) => updateRecipe({ description: e.target.value })}
                            />
                            {errors.description && (
                                <span className="text-danger text-sm">{errors.description}</span>
                            )}
                        </div>
                        <RecipeYieldFields
                            recipe={recipe}
                            lockedKind={lockedYieldKind}
                            error={errors.yield}
                            onChange={updateRecipe}
                        />
                    </Card>
                ) : (
                    <div className="mb-4 max-w-prose">
                        <p>{recipe.description}</p>
                        <p className="mt-1 text-sm font-semibold">{describeYield(recipe)}</p>
                    </div>
                )}

                {!editMode && (
                    <RecipeScaleControl
                        recipe={recipe}
                        scaleTo={scaleTo}
                        scale={scale}
                        onChange={setScaleTo}
                    />
                )}

                <RecipeStats
                    price={recipe.price}
                    cost={cost}
                    scale={scale}
                    editMode={editMode}
                    error={errors.price}
                    onPriceChange={(price) => updateRecipe({ price })}
                />

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
                                                <AmountInput
                                                    name={ingredient?.name ?? ""}
                                                    quantity={ri.quantity}
                                                    unit={ri.unit}
                                                    onQuantityChange={(quantity) =>
                                                        updateIngredient(ri.ingredientId, {
                                                            quantity,
                                                        })
                                                    }
                                                    onUnitChange={(unit) =>
                                                        updateIngredient(ri.ingredientId, { unit })
                                                    }
                                                />
                                            ) : (
                                                <span className="min-w-16 shrink-0 whitespace-nowrap text-right tabular-nums font-medium text-header">
                                                    {formatAmount(
                                                        Number(ri.quantity) * scale,
                                                        ri.unit,
                                                    )}
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

                <RecipeComponentsCard
                    components={recipe.components}
                    recipes={allRecipes}
                    ingredients={allIngredients}
                    recipeId={recipeId}
                    editMode={editMode}
                    scale={scale}
                    error={errors.components}
                    onChange={(components) =>
                        setRecipe((prev) => ({
                            ...prev,
                            components,
                            steps: prev.steps.map((s) => ({
                                ...s,
                                components: s.components.filter((sc) =>
                                    components.some((c) => c.componentId === sc.componentId),
                                ),
                            })),
                        }))
                    }
                />

                <RecipeMethodCard
                    recipe={recipe}
                    recipes={allRecipes}
                    ingredients={allIngredients}
                    editMode={editMode}
                    scale={scale}
                    error={errors.steps}
                    onChange={(steps) => updateRecipe({ steps })}
                />

                {editMode && !isNew && (
                    <div className="mt-2 mb-4 border-t border-border/40 pt-4">
                        <button
                            type="button"
                            className="flex items-center gap-1.5 font-semibold text-danger hover:underline"
                            onClick={openDeleteDialog}
                        >
                            <Trash className="h-4 w-4" />
                            Delete recipe
                        </button>
                    </div>
                )}
            </div>

            {editMode && (
                <div className="shrink-0 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-3">
                    {Object.keys(errors).length > 0 && (
                        <span role="alert" className="mr-auto text-sm text-danger">
                            Fix the errors above before saving
                        </span>
                    )}
                    <Button variant="outline" onClick={cancelEditing}>
                        Cancel
                    </Button>
                    <Button disabled={submitting} onClick={() => handleSubmit()}>
                        {submitting ? (
                            <LoadingSpinner className="w-4 h-4" />
                        ) : isNew ? (
                            "Create recipe"
                        ) : (
                            "Save changes"
                        )}
                    </Button>
                </div>
            )}

            <ConfirmDialog
                open={costImpact !== null}
                title="This affects other recipes"
                confirmLabel="Save changes"
                confirmVariant="primary"
                busy={submitting}
                onConfirm={() => {
                    setCostImpact(null);
                    saveRecipe();
                }}
                onCancel={() => setCostImpact(null)}
            >
                {costImpact && <CostChangeList changes={costImpact} />}
            </ConfirmDialog>

            <ConfirmDialog
                open={dialog === "discard"}
                title="Discard changes?"
                cancelLabel="Keep editing"
                confirmLabel="Discard"
                onConfirm={discardChanges}
                onCancel={() => setDialog(null)}
            >
                Your unsaved changes to this recipe will be lost.
            </ConfirmDialog>

            <ConfirmDialog
                open={dialog === "delete"}
                title={isUsedAsComponent ? "Can't delete this recipe" : `Delete ${recipe.name}?`}
                cancelLabel={isUsedAsComponent ? "Close" : "Cancel"}
                confirmLabel={isUsedAsComponent ? undefined : "Delete recipe"}
                busy={deleting}
                onConfirm={deleteRecipe}
                onCancel={() => setDialog(null)}
            >
                {isUsedAsComponent
                    ? "It's used in other recipes. Remove it from them first."
                    : "This can't be undone."}
                {deleteError && <p className="mt-2 text-sm text-danger">{deleteError}</p>}
            </ConfirmDialog>

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
