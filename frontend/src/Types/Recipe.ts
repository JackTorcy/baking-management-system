export interface NewRecipe {
    name: string;
    price: string;
    description: string;
}

export interface ExistingRecipe extends NewRecipe {
    id: number;
    createdAt: string;
}
