import { ChevronDown, ChevronUp, Plus, Trash, TriangleAlert, X } from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import SubTitle from "../components/ui/SubTitle";
import {
    unitKind,
    unitLabel,
    unitsOfKind,
    type ExistingIngredient,
    type IngredientUnit,
} from "../types/Ingredient";
import {
    amountLabel,
    amountLeft,
    newStep,
    yieldUnitLabel,
    type ExistingRecipe,
    type NewRecipe,
    type RecipeStep,
} from "../types/Recipe";

interface RecipeMethodCardProps {
    recipe: NewRecipe;
    recipes: ExistingRecipe[];
    ingredients: ExistingIngredient[];
    editMode: boolean;
    scale: number;
    error?: string;
    onChange: (steps: RecipeStep[]) => void;
}

// Leftovers smaller than this are float noise from unit conversion, not real unused amounts
const leftoverTolerance = 0.001;

function RecipeMethodCard({
    recipe,
    recipes,
    ingredients,
    editMode,
    scale,
    error,
    onChange,
}: RecipeMethodCardProps) {
    const steps = recipe.steps;
    if (!editMode && steps.length === 0) return null;

    const ingredientName = (ingredientId: number) =>
        ingredients.find((i) => i.id === ingredientId)?.name ?? "";
    const componentRecipe = (componentId: number) => recipes.find((r) => r.id === componentId);

    const ingredientLeft = (ingredientId: number) => {
        const line = recipe.ingredients.find((ri) => ri.ingredientId === ingredientId);
        if (!line) return 0;
        const uses = steps.flatMap((s) =>
            s.ingredients.filter((si) => si.ingredientId === ingredientId),
        );
        return amountLeft(line, uses);
    };
    const componentLeft = (componentId: number) => {
        const line = recipe.components.find((rc) => rc.componentId === componentId);
        if (!line) return 0;
        const uses = steps.flatMap((s) =>
            s.components.filter((sc) => sc.componentId === componentId),
        );
        return amountLeft(line, uses);
    };

    const unused = [
        ...recipe.ingredients.map((ri) => ({
            key: `i${ri.ingredientId}`,
            label: `${amountLabel(ingredientLeft(ri.ingredientId) * scale, ri.unit)} ${ingredientName(ri.ingredientId)}`,
            left: ingredientLeft(ri.ingredientId),
        })),
        ...recipe.components.map((rc) => {
            const component = componentRecipe(rc.componentId);
            return {
                key: `c${rc.componentId}`,
                label: `${amountLabel(componentLeft(rc.componentId) * scale, rc.unit, component)} ${component?.name ?? ""}`,
                left: componentLeft(rc.componentId),
            };
        }),
    ].filter((line) => line.left > leftoverTolerance);

    const updateStep = (key: string, change: Partial<RecipeStep>) =>
        onChange(steps.map((s) => (s.key === key ? { ...s, ...change } : s)));

    const moveStep = (index: number, offset: -1 | 1) => {
        const moved = [...steps];
        [moved[index], moved[index + offset]] = [moved[index + offset], moved[index]];
        onChange(moved);
    };

    const insertStepAfter = (index: number) =>
        onChange([...steps.slice(0, index + 1), newStep(), ...steps.slice(index + 1)]);

    const addToStep = (step: RecipeStep, value: string) => {
        const id = Number(value.slice(1));
        if (value.startsWith("i")) {
            const line = recipe.ingredients.find((ri) => ri.ingredientId === id);
            if (!line) return;
            const left = ingredientLeft(id);
            updateStep(step.key, {
                ingredients: [
                    ...step.ingredients,
                    {
                        ingredientId: id,
                        quantity: left > 0 ? String(Number(left.toFixed(4))) : "",
                        unit: line.unit,
                    },
                ],
            });
        } else {
            const line = recipe.components.find((rc) => rc.componentId === id);
            if (!line) return;
            const left = componentLeft(id);
            updateStep(step.key, {
                components: [
                    ...step.components,
                    {
                        componentId: id,
                        quantity: left > 0 ? String(Number(left.toFixed(4))) : "",
                        unit: line.unit,
                    },
                ],
            });
        }
    };

    const amountInput = (
        label: string,
        quantity: string,
        unit: IngredientUnit,
        unitName: (unit: IngredientUnit) => string,
        onQuantity: (quantity: string) => void,
        onUnit: (unit: IngredientUnit) => void,
    ) => {
        const unitOptions = unitsOfKind(unitKind[unit]);
        return (
            <label className="flex w-28 shrink-0 items-center rounded-lg border border-border/70 bg-background px-2 py-0.5 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <input
                    inputMode="decimal"
                    aria-label={`Amount of ${label}`}
                    className="w-full min-w-0 bg-transparent text-right tabular-nums text-header outline-none"
                    value={quantity}
                    onChange={(e) => {
                        if (/^\d*\.?\d*$/.test(e.target.value)) onQuantity(e.target.value);
                    }}
                />
                {unitOptions.length > 1 ? (
                    <select
                        aria-label={`Unit for ${label}`}
                        className="ml-1 bg-transparent text-sm text-body/70 outline-none"
                        value={unit}
                        onChange={(e) => onUnit(e.target.value as IngredientUnit)}
                    >
                        {unitOptions.map((u) => (
                            <option key={u} value={u}>
                                {unitName(u)}
                            </option>
                        ))}
                    </select>
                ) : (
                    <span className="ml-1 truncate text-sm text-body/70">{unitName(unit)}</span>
                )}
            </label>
        );
    };

    const removeButton = (label: string, onClick: () => void) => (
        <button
            type="button"
            aria-label={`Remove ${label}`}
            className="shrink-0 rounded-full p-1 text-body/60 hover:bg-danger/10 hover:text-danger"
            onClick={onClick}
        >
            <X className="h-4 w-4" />
        </button>
    );

    const iconButton =
        "rounded-full p-1 text-body/60 hover:bg-background hover:text-header disabled:opacity-30 disabled:hover:bg-transparent";

    return (
        <Card className="mb-4">
            <SubTitle title="Method"></SubTitle>
            {error && <div className="text-danger text-sm">{error}</div>}
            {steps.length > 0 && unused.length > 0 && (
                <div className="mb-2 flex items-start gap-2 text-sm">
                    <TriangleAlert className="h-4 w-4 shrink-0 text-warning" />
                    <span>Not used in any step: {unused.map((line) => line.label).join(", ")}</span>
                </div>
            )}

            {steps.length > 0 ? (
                <ol className="mb-3">
                    {steps.map((step, index) => {
                        const stepNumber = index + 1;
                        const hasAmounts =
                            step.ingredients.length > 0 || step.components.length > 0;
                        const addableIngredients = recipe.ingredients.filter(
                            (ri) =>
                                !step.ingredients.some((si) => si.ingredientId === ri.ingredientId),
                        );
                        const addableComponents = recipe.components.filter(
                            (rc) =>
                                !step.components.some((sc) => sc.componentId === rc.componentId),
                        );

                        return (
                            <li
                                key={step.key}
                                className="flex gap-3 border-t border-border/40 py-3 first:border-t-0"
                            >
                                <div className="flex shrink-0 flex-col items-center gap-1">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary-dark">
                                        {stepNumber}
                                    </span>
                                    {editMode && (
                                        <>
                                            <button
                                                type="button"
                                                aria-label={`Move step ${stepNumber} up`}
                                                disabled={index === 0}
                                                className={iconButton}
                                                onClick={() => moveStep(index, -1)}
                                            >
                                                <ChevronUp className="h-5 w-5" />
                                            </button>
                                            <button
                                                type="button"
                                                aria-label={`Move step ${stepNumber} down`}
                                                disabled={index === steps.length - 1}
                                                className={iconButton}
                                                onClick={() => moveStep(index, 1)}
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
                                            onChange={(e) =>
                                                updateStep(step.key, {
                                                    instruction: e.target.value,
                                                })
                                            }
                                        />
                                    ) : (
                                        <p className="whitespace-pre-line text-header">
                                            {step.instruction}
                                        </p>
                                    )}

                                    {(editMode || hasAmounts) && (
                                        <div className="flex flex-col gap-1.5">
                                            {step.ingredients.map((si) => {
                                                const name = ingredientName(si.ingredientId);
                                                return editMode ? (
                                                    <div
                                                        key={`i${si.ingredientId}`}
                                                        className="flex items-center gap-2"
                                                    >
                                                        {amountInput(
                                                            name,
                                                            si.quantity,
                                                            si.unit,
                                                            (u) => unitLabel[u],
                                                            (quantity) =>
                                                                updateStep(step.key, {
                                                                    ingredients:
                                                                        step.ingredients.map((x) =>
                                                                            x.ingredientId ===
                                                                            si.ingredientId
                                                                                ? { ...x, quantity }
                                                                                : x,
                                                                        ),
                                                                }),
                                                            (unit) =>
                                                                updateStep(step.key, {
                                                                    ingredients:
                                                                        step.ingredients.map((x) =>
                                                                            x.ingredientId ===
                                                                            si.ingredientId
                                                                                ? { ...x, unit }
                                                                                : x,
                                                                        ),
                                                                }),
                                                        )}
                                                        <span className="min-w-0 flex-1 truncate">
                                                            {name}
                                                        </span>
                                                        {removeButton(name, () =>
                                                            updateStep(step.key, {
                                                                ingredients:
                                                                    step.ingredients.filter(
                                                                        (x) =>
                                                                            x.ingredientId !==
                                                                            si.ingredientId,
                                                                    ),
                                                            }),
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div
                                                        key={`i${si.ingredientId}`}
                                                        className="text-sm"
                                                    >
                                                        <span className="font-medium tabular-nums text-header">
                                                            {amountLabel(
                                                                Number(si.quantity) * scale,
                                                                si.unit,
                                                            )}
                                                        </span>{" "}
                                                        {name}
                                                    </div>
                                                );
                                            })}

                                            {step.components.map((sc) => {
                                                const component = componentRecipe(sc.componentId);
                                                const name = component?.name ?? "";
                                                const unitName = (u: IngredientUnit) =>
                                                    u === "item" && component
                                                        ? yieldUnitLabel(component)
                                                        : unitLabel[u];
                                                return editMode ? (
                                                    <div
                                                        key={`c${sc.componentId}`}
                                                        className="flex items-center gap-2"
                                                    >
                                                        {amountInput(
                                                            name,
                                                            sc.quantity,
                                                            sc.unit,
                                                            unitName,
                                                            (quantity) =>
                                                                updateStep(step.key, {
                                                                    components: step.components.map(
                                                                        (x) =>
                                                                            x.componentId ===
                                                                            sc.componentId
                                                                                ? { ...x, quantity }
                                                                                : x,
                                                                    ),
                                                                }),
                                                            (unit) =>
                                                                updateStep(step.key, {
                                                                    components: step.components.map(
                                                                        (x) =>
                                                                            x.componentId ===
                                                                            sc.componentId
                                                                                ? { ...x, unit }
                                                                                : x,
                                                                    ),
                                                                }),
                                                        )}
                                                        <span className="min-w-0 flex-1 truncate">
                                                            {name}
                                                        </span>
                                                        {removeButton(name, () =>
                                                            updateStep(step.key, {
                                                                components: step.components.filter(
                                                                    (x) =>
                                                                        x.componentId !==
                                                                        sc.componentId,
                                                                ),
                                                            }),
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div
                                                        key={`c${sc.componentId}`}
                                                        className="text-sm"
                                                    >
                                                        <span className="font-medium tabular-nums text-header">
                                                            {amountLabel(
                                                                Number(sc.quantity) * scale,
                                                                sc.unit,
                                                                component,
                                                            )}
                                                        </span>{" "}
                                                        {name}
                                                    </div>
                                                );
                                            })}

                                            {editMode &&
                                                (addableIngredients.length > 0 ||
                                                    addableComponents.length > 0) && (
                                                    <select
                                                        aria-label={`Add to step ${stepNumber}`}
                                                        className="w-full rounded-2xl border border-border px-3 py-1.5 text-sm"
                                                        value=""
                                                        onChange={(e) =>
                                                            addToStep(step, e.target.value)
                                                        }
                                                    >
                                                        <option value="">
                                                            Add ingredient or component
                                                        </option>
                                                        {addableIngredients.map((ri) => (
                                                            <option
                                                                key={`i${ri.ingredientId}`}
                                                                value={`i${ri.ingredientId}`}
                                                            >
                                                                {ingredientName(ri.ingredientId)} ·{" "}
                                                                {amountLabel(
                                                                    Math.max(
                                                                        ingredientLeft(
                                                                            ri.ingredientId,
                                                                        ),
                                                                        0,
                                                                    ),
                                                                    ri.unit,
                                                                )}{" "}
                                                                left
                                                            </option>
                                                        ))}
                                                        {addableComponents.map((rc) => {
                                                            const component = componentRecipe(
                                                                rc.componentId,
                                                            );
                                                            return (
                                                                <option
                                                                    key={`c${rc.componentId}`}
                                                                    value={`c${rc.componentId}`}
                                                                >
                                                                    {component?.name} ·{" "}
                                                                    {amountLabel(
                                                                        Math.max(
                                                                            componentLeft(
                                                                                rc.componentId,
                                                                            ),
                                                                            0,
                                                                        ),
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
                                            onClick={() => insertStepAfter(index)}
                                        >
                                            <Plus className="h-5 w-5" />
                                        </button>
                                        <button
                                            type="button"
                                            aria-label={`Delete step ${stepNumber}`}
                                            className="rounded-full p-1 text-body/60 hover:bg-danger/10 hover:text-danger"
                                            onClick={() =>
                                                onChange(steps.filter((s) => s.key !== step.key))
                                            }
                                        >
                                            <Trash className="h-5 w-5" />
                                        </button>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ol>
            ) : (
                <div className="mb-3 text-center">
                    No steps yet. Write the method one step at a time, and say how much of each
                    ingredient goes in.
                </div>
            )}

            {editMode && (
                <Button variant="secondary" onClick={() => onChange([...steps, newStep()])}>
                    <Plus className="mr-1 h-5 w-5" />
                    Add step
                </Button>
            )}
        </Card>
    );
}

export default RecipeMethodCard;
