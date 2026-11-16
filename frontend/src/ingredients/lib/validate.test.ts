import { describe, expect, it } from "vitest";
import type { NewIngredient } from "../../types/Ingredient";
import { validateIngredient } from "./validate";

const flour: NewIngredient = {
    name: "Flour",
    price: "1.50",
    packSize: "1",
    ingredientUnit: "kilogram",
};

describe("validateIngredient", () => {
    it("accepts a valid ingredient", () => {
        expect(validateIngredient(flour)).toEqual({});
    });

    it.each(["", "   "])("requires a name (%j)", (name) => {
        expect(validateIngredient({ ...flour, name })).toEqual({ name: "Name is required" });
    });

    describe.each([
        { field: "price", label: "Price" },
        { field: "packSize", label: "Pack size" },
    ] as const)("$label", ({ field, label }) => {
        it.each([
            { value: "", error: "is required" },
            { value: "   ", error: "is required" },
            { value: "abc", error: "must be a number" },
            { value: "1.", error: "must be a number" },
            { value: "1e3", error: "must be a number" },
            { value: "Infinity", error: "must be a number" },
            { value: " 5", error: "must be a number" },
            { value: "0", error: "must be greater than 0" },
            { value: "-1", error: "must be greater than 0" },
            { value: "1.23456", error: "must not have more than 4 decimal places" },
        ])("rejects $value: $error", ({ value, error }) => {
            expect(validateIngredient({ ...flour, [field]: value })).toEqual({
                [field]: `${label} ${error}`,
            });
        });

        it("accepts 4 decimal places", () => {
            expect(validateIngredient({ ...flour, [field]: "1.2345" })).toEqual({});
        });
    });

    it("rejects a unit price over the cap and suggests the smaller unit", () => {
        expect(validateIngredient({ ...flour, price: "1000" })).toEqual({
            price: "That's £1,000.00 per kg. Prices over £999.00 per unit are usually a typo, or try entering it per g.",
        });
    });

    it("accepts a unit price at the cap", () => {
        expect(validateIngredient({ ...flour, price: "999" })).toEqual({});
    });

    it("doesn't suggest a smaller unit for items", () => {
        expect(validateIngredient({ ...flour, price: "1000", ingredientUnit: "item" })).toEqual({
            price: "That's £1,000.00 per item. Prices over £999.00 per unit are usually a typo.",
        });
    });

    it("reports every problem at once", () => {
        expect(validateIngredient({ ...flour, name: "", price: "" })).toEqual({
            name: "Name is required",
            price: "Price is required",
        });
    });
});
