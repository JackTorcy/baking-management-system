import {
    pricePer,
    unitFactor,
    unitLabel,
    type ExistingIngredient,
    type IngredientUnit,
} from "./Ingredient";

export type TinShape = "round" | "square" | "rectangle";
export type LengthUnit = "inch" | "centimetre";

export const tinShapes: TinShape[] = ["round", "square", "rectangle"];

export const lengthUnitLabel: Record<LengthUnit, string> = {
    inch: "inch",
    centimetre: "cm",
};

export interface RecipeYield {
    yieldQuantity: string;
    yieldUnit: IngredientUnit;
    yieldLabel: string;
    tinShape: TinShape | null;
    tinSize: string;
    tinWidth: string;
    tinUnit: LengthUnit;
}

export interface NewRecipe extends RecipeYield {
    name: string;
    price: string;
    description: string;
    ingredients: RecipeIngredient[];
    components: RecipeComponent[];
    steps: RecipeStep[];
}

export interface ExistingRecipe extends NewRecipe {
    id: number;
    isUsedAsComponent: boolean;
}

export interface RecipeIngredient {
    ingredientId: number;
    quantity: string;
    unit: IngredientUnit;
}

export interface RecipeComponent {
    componentId: number;
    quantity: string;
    unit: IngredientUnit;
}

export interface RecipeStep {
    id: number | null;
    // React key that stays put while new (unsaved) steps are moved around
    key: string;
    instruction: string;
    ingredients: RecipeIngredient[];
    components: RecipeComponent[];
}

type WithNumberQuantity<T> = Omit<T, "quantity"> & { quantity: number };

interface RecipeStepResponse {
    id: number;
    instruction: string;
    ingredients: WithNumberQuantity<RecipeIngredient>[];
    components: WithNumberQuantity<RecipeComponent>[];
}

export interface RecipeResponse extends Omit<
    ExistingRecipe,
    "yieldQuantity" | "tinSize" | "tinWidth" | "tinUnit" | "ingredients" | "components" | "steps"
> {
    yieldQuantity: number;
    tinSize: number | null;
    tinWidth: number | null;
    tinUnit: LengthUnit | null;
    ingredients: WithNumberQuantity<RecipeIngredient>[];
    components: WithNumberQuantity<RecipeComponent>[];
    steps: RecipeStepResponse[];
}

export const newStep = (): RecipeStep => ({
    id: null,
    key: crypto.randomUUID(),
    instruction: "",
    ingredients: [],
    components: [],
});

export const toFormRecipe = (data: RecipeResponse): ExistingRecipe => ({
    ...data,
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
    price: recipe.price,
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

export const formatGBP = (value: number) =>
    value.toLocaleString("en-GB", { style: "currency", currency: "GBP" });

// Kitchen precision: nobody weighs 156.25ml, but 2.25g of yeast matters
export const formatQuantity = (value: number) =>
    String(Number(value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2)));

const largerUnit: Partial<Record<IngredientUnit, IngredientUnit>> = {
    gram: "kilogram",
    millilitre: "litre",
};

export const formatAmount = (quantity: number, unit: IngredientUnit) => {
    const larger = largerUnit[unit];
    if (larger && Number(formatQuantity(quantity)) >= unitFactor[larger])
        return `${formatQuantity(quantity / unitFactor[larger])}${unitLabel[larger]}`;
    return `${formatQuantity(quantity)}${unitLabel[unit]}`;
};

export const yieldUnitLabel = (recipe: RecipeYield) =>
    recipe.yieldUnit === "item" ? recipe.yieldLabel || "batch" : unitLabel[recipe.yieldUnit];

export const amountLabel = (quantity: number, unit: IngredientUnit, recipe?: RecipeYield) =>
    unit === "item"
        ? `${formatQuantity(quantity)} ${recipe ? yieldUnitLabel(recipe) : ""}`
        : formatAmount(quantity, unit);

type Amount = { quantity: string; unit: IngredientUnit };

// How much of a recipe line the steps haven't used yet, in that line's unit
export const amountLeft = (line: Amount, usedInSteps: Amount[]) =>
    Number(line.quantity) -
    usedInSteps.reduce(
        (total, used) =>
            total + (Number(used.quantity) * unitFactor[used.unit]) / unitFactor[line.unit],
        0,
    );

export const describeTin = (recipe: RecipeYield) => {
    const unit = lengthUnitLabel[recipe.tinUnit];
    const width = recipe.tinShape === "rectangle" ? ` × ${recipe.tinWidth} ${unit}` : "";
    return `${recipe.tinSize} ${unit}${width} ${recipe.tinShape} tin`;
};

export const describeYield = (recipe: RecipeYield) => {
    const unit =
        recipe.yieldUnit === "item" && !recipe.yieldLabel
            ? Number(recipe.yieldQuantity) === 1
                ? "item"
                : "items"
            : yieldUnitLabel(recipe);
    const amount = `Makes ${recipe.yieldQuantity}${recipe.yieldUnit === "item" ? ` ${unit}` : unit}`;
    return recipe.tinShape ? `${amount} · ${describeTin(recipe)}` : amount;
};

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
