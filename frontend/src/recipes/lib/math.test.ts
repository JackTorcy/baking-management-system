import { describe, expect, it } from "vitest";
import {
    containsRecipe,
    costChanges,
    recipeCost,
    recipesUsingComponent,
    recipesUsingIngredient,
    scaleFactor,
    tinArea,
    withParentRecipes,
    yieldFraction,
} from "./math";
import type { ExistingIngredient, IngredientUnit } from "../../types/Ingredient";
import type { ExistingRecipe, RecipeYield } from "../../types/Recipe";

const baseYield: RecipeYield = {
    yieldQuantity: "1",
    yieldUnit: "item",
    yieldLabel: "",
    tinShape: null,
    tinSize: "",
    tinWidth: "",
    tinUnit: "inch",
};

const targetYield: RecipeYield = {
    yieldQuantity: "5",
    yieldUnit: "item",
    yieldLabel: "",
    tinShape: null,
    tinSize: "",
    tinWidth: "",
    tinUnit: "inch",
};

describe("yieldFraction", () => {
    it.each([
        { recipeQty: "1000", recipeUnit: "gram", qty: "300", unit: "gram", expected: 0.3 },
        { recipeQty: "2", recipeUnit: "litre", qty: "0.4", unit: "litre", expected: 0.2 },
        { recipeQty: "16", recipeUnit: "item", qty: "12", unit: "item", expected: 0.75 },
        { recipeQty: "3", recipeUnit: "kilogram", qty: "1800", unit: "gram", expected: 0.6 },
        { recipeQty: "600", recipeUnit: "gram", qty: "0.3", unit: "kilogram", expected: 0.5 },
        { recipeQty: "3", recipeUnit: "litre", qty: "1800", unit: "millilitre", expected: 0.6 },
        { recipeQty: "600", recipeUnit: "millilitre", qty: "0.3", unit: "litre", expected: 0.5 },
    ] as const)(
        "$qty $unit of a recipe making $recipeQty $recipeUnit is $expected",
        ({ recipeQty, recipeUnit, qty, unit, expected }) => {
            expect(
                yieldFraction(
                    { ...baseYield, yieldQuantity: recipeQty, yieldUnit: recipeUnit },
                    qty,
                    unit,
                ),
            ).toBe(expected);
        },
    );
});

describe("tinArea", () => {
    it("returns null when no tin shape", () => {
        expect(tinArea(baseYield)).toBe(null);
    });

    it("converts a 5.08cm round tin to 3.141592(pi) square inch", () => {
        expect(
            tinArea({ ...baseYield, tinShape: "round", tinUnit: "centimetre", tinSize: "5.08" }),
        ).toBeCloseTo(Math.PI);
    });
    it("converts a 2inch square tin to 3.141592(pi) square inch", () => {
        expect(
            tinArea({ ...baseYield, tinShape: "round", tinUnit: "inch", tinSize: "2" }),
        ).toBeCloseTo(Math.PI);
    });

    it("converts a 2.54cm square tin to 1 square inch", () => {
        expect(
            tinArea({ ...baseYield, tinShape: "square", tinUnit: "centimetre", tinSize: "2.54" }),
        ).toBeCloseTo(1);
    });
    it("converts a 5inch square tin to 25 square inch", () => {
        expect(tinArea({ ...baseYield, tinShape: "square", tinUnit: "inch", tinSize: "5" })).toBe(
            25,
        );
    });

    it("converts a 2.54cm by 5.08cm rectangle tin to 2 square inch", () => {
        expect(
            tinArea({
                ...baseYield,
                tinShape: "rectangle",
                tinUnit: "centimetre",
                tinSize: "2.54",
                tinWidth: "5.08",
            }),
        ).toBeCloseTo(2);
    });
    it("converts a 10inch by 8inch rectangle tin to 80 square inch", () => {
        expect(
            tinArea({
                ...baseYield,
                tinShape: "rectangle",
                tinUnit: "inch",
                tinSize: "10",
                tinWidth: "8",
            }),
        ).toBe(80);
    });
});

