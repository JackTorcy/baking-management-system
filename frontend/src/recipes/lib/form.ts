import { unitFactor, type IngredientUnit } from "../../types/Ingredient";
import type { ExistingRecipe, NewRecipe, RecipeResponse, RecipeStep } from "../../types/Recipe";

export const newStep = (): RecipeStep => ({
    id: null,
    key: crypto.randomUUID(),
    instruction: "",
    ingredients: [],
    components: [],
});

export const toFormRecipe = (data: RecipeResponse): ExistingRecipe => ({
    ...data,
    sellingPrice: data.sellingPrice ?? "",
    yieldQuantity: String(data.yieldQuantity),
    tinSize: data.tinSize == null ? "" : String(data.tinSize),
    tinWidth: data.tinWidth == null ? "" : String(data.tinWidth),
    tinUnit: data.tinUnit ?? "inch",
    ingredients: data.ingredients.map((ri) => ({ ...ri, quantity: String(ri.quantity) })),
    components: data.components.map((rc) => ({ ...rc, quantity: String(rc.quantity) })),
    steps: data.steps.map((step) => ({
        ...step,
        key: String(step.id),
        ingredients: step.ingredients.map((si) => ({ ...si, quantity: String(si.quantity) })),
        components: step.components.map((sc) => ({ ...sc, quantity: String(sc.quantity) })),
    })),
});

export const toSaveRecipe = (recipe: NewRecipe) => ({
    name: recipe.name,
    sellingPrice: recipe.sellingPrice.trim() || null,
    description: recipe.description,
    yieldQuantity: Number(recipe.yieldQuantity),
    yieldUnit: recipe.yieldUnit,
    yieldLabel: recipe.yieldLabel,
    tinShape: recipe.tinShape,
    tinSize: recipe.tinShape ? Number(recipe.tinSize) : null,
    tinWidth: recipe.tinShape === "rectangle" ? Number(recipe.tinWidth) : null,
    tinUnit: recipe.tinShape ? recipe.tinUnit : null,
    ingredients: recipe.ingredients.map((ri) => ({ ...ri, quantity: Number(ri.quantity) })),
    components: recipe.components.map((rc) => ({ ...rc, quantity: Number(rc.quantity) })),
    steps: recipe.steps.map((step) => ({
        id: step.id,
        instruction: step.instruction,
        ingredients: step.ingredients.map((si) => ({ ...si, quantity: Number(si.quantity) })),
        components: step.components.map((sc) => ({ ...sc, quantity: Number(sc.quantity) })),
    })),
});

export const decimalPattern = /^\d*\.?\d*$/;

type Amount = { quantity: string; unit: IngredientUnit };

// How much of a recipe line the steps haven't used yet, in that line's unit
export const amountLeft = (line: Amount, usedInSteps: Amount[]) =>
    Number(line.quantity) -
    usedInSteps.reduce(
        (total, used) =>
            total + (Number(used.quantity) * unitFactor[used.unit]) / unitFactor[line.unit],
        0,
    );
