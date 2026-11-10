import { describe, expect, it } from "vitest";
import { amountLeft, decimalPattern, newStep, toFormRecipe, toSaveRecipe } from "./form";
import type { IngredientUnit } from "../../types/Ingredient";
import type { ExistingRecipe, RecipeResponse } from "../../types/Recipe";

const response = (overrides: Partial<RecipeResponse> = {}): RecipeResponse => ({
    id: 1,
    name: "Victoria sponge",
    sellingPrice: "12.50",
    description: "Classic",
    yieldQuantity: 800,
    yieldUnit: "gram",
    yieldLabel: "cake",
    tinShape: "rectangle",
    tinSize: 10,
    tinWidth: 8,
    tinUnit: "centimetre",
    isUsedAsComponent: false,
    cost: 3.2,
    ingredients: [{ ingredientId: 2, quantity: 250.5, unit: "gram" }],
    components: [{ componentId: 3, quantity: 2, unit: "item" }],
    steps: [
        {
            id: 7,
            instruction: "Mix",
            ingredients: [{ ingredientId: 2, quantity: 100, unit: "gram" }],
            components: [{ componentId: 3, quantity: 1, unit: "item" }],
        },
    ],
    ...overrides,
});

describe("newStep", () => {
    it("returns an empty step with no id", () => {
        expect(newStep()).toEqual({
            id: null,
            key: expect.any(String),
            instruction: "",
            ingredients: [],
            components: [],
        });
    });
    it("gives each step a different key", () => {
        expect(newStep().key).not.toBe(newStep().key);
    });
});

describe("toFormRecipe", () => {
    it("converts every number to a string and keys steps by id", () => {
        expect(toFormRecipe(response())).toEqual({
            id: 1,
            name: "Victoria sponge",
            sellingPrice: "12.50",
            description: "Classic",
            yieldQuantity: "800",
            yieldUnit: "gram",
            yieldLabel: "cake",
            tinShape: "rectangle",
            tinSize: "10",
            tinWidth: "8",
            tinUnit: "centimetre",
            isUsedAsComponent: false,
            cost: 3.2,
            ingredients: [{ ingredientId: 2, quantity: "250.5", unit: "gram" }],
            components: [{ componentId: 3, quantity: "2", unit: "item" }],
            steps: [
                {
                    id: 7,
                    key: "7",
                    instruction: "Mix",
                    ingredients: [{ ingredientId: 2, quantity: "100", unit: "gram" }],
                    components: [{ componentId: 3, quantity: "1", unit: "item" }],
                },
            ],
        });
    });
    it("turns a missing selling price into an empty string", () => {
        expect(toFormRecipe(response({ sellingPrice: null })).sellingPrice).toBe("");
    });
    it("turns missing tin dimensions into empty strings", () => {
        const recipe = toFormRecipe(response({ tinShape: null, tinSize: null, tinWidth: null }));
        expect([recipe.tinSize, recipe.tinWidth]).toEqual(["", ""]);
    });
    it("defaults a missing tin unit to inch", () => {
        expect(toFormRecipe(response({ tinUnit: null })).tinUnit).toBe("inch");
    });
});

const formRecipe = (overrides: Partial<ExistingRecipe> = {}): ExistingRecipe => ({
    id: 1,
    name: "Victoria sponge",
    sellingPrice: "12.50",
    description: "Classic",
    yieldQuantity: "800",
    yieldUnit: "gram",
    yieldLabel: "cake",
    tinShape: "rectangle",
    tinSize: "10",
    tinWidth: "8",
    tinUnit: "centimetre",
    isUsedAsComponent: false,
    cost: 3.2,
    ingredients: [{ ingredientId: 2, quantity: "250.5", unit: "gram" }],
    components: [{ componentId: 3, quantity: "2", unit: "item" }],
    steps: [
        {
            id: 7,
            key: "7",
            instruction: "Mix",
            ingredients: [{ ingredientId: 2, quantity: "100", unit: "gram" }],
            components: [{ componentId: 3, quantity: "1", unit: "item" }],
        },
    ],
    ...overrides,
});

