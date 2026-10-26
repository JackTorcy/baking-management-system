import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import Card from "../components/ui/Card";
import SubTitle from "../components/ui/SubTitle";
import AmountInput from "./AmountInput";
import { unitLabel, type ExistingIngredient, type IngredientUnit } from "../types/Ingredient";
import {
    amountLabel,
    containsRecipe,
    formatGBP,
    recipeCost,
    yieldFraction,
    yieldUnitLabel,
    type ExistingRecipe,
    type RecipeComponent,
} from "../types/Recipe";

interface RecipeComponentsCardProps {
    components: RecipeComponent[];
    recipes: ExistingRecipe[];
    ingredients: ExistingIngredient[];
    recipeId?: number;
    editMode: boolean;
    scale: number;
    error?: string;
    onChange: (components: RecipeComponent[]) => void;
}

function RecipeComponentsCard({
    components,
    recipes,
    ingredients,
    recipeId,
    editMode,
    scale,
    error,
    onChange,
}: RecipeComponentsCardProps) {
    const [expanded, setExpanded] = useState<number[]>([]);

    if (!editMode && components.length === 0) return null;

    const addableRecipes = recipes.filter(
        (r) =>
            r.id !== recipeId &&
            !components.some((rc) => rc.componentId === r.id) &&
            (recipeId === undefined || !containsRecipe(r, recipeId, recipes)),
    );

    const addComponent = (componentId: number) => {
        const component = recipes.find((r) => r.id === componentId);
        if (!component) return;
        onChange([...components, { componentId, quantity: "", unit: component.yieldUnit }]);
    };

    const updateComponent = (componentId: number, change: Partial<RecipeComponent>) =>
        onChange(
            components.map((rc) => (rc.componentId === componentId ? { ...rc, ...change } : rc)),
        );

    const toggleExpanded = (componentId: number) =>
        setExpanded((prev) =>
            prev.includes(componentId)
                ? prev.filter((id) => id !== componentId)
                : [...prev, componentId],
        );

    return (
        <Card className="mb-4">
            <SubTitle title="Components"></SubTitle>
            {error && <span className="text-danger text-sm">{error}</span>}
            {components.length > 0 ? (
                <div className="mb-3 divide-y divide-border/40">
                    {components.map((rc) => {
                        const component = recipes.find((r) => r.id === rc.componentId);
                        if (!component) return null;
                        const fraction = yieldFraction(component, rc.quantity, rc.unit) * scale;
                        const cost =
                            recipeCost(component, recipes, ingredients, new Set([component.id])) *
                            fraction;
                        const unitName = (unit: IngredientUnit) =>
                            unit === "item" ? yieldUnitLabel(component) : unitLabel[unit];
                        const isExpanded = expanded.includes(rc.componentId);

                        return (
                            <div key={rc.componentId} className="py-2">
                                <div className="flex items-center gap-2">
                                    {editMode ? (
                                        <AmountInput
                                            name={component.name}
                                            quantity={rc.quantity}
                                            unit={rc.unit}
                                            unitName={unitName}
                                            className="w-36"
                                            onQuantityChange={(quantity) =>
                                                updateComponent(rc.componentId, { quantity })
                                            }
                                            onUnitChange={(unit) =>
                                                updateComponent(rc.componentId, { unit })
                                            }
                                        />
                                    ) : (
                                        <span className="min-w-24 shrink-0 whitespace-nowrap text-right tabular-nums font-medium text-header">
                                            {amountLabel(
                                                Number(rc.quantity) * scale,
                                                rc.unit,
                                                component,
                                            )}
                                        </span>
                                    )}

                                    <button
                                        type="button"
                                        aria-expanded={isExpanded}
                                        aria-label={`Show what goes into ${component.name}`}
                                        className="shrink-0 rounded-full p-1 text-body/60 hover:bg-background"
                                        onClick={() => toggleExpanded(rc.componentId)}
                                    >
                                        {isExpanded ? (
                                            <ChevronDown className="h-4 w-4" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4" />
                                        )}
                                    </button>

                                    {editMode ? (
                                        <span className="truncate flex-1 min-w-0">
                                            {component.name}
                                        </span>
                                    ) : (
                                        <Link
                                            to={`/recipes/${component.id}`}
                                            className="truncate flex-1 min-w-0 hover:text-primary hover:underline"
                                        >
                                            {component.name}
                                        </Link>
                                    )}

                                    <span className="shrink-0 text-sm tabular-nums">
                                        {formatGBP(cost)}
                                    </span>

                                    {editMode && (
                                        <button
                                            type="button"
                                            aria-label={`Remove ${component.name}`}
                                            className="shrink-0 rounded-full p-1 text-body/60 hover:bg-danger/10 hover:text-danger"
                                            onClick={() =>
                                                onChange(
                                                    components.filter(
                                                        (c) => c.componentId !== rc.componentId,
                                                    ),
                                                )
                                            }
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>

                                {isExpanded && (
                                    <ul className="mt-1 pl-10 text-sm space-y-0.5">
                                        {component.ingredients.map((ri) => (
                                            <li key={`i${ri.ingredientId}`}>
                                                <span className="tabular-nums text-header">
                                                    {amountLabel(
                                                        Number(ri.quantity) * fraction,
                                                        ri.unit,
                                                    )}
                                                </span>{" "}
                                                {
                                                    ingredients.find(
                                                        (i) => i.id === ri.ingredientId,
                                                    )?.name
                                                }
                                            </li>
                                        ))}
                                        {component.components.map((sub) => {
                                            const subRecipe = recipes.find(
                                                (r) => r.id === sub.componentId,
                                            );
                                            return (
                                                <li key={`c${sub.componentId}`}>
                                                    <span className="tabular-nums text-header">
                                                        {amountLabel(
                                                            Number(sub.quantity) * fraction,
                                                            sub.unit,
                                                            subRecipe,
                                                        )}
                                                    </span>{" "}
                                                    {subRecipe?.name}
                                                </li>
                                            );
                                        })}
                                        {component.ingredients.length === 0 &&
                                            component.components.length === 0 && (
                                                <li>Nothing added to this recipe yet</li>
                                            )}
                                    </ul>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="mb-3 text-center">
                    No components yet. Add another recipe, like a buttercream or sponge, to use it
                    here.
                </div>
            )}

            <div hidden={!editMode} className="border-t pt-3 border-border">
                <select
                    aria-label="Add a component"
                    onChange={(e) => addComponent(Number(e.target.value))}
                    className="w-full border border-border rounded-2xl px-3 py-2"
                >
                    <option value="">Select</option>
                    {addableRecipes.map((r) => (
                        <option key={r.id} value={r.id}>
                            {r.name}
                        </option>
                    ))}
                </select>
            </div>
        </Card>
    );
}

export default RecipeComponentsCard;
