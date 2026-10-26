const somethingWentWrong = "Something went wrong. Please try again.";

export const networkErrorMessage = "Couldn't reach the server. Please try again.";

export const apiErrorMessages = async (res: Response): Promise<string[]> => {
    if (res.status === 401) return ["Your session has expired. Log in again."];
    // Only 400/409 carry messages written for users; other bodies can be stack traces in development
    if (res.status !== 400 && res.status !== 409) return [somethingWentWrong];

    const text = await res.text();
    try {
        const body = JSON.parse(text);
        if (typeof body === "string") return [body];
        if (Array.isArray(body)) return body;
        if (body?.errors) return Object.values(body.errors).flat() as string[];
        return [somethingWentWrong];
    } catch {
        // BadRequest("message") replies with plain text, not JSON
        return text ? [text] : [somethingWentWrong];
    }
};
