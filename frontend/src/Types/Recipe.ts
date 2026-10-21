import type { IngredientUnit } from "./Ingredient";

export interface NewRecipe {
    name: string;
    price: string;
    description: string;
    ingredients: RecipeIngredient[];
}

export interface ExistingRecipe extends NewRecipe {
    id: number;
}

export interface RecipeIngredient {
    ingredientId: number;
    quantity: string;
    unit: IngredientUnit;
}
