import { ChevronDown, ChevronUp, Plus, Trash, X } from "lucide-react";
import { unitLabel, type ExistingIngredient, type IngredientUnit } from "../types/Ingredient";
import {
    amountLabel,
    yieldUnitLabel,
    type ExistingRecipe,
    type NewRecipe,
    type RecipeStep,
} from "../types/Recipe";
import AmountInput from "./AmountInput";

interface StepAmountProps {
    name: string;
    quantity: string;
    unit: IngredientUnit;
    component?: ExistingRecipe;
    editMode: boolean;
    scale: number;
    onChange: (change: { quantity?: string; unit?: IngredientUnit }) => void;
    onRemove: () => void;
}

function StepAmount({
    name,
    quantity,
    unit,
    component,
    editMode,
    scale,
    onChange,
    onRemove,
}: StepAmountProps) {
    if (!editMode)
        return (
            <div className="text-sm">
                <span className="font-medium tabular-nums text-header">
                    {amountLabel(Number(quantity) * scale, unit, component)}
                </span>{" "}
                {name}
            </div>
        );

    return (
        <div className="flex items-center gap-2">
            <AmountInput
                name={name}
                quantity={quantity}
                unit={unit}
                unitName={(u) =>
                    u === "item" && component ? yieldUnitLabel(component) : unitLabel[u]
                }
                onQuantityChange={(quantity) => onChange({ quantity })}
                onUnitChange={(unit) => onChange({ unit })}
            />
            <span className="min-w-0 flex-1 truncate">{name}</span>
            <button
                type="button"
                aria-label={`Remove ${name}`}
                className="shrink-0 rounded-full p-1 text-body/60 hover:bg-danger/10 hover:text-danger"
                onClick={onRemove}
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

interface RecipeStepRowProps {
    step: RecipeStep;
    stepNumber: number;
    isFirst: boolean;
    isLast: boolean;
    recipe: NewRecipe;
    recipes: ExistingRecipe[];
    ingredients: ExistingIngredient[];
    editMode: boolean;
    scale: number;
    ingredientLeft: (ingredientId: number) => number;
    componentLeft: (componentId: number) => number;
    onChange: (change: Partial<RecipeStep>) => void;
    onMove: (offset: -1 | 1) => void;
    onInsertAfter: () => void;
    onDelete: () => void;
}

const iconButton =
    "rounded-full p-1 text-body/60 hover:bg-background hover:text-header disabled:opacity-30 disabled:hover:bg-transparent";

// Defaults a newly added amount to whatever the other steps haven't used yet
const leftoverQuantity = (left: number) => (left > 0 ? String(Number(left.toFixed(4))) : "");

function RecipeStepRow({
    step,
    stepNumber,
    isFirst,
    isLast,
    recipe,
    recipes,
    ingredients,
    editMode,
    scale,
    ingredientLeft,
    componentLeft,
    onChange,
    onMove,
    onInsertAfter,
    onDelete,
}: RecipeStepRowProps) {
    const ingredientName = (ingredientId: number) =>
        ingredients.find((i) => i.id === ingredientId)?.name ?? "";
    const componentRecipe = (componentId: number) => recipes.find((r) => r.id === componentId);

    const hasAmounts = step.ingredients.length > 0 || step.components.length > 0;
    const addableIngredients = recipe.ingredients.filter(
        (ri) => !step.ingredients.some((si) => si.ingredientId === ri.ingredientId),
    );
    const addableComponents = recipe.components.filter(
        (rc) => !step.components.some((sc) => sc.componentId === rc.componentId),
    );

    const addToStep = (value: string) => {
        const id = Number(value.slice(1));
        if (value.startsWith("i")) {
            const line = recipe.ingredients.find((ri) => ri.ingredientId === id);
            if (!line) return;
            onChange({
                ingredients: [
                    ...step.ingredients,
                    {
                        ingredientId: id,
                        quantity: leftoverQuantity(ingredientLeft(id)),
                        unit: line.unit,
                    },
                ],
            });
        } else {
            const line = recipe.components.find((rc) => rc.componentId === id);
            if (!line) return;
            onChange({
                components: [
                    ...step.components,
                    {
                        componentId: id,
                        quantity: leftoverQuantity(componentLeft(id)),
                        unit: line.unit,
                    },
                ],
            });
        }
    };

    return (
        <li className="flex gap-3 border-t border-border/40 py-3 first:border-t-0">
            <div className="flex shrink-0 flex-col items-center gap-1">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary-dark">
                    {stepNumber}
                </span>
                {editMode && (
                    <>
                        <button
                            type="button"
                            aria-label={`Move step ${stepNumber} up`}
                            disabled={isFirst}
                            className={iconButton}
                            onClick={() => onMove(-1)}
                        >
                            <ChevronUp className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            aria-label={`Move step ${stepNumber} down`}
                            disabled={isLast}
                            className={iconButton}
                            onClick={() => onMove(1)}
                        >
                            <ChevronDown className="h-5 w-5" />
                        </button>
                    </>
                )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col-reverse gap-3 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                {editMode ? (
                    <textarea
                        aria-label={`Step ${stepNumber} instruction`}
                        rows={3}
                        placeholder="Cream the butter and sugar until pale and fluffy"
                        className="w-full resize-none rounded-2xl border border-border bg-surface px-4 py-2"
                        value={step.instruction}
                        onChange={(e) => onChange({ instruction: e.target.value })}
                    />
                ) : (
                    <p className="whitespace-pre-line text-header">{step.instruction}</p>
                )}

                {(editMode || hasAmounts) && (
                    <div className="flex flex-col gap-1.5">
                        {step.ingredients.map((si) => (
                            <StepAmount
                                key={`i${si.ingredientId}`}
                                name={ingredientName(si.ingredientId)}
                                quantity={si.quantity}
                                unit={si.unit}
                                editMode={editMode}
                                scale={scale}
                                onChange={(change) =>
                                    onChange({
                                        ingredients: step.ingredients.map((x) =>
                                            x.ingredientId === si.ingredientId
                                                ? { ...x, ...change }
                                                : x,
                                        ),
                                    })
                                }
                                onRemove={() =>
                                    onChange({
                                        ingredients: step.ingredients.filter(
                                            (x) => x.ingredientId !== si.ingredientId,
                                        ),
                                    })
                                }
                            />
                        ))}

                        {step.components.map((sc) => {
                            const component = componentRecipe(sc.componentId);
                            return (
                                <StepAmount
                                    key={`c${sc.componentId}`}
                                    name={component?.name ?? ""}
                                    quantity={sc.quantity}
                                    unit={sc.unit}
                                    component={component}
                                    editMode={editMode}
                                    scale={scale}
                                    onChange={(change) =>
                                        onChange({
                                            components: step.components.map((x) =>
                                                x.componentId === sc.componentId
                                                    ? { ...x, ...change }
                                                    : x,
                                            ),
                                        })
                                    }
                                    onRemove={() =>
                                        onChange({
                                            components: step.components.filter(
                                                (x) => x.componentId !== sc.componentId,
                                            ),
                                        })
                                    }
                                />
                            );
                        })}

                        {editMode &&
                            (addableIngredients.length > 0 || addableComponents.length > 0) && (
                                <select
                                    aria-label={`Add to step ${stepNumber}`}
                                    className="w-full rounded-2xl border border-border px-3 py-1.5 text-sm"
                                    value=""
                                    onChange={(e) => addToStep(e.target.value)}
                                >
                                    <option value="">Add ingredient or component</option>
                                    {addableIngredients.map((ri) => (
                                        <option
                                            key={`i${ri.ingredientId}`}
                                            value={`i${ri.ingredientId}`}
                                        >
                                            {ingredientName(ri.ingredientId)} ·{" "}
                                            {amountLabel(
                                                Math.max(ingredientLeft(ri.ingredientId), 0),
                                                ri.unit,
                                            )}{" "}
                                            left
                                        </option>
                                    ))}
                                    {addableComponents.map((rc) => {
                                        const component = componentRecipe(rc.componentId);
                                        return (
                                            <option
                                                key={`c${rc.componentId}`}
                                                value={`c${rc.componentId}`}
                                            >
                                                {component?.name} ·{" "}
                                                {amountLabel(
                                                    Math.max(componentLeft(rc.componentId), 0),
                                                    rc.unit,
                                                    component,
                                                )}{" "}
                                                left
                                            </option>
                                        );
                                    })}
                                </select>
                            )}
                    </div>
                )}
            </div>

            {editMode && (
                <div className="flex shrink-0 flex-col gap-1">
                    <button
                        type="button"
                        aria-label={`Insert a step after step ${stepNumber}`}
                        className={iconButton}
                        onClick={onInsertAfter}
                    >
                        <Plus className="h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        aria-label={`Delete step ${stepNumber}`}
                        className="rounded-full p-1 text-body/60 hover:bg-danger/10 hover:text-danger"
                        onClick={onDelete}
                    >
                        <Trash className="h-5 w-5" />
                    </button>
                </div>
            )}
        </li>
    );
}

export default RecipeStepRow;