describe("scaleFactor", () => {
    it("converts when neither recipe has a tin", () => {
        expect(scaleFactor(baseYield, targetYield)).toBe(5);
    });
    it("converts when both recipes have a tin, same yield", () => {
        expect(
            scaleFactor(
                { ...baseYield, tinShape: "round", tinSize: "8" },
                { ...targetYield, yieldQuantity: "1", tinShape: "round", tinSize: "16" },
            ),
        ).toBeCloseTo(4);
    });
    it("converts when different tin size and yield", () => {
        expect(
            scaleFactor(
                { ...baseYield, tinShape: "round", tinSize: "8" },
                { ...targetYield, yieldQuantity: "2", tinShape: "round", tinSize: "16" },
            ),
        ).toBeCloseTo(8);
    });
    it("converts when tins are different shapes and units", () => {
        expect(
            scaleFactor(
                { ...baseYield, tinShape: "square", tinUnit: "centimetre", tinSize: "2.54" },
                {
                    ...targetYield,
                    yieldQuantity: "1",
                    tinShape: "rectangle",
                    tinUnit: "inch",
                    tinSize: "2",
                    tinWidth: "3",
                },
            ),
        ).toBeCloseTo(6);
    });
    it("converts when yields are in different units", () => {
        expect(
            scaleFactor(
                { ...baseYield, yieldQuantity: "1", yieldUnit: "kilogram" },
                { ...targetYield, yieldQuantity: "500", yieldUnit: "gram" },
            ),
        ).toBe(0.5);
    });
    it("ignores tin when base tin size is blank", () => {
        expect(
            scaleFactor(
                { ...baseYield, tinShape: "round", tinSize: "" },
                { ...targetYield, tinShape: "round", tinSize: "16" },
            ),
        ).toBe(5);
    });
    it("ignores tin when target tin size is blank", () => {
        expect(
            scaleFactor(
                { ...baseYield, tinShape: "round", tinSize: "8" },
                { ...targetYield, tinShape: "round", tinSize: "" },
            ),
        ).toBe(5);
    });
    it("ignores tin when rectangle tin width is blank", () => {
        expect(
            scaleFactor(
                { ...baseYield, tinShape: "rectangle", tinSize: "10", tinWidth: "8" },
                { ...targetYield, tinShape: "rectangle", tinSize: "10", tinWidth: "" },
            ),
        ).toBe(5);
    });
    it("converts when only base has a tin, different yields, should ignore tin and just multiply by yield", () => {
        expect(scaleFactor({ ...baseYield, tinShape: "round", tinSize: "8" }, targetYield)).toBe(5);
    });
    it("converts when only target has a tin, different yields, should ignore tin and just multiply by yield", () => {
        expect(
            scaleFactor(baseYield, {
                ...targetYield,
                yieldQuantity: "2",
                tinShape: "round",
                tinSize: "16",
            }),
        ).toBe(2);
    });
    it.each(["", "-2", "abc"])("returns 1 when target quantity is %j", (yieldQuantity) => {
        expect(scaleFactor(baseYield, { ...targetYield, yieldQuantity })).toBe(1);
    });
    it("returns 1 when base quantity is 0", () => {
        expect(scaleFactor({ ...baseYield, yieldQuantity: "0" }, targetYield)).toBe(1);
    });
});

const recipe = (id: number, componentIds: number[] = []): ExistingRecipe => ({
    ...baseYield,
    id,
    name: `Recipe ${id}`,
    sellingPrice: "",
    description: "",
    ingredients: [],
    components: componentIds.map((componentId) => ({ componentId, quantity: "1", unit: "item" })),
    steps: [],
    isUsedAsComponent: false,
    cost: 0,
});

