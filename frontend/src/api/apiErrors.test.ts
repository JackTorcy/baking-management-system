import { describe, expect, it } from "vitest";
import { apiErrorMessages } from "./apiErrors";

const somethingWentWrong = ["Something went wrong. Please try again."];

describe("apiErrorMessages", () => {
    it("returns the session expired message for 401", async () => {
        const res = new Response("", { status: 401 });
        expect(await apiErrorMessages(res)).toEqual(["Your session has expired. Log in again."]);
    });
    it.each([403, 404, 500])("hides the body of a %i response", async (status) => {
        const res = new Response("System.NullReferenceException at RecipeService.Save", {
            status,
        });
        expect(await apiErrorMessages(res)).toEqual(somethingWentWrong);
    });
    it("returns a JSON string message", async () => {
        const res = new Response(JSON.stringify("Name already taken"), { status: 400 });
        expect(await apiErrorMessages(res)).toEqual(["Name already taken"]);
    });
    it("returns a JSON array of messages from a 409", async () => {
        const res = new Response(JSON.stringify(["One", "Two"]), { status: 409 });
        expect(await apiErrorMessages(res)).toEqual(["One", "Two"]);
    });
    it("flattens validation errors from every field", async () => {
        const body = { errors: { Name: ["Required"], Price: ["Too low", "Too many decimals"] } };
        const res = new Response(JSON.stringify(body), { status: 400 });
        expect(await apiErrorMessages(res)).toEqual(["Required", "Too low", "Too many decimals"]);
    });
    it("hides JSON it doesn't recognise", async () => {
        const res = new Response(JSON.stringify({ title: "Bad Request" }), { status: 400 });
        expect(await apiErrorMessages(res)).toEqual(somethingWentWrong);
    });
    it("returns a plain text message", async () => {
        const res = new Response("Recipe not found", { status: 400 });
        expect(await apiErrorMessages(res)).toEqual(["Recipe not found"]);
    });
    it("falls back to the generic message for an empty body", async () => {
        const res = new Response("", { status: 400 });
        expect(await apiErrorMessages(res)).toEqual(somethingWentWrong);
    });
});
