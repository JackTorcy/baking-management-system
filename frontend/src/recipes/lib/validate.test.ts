import { describe, expect, it } from "vitest";
import type { ExistingIngredient, IngredientUnit } from "../../types/Ingredient";
import type {
    ExistingRecipe,
    NewRecipe,
    RecipeComponent,
    RecipeIngredient,
    RecipeStep,
} from "../../types/Recipe";
import { validateRecipe } from "./validate";

const flour: ExistingIngredient = {
    id: 1,
    name: "Flour",
    price: "1.50",
    packSize: "1",
    ingredientUnit: "kilogram",
    isUsedInRecipe: true,
};

const usesFlour = (quantity: string, unit: IngredientUnit = "gram"): RecipeIngredient => ({
    ingredientId: 1,
    quantity,
    unit,
});

const usesJam = (quantity: string): RecipeComponent => ({
    componentId: 2,
    quantity,
    unit: "item",
});

const step = (overrides: Partial<RecipeStep>): RecipeStep => ({
    id: null,
    key: "step",
    instruction: "Mix",
    ingredients: [],
    components: [],
    ...overrides,
});

const sponge: NewRecipe = {
    name: "Victoria sponge",
    sellingPrice: "",
    description: "A classic",
    yieldQuantity: "1",
    yieldUnit: "item",
    yieldLabel: "",
    tinShape: null,
    tinSize: "",
    tinWidth: "",
    tinUnit: "inch",
    ingredients: [usesFlour("500")],
    components: [usesJam("1")],
    steps: [step({ ingredients: [usesFlour("200")], components: [usesJam("1")] })],
};

const jam: ExistingRecipe = {
    ...sponge,
    id: 2,
    name: "Jam",
    ingredients: [],
    components: [],
    steps: [],
    isUsedAsComponent: true,
    cost: 0,
};

const validate = (overrides: Partial<NewRecipe>) =>
    validateRecipe({ ...sponge, ...overrides }, [flour], [jam]);

describe("validateRecipe", () => {
    it("accepts a valid recipe", () => {
        expect(validate({})).toEqual({});
    });

    it.each(["", "   "])("requires a name (%j)", (name) => {
        expect(validate({ name })).toEqual({ name: "Name is required" });
    });

    it.each(["", "   "])("requires a description (%j)", (description) => {
        expect(validate({ description })).toEqual({ description: "Description is required" });
    });

    describe("selling price", () => {
        it.each([
            { value: "abc", error: "must be a number" },
            { value: "1.", error: "must be a number" },
            { value: "1e3", error: "must be a number" },
            { value: "Infinity", error: "must be a number" },
            { value: "0", error: "must be greater than 0" },
            { value: "-1", error: "must be greater than 0" },
            { value: "1.234", error: "must not have more than 2 decimal places" },
        ])("rejects $value: $error", ({ value, error }) => {
            expect(validate({ sellingPrice: value })).toEqual({
                sellingPrice: `Selling price ${error}`,
            });
        });

        it.each(["", "   ", "1.23"])("accepts %j", (sellingPrice) => {
            expect(validate({ sellingPrice })).toEqual({});
        });
    });

    it.each(["", "0", "."])("requires a yield greater than 0 (%j)", (yieldQuantity) => {
        expect(validate({ yieldQuantity })).toEqual({
            yield: "How much the recipe makes must be greater than 0",
        });
    });

    describe("tin", () => {
        const tinError = { yield: "Tin size must be greater than 0" };

        it("requires a size when a tin is set", () => {
            expect(validate({ tinShape: "round", tinSize: "" })).toEqual(tinError);
        });

        it("ignores width for a round tin", () => {
            expect(validate({ tinShape: "round", tinSize: "8", tinWidth: "" })).toEqual({});
        });

        it("requires a width for a rectangle tin", () => {
            expect(validate({ tinShape: "rectangle", tinSize: "8", tinWidth: "" })).toEqual(
                tinError,
            );
        });
    });

    it.each(["", "0"])("requires ingredient quantities greater than 0 (%j)", (quantity) => {
        expect(validate({ ingredients: [usesFlour(quantity)], steps: [] })).toEqual({
            ingredients: "Ingredient quantities must all be greater than 0",
        });
    });

    it.each(["", "0"])("requires component quantities greater than 0 (%j)", (quantity) => {
        expect(validate({ components: [usesJam(quantity)], steps: [] })).toEqual({
            components: "Component quantities must all be greater than 0",
        });
    });

    describe("steps", () => {
        it("requires an instruction on every step", () => {
            expect(validate({ steps: [step({ instruction: "  " })] })).toEqual({
                steps: "Every step needs an instruction",
            });
        });

        it.each([
            { what: "ingredient", quantity: "", used: { ingredients: [usesFlour("")] } },
            { what: "ingredient", quantity: "0", used: { ingredients: [usesFlour("0")] } },
            { what: "component", quantity: "", used: { components: [usesJam("")] } },
            { what: "component", quantity: "0", used: { components: [usesJam("0")] } },
        ])("requires $what amounts greater than 0 ($quantity)", ({ used }) => {
            expect(validate({ steps: [step(used)] })).toEqual({
                steps: "Step amounts must all be greater than 0",
            });
        });

        it("rejects steps that use more of an ingredient than the recipe has", () => {
            const steps = [
                step({ ingredients: [usesFlour("300")] }),
                step({ ingredients: [usesFlour("250")] }),
            ];
            expect(validate({ steps })).toEqual({
                steps: "Steps use more Flour than the recipe has",
            });
        });

        it("accepts steps that use exactly what the recipe has", () => {
            const steps = [
                step({ ingredients: [usesFlour("300")] }),
                step({ ingredients: [usesFlour("200")] }),
            ];
            expect(validate({ steps })).toEqual({});
        });

        it.each([
            { grams: "1000", expected: {} },
            { grams: "1001", expected: { steps: "Steps use more Flour than the recipe has" } },
        ])("compares $grams g in steps against 1 kg in the recipe", ({ grams, expected }) => {
            expect(
                validate({
                    ingredients: [usesFlour("1", "kilogram")],
                    steps: [step({ ingredients: [usesFlour(grams)] })],
                }),
            ).toEqual(expected);
        });

        it("rejects steps that use more of a component than the recipe has", () => {
            expect(validate({ steps: [step({ components: [usesJam("2")] })] })).toEqual({
                steps: "Steps use more Jam than the recipe has",
            });
        });

        it("tolerates floating point error when steps add up to the recipe amount", () => {
            expect(
                validate({
                    ingredients: [usesFlour("0.3", "kilogram")],
                    steps: [
                        step({ ingredients: [usesFlour("0.1", "kilogram")] }),
                        step({ ingredients: [usesFlour("0.2", "kilogram")] }),
                    ],
                }),
            ).toEqual({});
        });
    });

    it("reports every problem at once", () => {
        expect(validate({ name: "", description: "", yieldQuantity: "" })).toEqual({
            name: "Name is required",
            description: "Description is required",
            yield: "How much the recipe makes must be greater than 0",
        });
    });
});
