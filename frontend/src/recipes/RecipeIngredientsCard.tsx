import { X } from "lucide-react";
import Card from "../components/ui/Card";
import SubTitle from "../components/ui/SubTitle";
import { baseUnit, unitKind, type ExistingIngredient } from "../types/Ingredient";
import type { RecipeIngredient } from "../types/Recipe";
import AmountInput from "./AmountInput";
import { formatAmount } from "./lib/format";

interface RecipeIngredientsCardProps {
    ingredients: RecipeIngredient[];
    allIngredients: ExistingIngredient[];
    editMode: boolean;
    scale: number;
    error?: string;
    onChange: (ingredients: RecipeIngredient[]) => void;
}

function RecipeIngredientsCard({
    ingredients,
    allIngredients,
    editMode,
    scale,
    error,
    onChange,
}: RecipeIngredientsCardProps) {
    const addIngredient = (id: number) => {
        const ingredient = allIngredients.find((i) => i.id === id);
        if (!ingredient || ingredients.some((ri) => ri.ingredientId === id)) return;
        onChange([
            ...ingredients,
            { ingredientId: id, quantity: "", unit: baseUnit[unitKind[ingredient.ingredientUnit]] },
        ]);
    };

    const removeIngredient = (id: number) =>
        onChange(ingredients.filter((ri) => ri.ingredientId !== id));

    const updateIngredient = (id: number, change: Partial<RecipeIngredient>) =>
        onChange(ingredients.map((ri) => (ri.ingredientId === id ? { ...ri, ...change } : ri)));

    return (
        <Card className="flex flex-col max-h-80 mb-4">
            <SubTitle title="Ingredients"></SubTitle>
            {error && <span className="text-danger text-sm">{error}</span>}
            <div className="flex-1 overflow-y-auto">
                {ingredients.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 gap-x-4 mb-3">
                        {ingredients.map((ri) => {
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
                                                removeIngredient(ri.ingredientId)
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
                    onChange={(e) => addIngredient(Number(e.target.value))}
                    className="w-full border border-border rounded-2xl px-3 py-2"
                >
                    <option key="" value="">
                        Select
                    </option>
                    {allIngredients
                        .filter(
                            (i) =>
                                !ingredients.some((ri) => ri.ingredientId === i.id),
                        )
                        .map((i) => (
                            <option key={i.id} value={i.id}>
                                {i.name}
                            </option>
                        ))}
                </select>
            </div>
        </Card>
    );
}

export default RecipeIngredientsCard;
