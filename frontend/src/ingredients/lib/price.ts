import { unitFactor, type IngredientUnit, type NewIngredient } from "../../types/Ingredient";

export const maxUnitPrice = 999;

export const pricePer = (ingredient: NewIngredient, unit: IngredientUnit) =>
    (Number(ingredient.price) * unitFactor[unit]) /
    (Number(ingredient.packSize) * unitFactor[ingredient.ingredientUnit]);

export const formatUnitPrice = (value: number) =>
    value.toLocaleString("en-GB", {
        style: "currency",
        currency: "GBP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
    });