describe("toSaveRecipe", () => {
    it("converts quantities to numbers and sends only what the API saves", () => {
        expect(toSaveRecipe(formRecipe())).toEqual({
            name: "Victoria sponge",
            sellingPrice: "12.50",
            description: "Classic",
            yieldQuantity: 800,
            yieldUnit: "gram",
            yieldLabel: "cake",
            tinShape: "rectangle",
            tinSize: 10,
            tinWidth: 8,
            tinUnit: "centimetre",
            ingredients: [{ ingredientId: 2, quantity: 250.5, unit: "gram" }],
            components: [{ componentId: 3, quantity: 2, unit: "item" }],
            steps: [
                {
                    id: 7,
                    instruction: "Mix",
                    ingredients: [{ ingredientId: 2, quantity: 100, unit: "gram" }],
                    components: [{ componentId: 3, quantity: 1, unit: "item" }],
                },
            ],
        });
    });
    it.each(["", "   "])("sends no selling price when it is %j", (sellingPrice) => {
        expect(toSaveRecipe(formRecipe({ sellingPrice })).sellingPrice).toBeNull();
    });
    it("trims the selling price", () => {
        expect(toSaveRecipe(formRecipe({ sellingPrice: " 4.50 " })).sellingPrice).toBe("4.50");
    });
    it("sends no tin dimensions when there is no tin, even if old values are left in the form", () => {
        const saved = toSaveRecipe(formRecipe({ tinShape: null }));
        expect([saved.tinSize, saved.tinWidth, saved.tinUnit]).toEqual([null, null, null]);
    });
    it.each(["round", "square"] as const)(
        "sends no width for a %s tin, even if an old width is left in the form",
        (tinShape) => {
            const saved = toSaveRecipe(formRecipe({ tinShape }));
            expect([saved.tinSize, saved.tinWidth, saved.tinUnit]).toEqual([
                10,
                null,
                "centimetre",
            ]);
        },
    );
    it("sends a null id for a new step", () => {
        const step = { ...newStep(), instruction: "Bake" };
        expect(toSaveRecipe(formRecipe({ steps: [step] })).steps[0].id).toBeNull();
    });
});

describe("decimalPattern", () => {
    it.each(["", "12", "1.5", ".5", "5.", "."])(
        "allows %j so a number can be typed through it",
        (value) => {
            expect(decimalPattern.test(value)).toBe(true);
        },
    );
    it.each(["-1", "1.2.3", "abc", "1e5", "+1", " 1", "1 ", "1,5"])("blocks %j", (value) => {
        expect(decimalPattern.test(value)).toBe(false);
    });
});

const amount = (quantity: string, unit: IngredientUnit) => ({ quantity, unit });

describe("amountLeft", () => {
    it.each([
        { line: amount("200", "gram"), used: [], expected: 200, why: "nothing used yet" },
        {
            line: amount("200", "gram"),
            used: [amount("50", "gram"), amount("100", "gram")],
            expected: 50,
            why: "steps add up",
        },
        {
            line: amount("1", "kilogram"),
            used: [amount("300", "gram"), amount("200", "gram")],
            expected: 0.5,
            why: "steps are converted into the line's unit",
        },
        {
            line: amount("500", "gram"),
            used: [amount("0.2", "kilogram")],
            expected: 300,
            why: "conversion works the other way too",
        },
        {
            line: amount("100", "gram"),
            used: [amount("150", "gram")],
            expected: -50,
            why: "over-use is negative",
        },
        {
            line: amount("0.3", "kilogram"),
            used: [amount("0.1", "kilogram"), amount("0.2", "kilogram")],
            expected: 0,
            why: "using it exactly leaves nothing",
        },
    ])("$why ($expected left)", ({ line, used, expected }) => {
        expect(amountLeft(line, used)).toBeCloseTo(expected);
    });
});
