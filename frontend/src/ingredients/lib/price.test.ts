import { describe, expect, it } from "vitest";
import { formatUnitPrice, pricePer } from "./price";

describe("pricePer", () => {
    it.each([
        { packSize: "250", ingredientUnit: "gram", price: "2", per: "gram", expected: 0.008 },
        { packSize: "1", ingredientUnit: "kilogram", price: "1.50", per: "gram", expected: 0.0015 },
        { packSize: "250", ingredientUnit: "gram", price: "2", per: "kilogram", expected: 8 },
        {
            packSize: "2",
            ingredientUnit: "litre",
            price: "1.20",
            per: "millilitre",
            expected: 0.0006,
        },
        { packSize: "12", ingredientUnit: "item", price: "3", per: "item", expected: 0.25 },
        {
            packSize: "1.5",
            ingredientUnit: "kilogram",
            price: "4.50",
            per: "kilogram",
            expected: 3,
        },
    ] as const)(
        "£$price for $packSize $ingredientUnit costs $expected per $per",
        ({ packSize, ingredientUnit, price, per, expected }) => {
            // Default precision is 2dp, which would pass 0.0015 against 0
            expect(pricePer({ name: "", price, packSize, ingredientUnit }, per)).toBeCloseTo(
                expected,
                6,
            );
        },
    );
});

describe("formatUnitPrice", () => {
    it.each([
        { value: 8, expected: "£8.00", why: "pads to two decimal places" },
        { value: 0.25, expected: "£0.25", why: "ordinary pennies" },
        { value: 0.008, expected: "£0.008", why: "shows a third place without padding to four" },
        { value: 0.0015, expected: "£0.0015", why: "keeps per-gram prices visible" },
        { value: 0.00012345, expected: "£0.0001", why: "rounds at four places" },
    ])("formats $value as $expected ($why)", ({ value, expected }) => {
        expect(formatUnitPrice(value)).toBe(expected);
    });
});
