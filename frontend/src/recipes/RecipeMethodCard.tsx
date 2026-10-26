import { Plus, TriangleAlert } from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import SubTitle from "../components/ui/SubTitle";
import type { ExistingIngredient } from "../types/Ingredient";
import {
    amountLabel,
    amountLeft,
    newStep,
    type ExistingRecipe,
    type NewRecipe,
    type RecipeStep,
} from "../types/Recipe";
import RecipeStepRow from "./RecipeStepRow";

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
        ...recipe.ingredients.map((ri) => {
            const left = ingredientLeft(ri.ingredientId);
            const name = ingredients.find((i) => i.id === ri.ingredientId)?.name ?? "";
            return { left, label: `${amountLabel(left * scale, ri.unit)} ${name}` };
        }),
        ...recipe.components.map((rc) => {
            const left = componentLeft(rc.componentId);
            const component = recipes.find((r) => r.id === rc.componentId);
            return {
                left,
                label: `${amountLabel(left * scale, rc.unit, component)} ${component?.name ?? ""}`,
            };
        }),
    ].filter((line) => line.left > leftoverTolerance);

    const moveStep = (index: number, offset: -1 | 1) => {
        const moved = [...steps];
        [moved[index], moved[index + offset]] = [moved[index + offset], moved[index]];
        onChange(moved);
    };

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
                    {steps.map((step, index) => (
                        <RecipeStepRow
                            key={step.key}
                            step={step}
                            stepNumber={index + 1}
                            isFirst={index === 0}
                            isLast={index === steps.length - 1}
                            recipe={recipe}
                            recipes={recipes}
                            ingredients={ingredients}
                            editMode={editMode}
                            scale={scale}
                            ingredientLeft={ingredientLeft}
                            componentLeft={componentLeft}
                            onChange={(change) =>
                                onChange(
                                    steps.map((s) =>
                                        s.key === step.key ? { ...s, ...change } : s,
                                    ),
                                )
                            }
                            onMove={(offset) => moveStep(index, offset)}
                            onInsertAfter={() =>
                                onChange([
                                    ...steps.slice(0, index + 1),
                                    newStep(),
                                    ...steps.slice(index + 1),
                                ])
                            }
                            onDelete={() => onChange(steps.filter((s) => s.key !== step.key))}
                        />
                    ))}
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
