export type IngredientUnit = "kilogram" | "gram" | "millilitre" | "litre" | "item";

export const ingredientUnits: IngredientUnit[] = [
    "kilogram",
    "gram",
    "millilitre",
    "litre",
    "item",
];

export interface NewIngredient {
    name: string;
    price: string;
    ingredientUnit: IngredientUnit;
}

export interface ExistingIngredient extends NewIngredient {
    id: number;
    createdAt: string;
}
