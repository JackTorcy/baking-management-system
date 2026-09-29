export interface NewRecipe {
    name: string;
    description?: string;
    price: number;
}

export interface ExistingRecipe extends NewRecipe {
    id: number;
    createdAt: string;
}
