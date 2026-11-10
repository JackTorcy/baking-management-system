import {
    baseUnit,
    unitFactor,
    unitKind,
    unitLabel,
    type IngredientUnit,
} from "../../types/Ingredient";
import { lengthUnitLabel, type RecipeYield } from "../../types/Recipe";

export const formatGBP = (value: number) =>
    value.toLocaleString("en-GB", { style: "currency", currency: "GBP" });

// Kitchen precision: nobody weighs 156.25ml, but 2.25g of yeast matters
export const formatQuantity = (value: number) =>
    String(Number(value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2)));

const largerUnit: Partial<Record<IngredientUnit, IngredientUnit>> = {
    gram: "kilogram",
    millilitre: "litre",
};

// formatQuantity's precision assumes base units, so convert to g/ml before picking the display unit
export const formatAmount = (quantity: number, unit: IngredientUnit) => {
    const base = baseUnit[unitKind[unit]];
    const baseQuantity = quantity * unitFactor[unit];
    const larger = largerUnit[base];
    if (larger && Number(formatQuantity(baseQuantity)) >= unitFactor[larger])
        return `${formatQuantity(baseQuantity / unitFactor[larger])}${unitLabel[larger]}`;
    return `${formatQuantity(baseQuantity)}${unitLabel[base]}`;
};

export const yieldUnitLabel = (recipe: RecipeYield, quantity = 1) =>
    recipe.yieldUnit === "item"
        ? recipe.yieldLabel || (quantity === 1 ? "batch" : "batches")
        : unitLabel[recipe.yieldUnit];

// Pluralise on the rounded number shown, so 1.001 reads "1 batch" not "1 batches"
export const amountLabel = (quantity: number, unit: IngredientUnit, recipe?: RecipeYield) => {
    if (unit !== "item") return formatAmount(quantity, unit);
    const shown = formatQuantity(quantity);
    return `${shown} ${recipe ? yieldUnitLabel(recipe, Number(shown)) : ""}`.trim();
};

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
