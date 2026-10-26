import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, Link2 } from "lucide-react";
import type { ExistingRecipe } from "../types/Recipe";

function UsedInRecipes({ recipes }: { recipes: ExistingRecipe[] }) {
    const [open, setOpen] = useState(false);
    if (recipes.length === 0) return null;

    return (
        <div className="mb-4">
            <button
                type="button"
                aria-expanded={open}
                className="flex items-center gap-1 rounded-full border border-border/60 bg-background px-3 py-1 text-sm text-header hover:border-primary"
                onClick={() => setOpen((prev) => !prev)}
            >
                <Link2 className="h-4 w-4" />
                Used in {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}
                {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            {open && (
                <ul className="mt-2 max-h-48 overflow-y-auto rounded-2xl border border-border/40 bg-surface py-1">
                    {recipes.map((r) => (
                        <li key={r.id}>
                            <Link
                                to={`/recipes/${r.id}`}
                                className="block truncate px-4 py-1.5 hover:bg-background hover:text-primary"
                            >
                                {r.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default UsedInRecipes;