describe("containsRecipe", () => {
    it("returns false when recipe has no components", () => {
        expect(containsRecipe(recipe(1), 2, [recipe(1), recipe(2)])).toBe(false);
    });
    it("returns true when target is a direct component", () => {
        expect(containsRecipe(recipe(1, [2]), 2, [recipe(1, [2]), recipe(2)])).toBe(true);
    });
    it("returns true when target is nested two levels deep", () => {
        const recipes = [recipe(1, [2]), recipe(2, [3]), recipe(3)];
        expect(containsRecipe(recipes[0], 3, recipes)).toBe(true);
    });
    it("returns false when target is not anywhere in the tree", () => {
        const recipes = [recipe(1, [2]), recipe(2, [3]), recipe(3), recipe(4)];
        expect(containsRecipe(recipes[0], 4, recipes)).toBe(false);
    });
    it("returns false when a component is missing from recipes", () => {
        expect(containsRecipe(recipe(1, [9]), 2, [recipe(1, [9]), recipe(2)])).toBe(false);
    });
    it("returns false without looping forever when recipes form a cycle", () => {
        const recipes = [recipe(1, [2]), recipe(2, [1]), recipe(3)];
        expect(containsRecipe(recipes[0], 3, recipes)).toBe(false);
    });
    it("returns false when two branches share a component that doesn't contain the target", () => {
        const recipes = [recipe(1, [2, 3]), recipe(2, [4]), recipe(3, [4]), recipe(4), recipe(5)];
        expect(containsRecipe(recipes[0], 5, recipes)).toBe(false);
    });
    it("returns true when target is only under the second branch", () => {
        const recipes = [recipe(1, [2, 3]), recipe(2, [4]), recipe(3, [5]), recipe(4), recipe(5)];
        expect(containsRecipe(recipes[0], 5, recipes)).toBe(true);
    });
});

const usingIngredient = (id: number, ingredientIds: number[]): ExistingRecipe => ({
    ...recipe(id),
    ingredients: ingredientIds.map((ingredientId) => ({
        ingredientId,
        quantity: "1",
        unit: "gram",
    })),
});

describe("recipesUsingIngredient", () => {
    it("returns only the recipes that use the ingredient", () => {
        const recipes = [
            usingIngredient(1, [7]),
            usingIngredient(2, [8]),
            usingIngredient(3, [8, 7]),
        ];
        expect(recipesUsingIngredient(7, recipes).map((r) => r.id)).toEqual([1, 3]);
    });
    it("returns an empty list when no recipe uses the ingredient", () => {
        expect(recipesUsingIngredient(7, [usingIngredient(1, [8])])).toEqual([]);
    });
    it("matches on ingredient id, not recipe id", () => {
        expect(recipesUsingIngredient(7, [usingIngredient(7, [8])])).toEqual([]);
    });
});

describe("recipesUsingComponent", () => {
    it("returns only the recipes that use the component", () => {
        const recipes = [recipe(1, [4]), recipe(2, [5]), recipe(3, [5, 4]), recipe(4)];
        expect(recipesUsingComponent(4, recipes).map((r) => r.id)).toEqual([1, 3]);
    });
    it("returns an empty list when no recipe uses the component", () => {
        expect(recipesUsingComponent(4, [recipe(1, [5]), recipe(4)])).toEqual([]);
    });
    it("only returns direct parents, not grandparents", () => {
        const recipes = [recipe(1, [2]), recipe(2, [3]), recipe(3)];
        expect(recipesUsingComponent(3, recipes).map((r) => r.id)).toEqual([2]);
    });
});

const sortedIds = (recipes: ExistingRecipe[]) => recipes.map((r) => r.id).sort((a, b) => a - b);

