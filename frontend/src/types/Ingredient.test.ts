import { describe, expect, it } from "vitest";
import { unitsOfKind } from "./Ingredient";

describe("unitsOfKind", () => {
    it.each([
        { kind: "weight", expected: ["kilogram", "gram"] },
        { kind: "volume", expected: ["millilitre", "litre"] },
        { kind: "count", expected: ["item"] },
    ] as const)("offers only $kind units", ({ kind, expected }) => {
        expect(unitsOfKind(kind)).toEqual(expected);
    });
});
