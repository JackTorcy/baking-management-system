import { describe, expect, it } from "vitest";
import { formatGBP, formatQuantity } from "./format";

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
});

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
