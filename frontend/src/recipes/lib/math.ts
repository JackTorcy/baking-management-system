import { pricePer } from "../../ingredients/lib/price";
import { unitFactor, type ExistingIngredient, type IngredientUnit } from "../../types/Ingredient";
import type { ExistingRecipe, NewRecipe, RecipeYield } from "../../types/Recipe";
import { formatGBP } from "./format";

// How much of a recipe's yield the given amount is, e.g. 300g of a recipe that makes 800g = 0.375
export const yieldFraction = (recipe: RecipeYield, quantity: string, unit: IngredientUnit) =>
    (Number(quantity) * unitFactor[unit]) /
    (Number(recipe.yieldQuantity) * unitFactor[recipe.yieldUnit]);

const cmPerInch = 2.54;

export const tinArea = (recipe: RecipeYield) => {
    if (!recipe.tinShape) return null;
    const toInches = recipe.tinUnit === "centimetre" ? 1 / cmPerInch : 1;
    const size = Number(recipe.tinSize) * toInches;
    if (recipe.tinShape === "round") return Math.PI * (size / 2) ** 2;
    if (recipe.tinShape === "square") return size ** 2;
    return size * Number(recipe.tinWidth) * toInches;
};

// Assumes the same tin depth, so only the base area scales
export const scaleFactor = (base: RecipeYield, target: RecipeYield) => {
    const amount = yieldFraction(base, target.yieldQuantity, target.yieldUnit);
    const baseArea = tinArea(base);
    const targetArea = tinArea(target);
    const factor = baseArea && targetArea ? amount * (targetArea / baseArea) : amount;
    return Number.isFinite(factor) && factor > 0 ? factor : 1;
};

export const containsRecipe = (
    recipe: NewRecipe,
    targetId: number,
    recipes: ExistingRecipe[],
    visited: Set<number> = new Set(),
): boolean =>
    recipe.components.some((rc) => {
        if (rc.componentId === targetId) return true;
        if (visited.has(rc.componentId)) return false;
        visited.add(rc.componentId);
        const component = recipes.find((r) => r.id === rc.componentId);
        return !!component && containsRecipe(component, targetId, recipes, visited);
    });

export const recipesUsingIngredient = (ingredientId: number, recipes: ExistingRecipe[]) =>
    recipes.filter((r) => r.ingredients.some((ri) => ri.ingredientId === ingredientId));

export const recipesUsingComponent = (componentId: number, recipes: ExistingRecipe[]) =>
    recipes.filter((r) => r.components.some((rc) => rc.componentId === componentId));

// The given recipes plus every recipe that uses them as a component, at any depth
export const withParentRecipes = (start: ExistingRecipe[], recipes: ExistingRecipe[]) => {
    const found = new Map(start.map((r) => [r.id, r]));
    const toVisit = [...start];
    while (toVisit.length > 0) {
        const current = toVisit.shift()!;
        for (const parent of recipesUsingComponent(current.id, recipes)) {
            if (found.has(parent.id)) continue;
            found.set(parent.id, parent);
            toVisit.push(parent);
        }
    }
    return [...found.values()];
};

export const recipeCost = (
    recipe: NewRecipe,
    recipes: ExistingRecipe[],
    ingredients: ExistingIngredient[],
    visited: Set<number> = new Set(),
): number => {
    const ingredientCost = recipe.ingredients.reduce((total, ri) => {
        const ingredient = ingredients.find((i) => i.id === ri.ingredientId);
        return ingredient ? total + Number(ri.quantity) * pricePer(ingredient, ri.unit) : total;
    }, 0);

    return recipe.components.reduce((total, rc) => {
        const component = recipes.find((r) => r.id === rc.componentId);
        if (!component || visited.has(component.id)) return total;
        const cost = recipeCost(
            component,
            recipes,
            ingredients,
            new Set(visited).add(component.id),
        );
        return total + yieldFraction(component, rc.quantity, rc.unit) * cost;
    }, ingredientCost);
};

export interface CostChange {
    recipe: ExistingRecipe;
    before: number;
    after: number;
}

interface CostInputs {
    recipes: ExistingRecipe[];
    ingredients: ExistingIngredient[];
}

// Only recipes whose displayed cost changes, so edits like renaming never warn. Compares formatted
// strings rather than rounding because formatGBP rounds half-pennies differently to Math.round
export const costChanges = (
    affected: ExistingRecipe[],
    before: CostInputs,
    after: CostInputs,
): CostChange[] =>
    affected
        .map((recipe) => ({
            recipe,
            before: recipeCost(recipe, before.recipes, before.ingredients, new Set([recipe.id])),
            after: recipeCost(
                after.recipes.find((r) => r.id === recipe.id) ?? recipe,
                after.recipes,
                after.ingredients,
                new Set([recipe.id]),
            ),
        }))
        .filter((change) => formatGBP(change.after) !== formatGBP(change.before));