describe("withParentRecipes", () => {
    it("returns an empty list when start is empty", () => {
        expect(withParentRecipes([], [recipe(1, [2]), recipe(2)])).toEqual([]);
    });
    it("returns only the start recipes when they have no parents", () => {
        const recipes = [recipe(1), recipe(2, [3]), recipe(3)];
        expect(sortedIds(withParentRecipes([recipes[0]], recipes))).toEqual([1]);
    });
    it("walks up every level of parents", () => {
        const recipes = [recipe(1, [2]), recipe(2, [3]), recipe(3)];
        expect(sortedIds(withParentRecipes([recipes[2]], recipes))).toEqual([1, 2, 3]);
    });
    it("includes a parent reached by two paths only once", () => {
        const recipes = [recipe(1, [2, 3]), recipe(2, [4]), recipe(3, [4]), recipe(4)];
        expect(sortedIds(withParentRecipes([recipes[3]], recipes))).toEqual([1, 2, 3, 4]);
    });
    it("includes a start recipe that is also a parent only once", () => {
        const recipes = [recipe(2, [3]), recipe(3)];
        expect(sortedIds(withParentRecipes(recipes, recipes))).toEqual([2, 3]);
    });
    it("stops without looping forever when recipes form a cycle", () => {
        const recipes = [recipe(1, [2]), recipe(2, [1])];
        expect(sortedIds(withParentRecipes([recipes[0]], recipes))).toEqual([1, 2]);
    });
});

const ingredient = (
    id: number,
    price: string,
    packSize: string,
    ingredientUnit: IngredientUnit,
): ExistingIngredient => ({
    id,
    name: `Ingredient ${id}`,
    price,
    packSize,
    ingredientUnit,
    isUsedInRecipe: false,
});

const flour = ingredient(1, "1.50", "1", "kilogram");
const butter = ingredient(2, "2", "250", "gram");
const poundEach = ingredient(3, "1", "1", "item");
const ingredients = [flour, butter, poundEach];

const costing = (r: ExistingRecipe, pounds: string): ExistingRecipe => ({
    ...r,
    ingredients: [{ ingredientId: poundEach.id, quantity: pounds, unit: "item" }],
});

describe("recipeCost", () => {
    it("returns 0 for a recipe with no ingredients or components", () => {
        expect(recipeCost(recipe(1), [], ingredients)).toBe(0);
    });
    it("sums ingredient costs, converting to each ingredient's pack unit", () => {
        const r: ExistingRecipe = {
            ...recipe(1),
            ingredients: [
                { ingredientId: flour.id, quantity: "300", unit: "gram" },
                { ingredientId: butter.id, quantity: "100", unit: "gram" },
            ],
        };
        expect(recipeCost(r, [r], ingredients)).toBeCloseTo(1.25);
    });
    it("skips ingredients that don't exist", () => {
        const r: ExistingRecipe = {
            ...recipe(1),
            ingredients: [
                { ingredientId: flour.id, quantity: "300", unit: "gram" },
                { ingredientId: 9, quantity: "100", unit: "gram" },
            ],
        };
        expect(recipeCost(r, [r], ingredients)).toBeCloseTo(0.45);
    });
    it("adds the share of a component's cost that is used", () => {
        const component: ExistingRecipe = {
            ...costing(recipe(2), "4"),
            yieldQuantity: "800",
            yieldUnit: "gram",
        };
        const parent: ExistingRecipe = {
            ...recipe(1),
            ingredients: [{ ingredientId: flour.id, quantity: "300", unit: "gram" }],
            components: [{ componentId: 2, quantity: "200", unit: "gram" }],
        };
        expect(recipeCost(parent, [parent, component], ingredients)).toBeCloseTo(1.45);
    });
    it("multiplies the shares of nested components", () => {
        const recipes: ExistingRecipe[] = [
            { ...recipe(1), components: [{ componentId: 2, quantity: "0.5", unit: "item" }] },
            { ...recipe(2), components: [{ componentId: 3, quantity: "0.5", unit: "item" }] },
            costing(recipe(3), "8"),
        ];
        expect(recipeCost(recipes[0], recipes, ingredients)).toBeCloseTo(2);
    });
    it("skips components that don't exist", () => {
        const r = costing(recipe(1, [9]), "2");
        expect(recipeCost(r, [r], ingredients)).toBeCloseTo(2);
    });
    it("costs a component once for every branch that uses it", () => {
        const recipes = [
            recipe(1, [2, 3]),
            recipe(2, [4]),
            recipe(3, [4]),
            costing(recipe(4), "1"),
        ];
        expect(recipeCost(recipes[0], recipes, ingredients)).toBeCloseTo(2);
    });
    it("doesn't count the recipe inside itself when seeded in visited", () => {
        const recipes = [costing(recipe(1, [2]), "1"), costing(recipe(2, [1]), "3")];
        expect(recipeCost(recipes[0], recipes, ingredients, new Set([1]))).toBeCloseTo(4);
    });
    it("returns a finite cost without looping forever when recipes form a cycle", () => {
        const recipes = [costing(recipe(1, [2]), "1"), costing(recipe(2, [1]), "3")];
        expect(Number.isFinite(recipeCost(recipes[0], recipes, ingredients))).toBe(true);
    });
});

