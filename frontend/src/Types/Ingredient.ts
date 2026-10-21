export type IngredientUnit = "kilogram" | "gram" | "millilitre" | "litre" | "item";

export const ingredientUnits: IngredientUnit[] = [
    "kilogram",
    "gram",
    "millilitre",
    "litre",
    "item",
];

export type UnitKind = "weight" | "volume" | "count";

export const unitKind: Record<IngredientUnit, UnitKind> = {
    kilogram: "weight",
    gram: "weight",
    millilitre: "volume",
    litre: "volume",
    item: "count",
};

export const unitLabel: Record<string, string> = {
    kilogram: "kg",
    gram: "g",
    millilitre: "ml",
    litre: "L",
    item: "",
};

export interface NewIngredient {
    name: string;
    price: string;
    ingredientUnit: IngredientUnit;
}

export interface ExistingIngredient extends NewIngredient {
    id: number;
    isUsedInRecipe: boolean;
}
