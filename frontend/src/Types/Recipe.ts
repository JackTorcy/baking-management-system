export interface NewRecipe {
    name: string;
    price: string;
    description: string;
    ingredients: RecipeIngredient[];
}

export interface ExistingRecipe extends NewRecipe {
    id: number;
    createdAt: string;
}

export interface RecipeIngredient {
    ingredientId: number;
    quantity: number;
}
