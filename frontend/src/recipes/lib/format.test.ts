import { describe, expect, it } from "vitest";
import {
    amountLabel,
    describeTin,
    describeYield,
    formatAmount,
    formatGBP,
    formatQuantity,
    yieldUnitLabel,
} from "./format";
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

describe("formatGBP", () => {
    it.each([
        { value: 2.5, expected: "£2.50", why: "pads to two decimal places" },
        { value: -3, expected: "-£3.00", why: "margins can be negative" },
        { value: 0, expected: "£0.00", why: "zero still gets two decimals" },
        { value: 12360, expected: "£12,360.00", why: "separates thousands" },
        { value: 2.5672, expected: "£2.57", why: "rounds to pennies" },
    ])("formats $value as $expected ($why)", ({ value, expected }) => {
        expect(formatGBP(value)).toBe(expected);
    });
});

describe("formatQuantity", () => {
    it("drops decimals for amounts of 100 or more", () => {
        expect(formatQuantity(156.25)).toBe("156");
    });

    it("keeps one decimal between 10 and 100", () => {
        expect(formatQuantity(12.34)).toBe("12.3");
    });

    it("keeps two decimals under 10", () => {
        expect(formatQuantity(2.25)).toBe("2.25");
    });

    it("removes trailing zeros", () => {
        expect(formatQuantity(1.5)).toBe("1.5");
    });

    it("works at exactly 100", () => {
        expect(formatQuantity(100)).toBe("100");
    });

    it("works at exactly 10", () => {
        expect(formatQuantity(10)).toBe("10");
    });
});

describe("formatAmount", () => {
    it.each([
        { value: 80, unit: "gram", expected: "80g" },
        { value: 2620, unit: "gram", expected: "2.62kg" },
        { value: 999.5, unit: "gram", expected: "1kg" },
        { value: 2.9, unit: "kilogram", expected: "2.9kg" },
        { value: 0.892, unit: "kilogram", expected: "892g" },
        { value: 0.0025, unit: "kilogram", expected: "2.5g" },
        { value: 999, unit: "millilitre", expected: "999ml" },
        { value: 1000, unit: "millilitre", expected: "1L" },
        { value: 1.62, unit: "litre", expected: "1.62L" },
        { value: 0.205, unit: "litre", expected: "205ml" },
    ] as const)("formats $value $unit as $expected", ({ value, unit, expected }) => {
        expect(formatAmount(value, unit)).toBe(expected);
    });
});

describe("yieldUnitLabel", () => {
    it("returns 'batch' if unit is item and label is blank", () => {
        expect(yieldUnitLabel(baseYield)).toBe("batch");
    });
    it("returns 'loaf' if unit is item and label is set to 'loaf'", () => {
        expect(yieldUnitLabel({ ...baseYield, yieldLabel: "loaf" })).toBe("loaf");
    });

    it.each([
        { yieldUnit: "gram", expected: "g" },
        { yieldUnit: "millilitre", expected: "ml" },
        { yieldUnit: "kilogram", expected: "kg" },
        { yieldUnit: "litre", expected: "L" },
    ] as const)("shortens $yieldUnit to $expected", ({ yieldUnit, expected }) => {
        expect(yieldUnitLabel({ ...baseYield, yieldUnit })).toBe(expected);
    });
});

describe("amountLabel", () => {
    it.each([
        { value: 150, unit: "gram", expected: "150g" },
        { value: 2.652, unit: "kilogram", expected: "2.65kg" },
        { value: 550, unit: "millilitre", expected: "550ml" },
        { value: 1.59, unit: "litre", expected: "1.59L" },
    ] as const)("labels $value $unit as $expected", ({ value, unit, expected }) => {
        expect(amountLabel(value, unit)).toBe(expected);
    });

    it("labels items correctly without label", () => {
        expect(amountLabel(5, "item")).toBe("5");
    });
    it("labels items correctly with label", () => {
        expect(amountLabel(7.625, "item", { ...baseYield, yieldLabel: "loaf" })).toBe("7.63 loaf");
    });
});

describe("describeTin", () => {
    it("describes square tin in cm correctly", () => {
        expect(
            describeTin({ ...baseYield, tinUnit: "centimetre", tinShape: "square", tinSize: "12" }),
        ).toBe("12 cm square tin");
    });
    it("describes square tin in inches correctly", () => {
        expect(
            describeTin({ ...baseYield, tinUnit: "inch", tinShape: "square", tinSize: "12" }),
        ).toBe("12 inch square tin");
    });

    it("describes rectangular tin in cm correctly", () => {
        expect(
            describeTin({
                ...baseYield,
                tinUnit: "centimetre",
                tinShape: "rectangle",
                tinSize: "12",
                tinWidth: "10",
            }),
        ).toBe("12 cm × 10 cm rectangle tin");
    });
    it("describes rectangular tin in inches correctly", () => {
        expect(
            describeTin({
                ...baseYield,
                tinUnit: "inch",
                tinShape: "rectangle",
                tinSize: "5",
                tinWidth: "8",
            }),
        ).toBe("5 inch × 8 inch rectangle tin");
    });

    it("describes round tin in inches correctly", () => {
        expect(
            describeTin({ ...baseYield, tinUnit: "inch", tinShape: "round", tinSize: "8" }),
        ).toBe("8 inch round tin");
    });
    it("describes round tin in cm correctly", () => {
        expect(
            describeTin({ ...baseYield, tinUnit: "centimetre", tinShape: "round", tinSize: "6" }),
        ).toBe("6 cm round tin");
    });
});

describe("describeYield", () => {
    it("singular item test with no label", () => {
        expect(describeYield(baseYield)).toBe("Makes 1 item");
    });
    it("plural item test with no label", () => {
        expect(describeYield({ ...baseYield, yieldQuantity: "2" })).toBe("Makes 2 items");
    });

    it("singular item test with label as 'loaf'", () => {
        expect(describeYield({ ...baseYield, yieldLabel: "loaf" })).toBe("Makes 1 loaf");
    });
    it("plural item test with label as 'loaf'", () => {
        expect(describeYield({ ...baseYield, yieldLabel: "loaf", yieldQuantity: "2" })).toBe(
            "Makes 2 loaf",
        );
    });

    it("turns gram into just g with no space, no tin involved", () => {
        expect(describeYield({ ...baseYield, yieldUnit: "gram", yieldQuantity: "180" })).toBe(
            "Makes 180g",
        );
    });

    it("turns gram into just g with no space, no tin involved, big number", () => {
        expect(describeYield({ ...baseYield, yieldUnit: "gram", yieldQuantity: "5698" })).toBe(
            "Makes 5698g",
        );
    });

    it("describes a singular unlabeled tin bake correctly", () => {
        expect(
            describeYield({
                ...baseYield,
                tinShape: "round",
                tinSize: "10",
                tinUnit: "centimetre",
            }),
        ).toBe("Makes 1 item · 10 cm round tin");
    });

    it("describes plural unlabeled tin bake correctly", () => {
        expect(
            describeYield({
                ...baseYield,
                tinShape: "round",
                tinSize: "10",
                tinUnit: "centimetre",
                yieldQuantity: "3",
            }),
        ).toBe("Makes 3 items · 10 cm round tin");
    });

    it("describes plural labeled tin bake correctly", () => {
        expect(
            describeYield({
                ...baseYield,
                tinShape: "round",
                tinSize: "10",
                tinUnit: "centimetre",
                yieldQuantity: "3",
                yieldLabel: "layers",
            }),
        ).toBe("Makes 3 layers · 10 cm round tin");
    });
});
