import { unitFactor, type ExistingIngredient } from "../../types/Ingredient";
import type { ExistingRecipe, NewRecipe } from "../../types/Recipe";
import { amountLeft, leftoverTolerance } from "./form";

export const validateRecipe = (
    recipe: NewRecipe,
    ingredients: ExistingIngredient[],
    recipes: ExistingRecipe[],
) => {
    const errors: Record<string, string> = {};

    if (!recipe.name.trim()) {
        errors.name = "Name is required";
    }

    const sellingPrice = recipe.sellingPrice.trim();
    if (sellingPrice) {
        // Allows a minus sign so negatives get the "greater than 0" message instead
        if (!/^-?(\d+(\.\d+)?|\.\d+)$/.test(sellingPrice)) {
            errors.sellingPrice = "Selling price must be a number";
        } else if (Number(sellingPrice) <= 0) {
            errors.sellingPrice = "Selling price must be greater than 0";
        } else if (!/^\d*\.?\d{0,2}$/.test(sellingPrice)) {
            errors.sellingPrice = "Selling price must not have more than 2 decimal places";
        }
    }

    if (!recipe.description.trim()) {
        errors.description = "Description is required";
    }

    if (!(Number(recipe.yieldQuantity) > 0)) {
        errors.yield = "How much the recipe makes must be greater than 0";
    } else if (
        recipe.tinShape &&
        (!(Number(recipe.tinSize) > 0) ||
            (recipe.tinShape === "rectangle" && !(Number(recipe.tinWidth) > 0)))
    ) {
        errors.yield = "Tin size must be greater than 0";
    }

    if (recipe.ingredients.some((ri) => !(Number(ri.quantity) > 0)))
        errors.ingredients = "Ingredient quantities must all be greater than 0";

    if (recipe.components.some((rc) => !(Number(rc.quantity) > 0)))
        errors.components = "Component quantities must all be greater than 0";

    const overUsed = [
        ...recipe.ingredients.map((ri) => ({
            name: ingredients.find((i) => i.id === ri.ingredientId)?.name,
            unit: ri.unit,
            left: amountLeft(
                ri,
                recipe.steps.flatMap((s) =>
                    s.ingredients.filter((si) => si.ingredientId === ri.ingredientId),
                ),
            ),
        })),
        ...recipe.components.map((rc) => ({
            name: recipes.find((r) => r.id === rc.componentId)?.name,
            unit: rc.unit,
            left: amountLeft(
                rc,
                recipe.steps.flatMap((s) =>
                    s.components.filter((sc) => sc.componentId === rc.componentId),
                ),
            ),
        })),
    ].find((line) => line.left * unitFactor[line.unit] < -leftoverTolerance);

    if (recipe.steps.some((s) => !s.instruction.trim())) {
        errors.steps = "Every step needs an instruction";
    } else if (
        recipe.steps.some(
            (s) =>
                s.ingredients.some((si) => !(Number(si.quantity) > 0)) ||
                s.components.some((sc) => !(Number(sc.quantity) > 0)),
        )
    ) {
        errors.steps = "Step amounts must all be greater than 0";
    } else if (overUsed) {
        errors.steps = `Steps use more ${overUsed.name} than the recipe has`;
    }

    return errors;
};
