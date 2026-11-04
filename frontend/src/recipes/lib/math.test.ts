import { describe, expect, it } from "vitest";
import { scaleFactor, tinArea, yieldFraction } from "./math";
import type { RecipeYield } from "../../types/Recipe";

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
    it("shows correct fraction when both units are gram", () => {
        expect(
            yieldFraction(
                { ...baseYield, yieldQuantity: "1000", yieldUnit: "gram" },
                "300",
                "gram",
            ),
        ).toBe(0.3);
    });
    it("shows correct fraction when both units are litre", () => {
        expect(
            yieldFraction({ ...baseYield, yieldQuantity: "2", yieldUnit: "litre" }, "0.4", "litre"),
        ).toBe(0.2);
    });

    it("shows correct fraction when both units are items", () => {
        expect(
            yieldFraction({ ...baseYield, yieldQuantity: "16", yieldUnit: "item" }, "12", "item"),
        ).toBe(0.75);
    });

    it("shows correct fraction when recipe is kilogram and passed in is gram", () => {
        expect(
            yieldFraction(
                { ...baseYield, yieldQuantity: "3", yieldUnit: "kilogram" },
                "1800",
                "gram",
            ),
        ).toBe(0.6);
    });
    it("shows correct fraction when recipe is gram and passed in is kilogram", () => {
        expect(
            yieldFraction(
                { ...baseYield, yieldQuantity: "600", yieldUnit: "gram" },
                "0.3",
                "kilogram",
            ),
        ).toBe(0.5);
    });

    it("shows correct fraction when recipe is litre and passed in is millilitre", () => {
        expect(
            yieldFraction(
                { ...baseYield, yieldQuantity: "3", yieldUnit: "litre" },
                "1800",
                "millilitre",
            ),
        ).toBe(0.6);
    });
    it("shows correct fraction when recipe is millilitre and passed in is litre", () => {
        expect(
            yieldFraction(
                { ...baseYield, yieldQuantity: "600", yieldUnit: "millilitre" },
                "0.3",
                "litre",
            ),
        ).toBe(0.5);
    });
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
        ).toBe(4);
    });
    it("converts when different tin size and yield", () => {
        expect(
            scaleFactor(
                { ...baseYield, tinShape: "round", tinSize: "8" },
                { ...targetYield, yieldQuantity: "2", tinShape: "round", tinSize: "16" },
            ),
        ).toBe(8);
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
    it("converts when target quantity is 0", () => {
        expect(
            scaleFactor(baseYield, {
                ...targetYield,
                yieldQuantity: "",
            }),
        ).toBe(1);
    });
    it("converts when base quantity is 0", () => {
        expect(scaleFactor({ ...baseYield, yieldQuantity: "0" }, targetYield)).toBe(1);
    });
});
