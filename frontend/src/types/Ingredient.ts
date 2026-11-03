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

export const unitFactor: Record<IngredientUnit, number> = {
    kilogram: 1000,
    gram: 1,
    millilitre: 1,
    litre: 1000,
    item: 1,
};

export const baseUnit: Record<UnitKind, IngredientUnit> = {
    weight: "gram",
    volume: "millilitre",
    count: "item",
};

export const unitsOfKind = (kind: UnitKind) => ingredientUnits.filter((u) => unitKind[u] === kind);

export interface NewIngredient {
    name: string;
    price: string;
    packSize: string;
    ingredientUnit: IngredientUnit;
}

export interface ExistingIngredient extends NewIngredient {
    id: number;
    isUsedInRecipe: boolean;
}