const pricedAt = (price: string) => [ingredient(poundEach.id, price, "1", "item")];

describe("costChanges", () => {
    it("reports a recipe whose cost goes up", () => {
        const r: ExistingRecipe = {
            ...recipe(1),
            ingredients: [{ ingredientId: flour.id, quantity: "300", unit: "gram" }],
        };
        const dearerFlour = ingredient(flour.id, "3", "1", "kilogram");
        const changes = costChanges(
            [r],
            { recipes: [r], ingredients },
            { recipes: [r], ingredients: [dearerFlour] },
        );
        expect(changes).toHaveLength(1);
        expect(changes[0].recipe).toBe(r);
        expect(changes[0].before).toBeCloseTo(0.45);
        expect(changes[0].after).toBeCloseTo(0.9);
    });
    it("reports a recipe whose cost goes down", () => {
        const r = costing(recipe(1), "1");
        const changes = costChanges(
            [r],
            { recipes: [r], ingredients: pricedAt("2") },
            { recipes: [r], ingredients: pricedAt("1") },
        );
        expect(changes.map((c) => [c.before, c.after])).toEqual([[2, 1]]);
    });
    it("returns nothing when the cost doesn't change", () => {
        const r = costing(recipe(1), "1");
        const renamed = { ...r, name: "Renamed" };
        expect(
            costChanges([r], { recipes: [r], ingredients }, { recipes: [renamed], ingredients }),
        ).toEqual([]);
    });
    it("returns nothing when the cost moves but displays as the same pennies", () => {
        const r = costing(recipe(1), "1");
        expect(
            costChanges(
                [r],
                { recipes: [r], ingredients: pricedAt("0.4451") },
                { recipes: [r], ingredients: pricedAt("0.4549") },
            ),
        ).toEqual([]);
    });
    it("reports a tiny move that changes the displayed pennies", () => {
        const r = costing(recipe(1), "1");
        expect(
            costChanges(
                [r],
                { recipes: [r], ingredients: pricedAt("0.4449") },
                { recipes: [r], ingredients: pricedAt("0.4451") },
            ),
        ).toHaveLength(1);
    });
    it("reports a parent whose component's ingredient changed", () => {
        const recipes = [recipe(1, [2]), costing(recipe(2), "1")];
        const changes = costChanges(
            [recipes[0]],
            { recipes, ingredients: pricedAt("1") },
            { recipes, ingredients: pricedAt("2") },
        );
        expect(changes.map((c) => [c.recipe.id, c.before, c.after])).toEqual([[1, 1, 2]]);
    });
    it("uses the edited version of the recipe for the after cost", () => {
        const original = costing(recipe(1), "1");
        const edited = costing(recipe(1), "3");
        const changes = costChanges(
            [original],
            { recipes: [original], ingredients },
            { recipes: [edited], ingredients },
        );
        expect(changes.map((c) => [c.before, c.after])).toEqual([[1, 3]]);
    });
    it("returns nothing when no recipes are affected", () => {
        const inputs = { recipes: [recipe(1)], ingredients };
        expect(costChanges([], inputs, inputs)).toEqual([]);
    });
});
