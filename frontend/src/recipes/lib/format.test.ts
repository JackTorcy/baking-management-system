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
    it("adds the pound sign and pads to two decimal places", () => {
        expect(formatGBP(2.5)).toBe("£2.50");
    });
    it("converts negative numbers, can be negative margins", () => {
        expect(formatGBP(-3)).toBe("-£3.00");
    });
    it("adds the pound sign and two decimals to a zero value", () => {
        expect(formatGBP(0)).toBe("£0.00");
    });
    it("formats thousands correctly", () => {
        expect(formatGBP(12360)).toBe("£12,360.00");
    });
    it("rounds to pennies", () => {
        expect(formatGBP(2.5672)).toBe("£2.57");
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
    it("keeps gram as gram under 1000", () => {
        expect(formatAmount(80, "gram")).toBe("80g");
    });
    it("converts gram to kilogram over 1000", () => {
        expect(formatAmount(2620, "gram")).toBe("2.62kg");
    });
    it("converts gram to kilogram at 999.5", () => {
        expect(formatAmount(999.5, "gram")).toBe("1kg");
    });
    it("keeps kilogram as kilogram over 1", () => {
        expect(formatAmount(2.9, "kilogram")).toBe("2.9kg");
    });
    it("converts kilogram to gram under 1", () => {
        expect(formatAmount(0.892, "kilogram")).toBe("892g");
    });
    it("converts kilogram to decimal gram at low quantities", () => {
        expect(formatAmount(0.0025, "kilogram")).toBe("2.5g");
    });

    it("keeps millilitre as millilitre under 1000", () => {
        expect(formatAmount(999, "millilitre")).toBe("999ml");
    });
    it("converts millilitre to litre over 1000", () => {
        expect(formatAmount(1000, "millilitre")).toBe("1L");
    });
    it("keeps litre as litre over 1", () => {
        expect(formatAmount(1.62, "litre")).toBe("1.62L");
    });
    it("converts litre to millilitre under 1", () => {
        expect(formatAmount(0.205, "litre")).toBe("205ml");
    });
});

describe("yieldUnitLabel", () => {
    it("returns 'batch' if unit is item and label is blank", () => {
        expect(yieldUnitLabel(baseYield)).toBe("batch");
    });
    it("returns 'loaf' if unit is item and label is set to 'loaf'", () => {
        expect(yieldUnitLabel({ ...baseYield, yieldLabel: "loaf" })).toBe("loaf");
    });

    it("returns the shortened measurement when unit is 'gram'", () => {
        expect(yieldUnitLabel({ ...baseYield, yieldUnit: "gram" })).toBe("g");
    });
    it("returns the shortened measurement when unit is 'millilitre'", () => {
        expect(yieldUnitLabel({ ...baseYield, yieldUnit: "millilitre" })).toBe("ml");
    });
    it("returns the shortened measurement when unit is 'kilogram'", () => {
        expect(yieldUnitLabel({ ...baseYield, yieldUnit: "kilogram" })).toBe("kg");
    });
    it("returns the shortened measurement when unit is 'litre'", () => {
        expect(yieldUnitLabel({ ...baseYield, yieldUnit: "litre" })).toBe("L");
    });
});

describe("amountLabel", () => {
    it("labels grams correctly", () => {
        expect(amountLabel(150, "gram")).toBe("150g");
    });
    it("labels kilograms correctly", () => {
        expect(amountLabel(2.652, "kilogram")).toBe("2.65kg");
    });
    it("labels millilitres correctly", () => {
        expect(amountLabel(550, "millilitre")).toBe("550ml");
    });
    it("labels litres correctly", () => {
        expect(amountLabel(1.59, "litre")).toBe("1.59L");
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
