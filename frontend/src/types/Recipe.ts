import type { IngredientUnit } from "./Ingredient";

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
    // Empty when the recipe isn't sold on its own
    sellingPrice: string;
    description: string;
    ingredients: RecipeIngredient[];
    components: RecipeComponent[];
    steps: RecipeStep[];
}

export interface ExistingRecipe extends NewRecipe {
    id: number;
    isUsedAsComponent: boolean;
    cost: number;
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
    | "sellingPrice"
    | "yieldQuantity"
    | "tinSize"
    | "tinWidth"
    | "tinUnit"
    | "ingredients"
    | "components"
    | "steps"
> {
    sellingPrice: string | null;
    yieldQuantity: number;
    tinSize: number | null;
    tinWidth: number | null;
    tinUnit: LengthUnit | null;
    ingredients: WithNumberQuantity<RecipeIngredient>[];
    components: WithNumberQuantity<RecipeComponent>[];
    steps: RecipeStepResponse[];
}
