import { baseUnit, unitKind, unitLabel, type NewIngredient } from "../../types/Ingredient";
import { formatUnitPrice, maxUnitPrice, pricePer } from "./price";

export const validateIngredient = (ingredient: NewIngredient) => {
    const errors: Record<string, string> = {};

    if (!ingredient.name.trim()) {
        errors.name = "Name is required";
    }

    // The number checks allow a minus sign so negatives get the "greater than 0" message instead
    if (!ingredient.price.trim()) {
        errors.price = "Price is required";
    } else if (!/^-?(\d+(\.\d+)?|\.\d+)$/.test(ingredient.price)) {
        errors.price = "Price must be a number";
    } else if (Number(ingredient.price) <= 0) {
        errors.price = "Price must be greater than 0";
    } else if (!/^\d*\.?\d{0,4}$/.test(ingredient.price)) {
        errors.price = "Price must not have more than 4 decimal places";
    }

    if (!ingredient.packSize.trim()) {
        errors.packSize = "Pack size is required";
    } else if (!/^-?(\d+(\.\d+)?|\.\d+)$/.test(ingredient.packSize)) {
        errors.packSize = "Pack size must be a number";
    } else if (Number(ingredient.packSize) <= 0) {
        errors.packSize = "Pack size must be greater than 0";
    } else if (!/^\d*\.?\d{0,4}$/.test(ingredient.packSize)) {
        errors.packSize = "Pack size must not have more than 4 decimal places";
    }

    const unitPrice = pricePer(ingredient, ingredient.ingredientUnit);
    if (!errors.price && !errors.packSize && unitPrice > maxUnitPrice) {
        const unit = ingredient.ingredientUnit;
        const smallerUnit = baseUnit[unitKind[unit]];
        errors.price =
            `That's ${formatUnitPrice(unitPrice)} per ${unitLabel[unit] || unit}. ` +
            `Prices over ${formatUnitPrice(maxUnitPrice)} per unit are usually a typo` +
            (smallerUnit !== unit ? `, or try entering it per ${unitLabel[smallerUnit]}.` : ".");
    }

    return errors;
};
