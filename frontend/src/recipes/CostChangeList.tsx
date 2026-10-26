import { formatGBP, type CostChange } from "../types/Recipe";

function CostChangeList({ changes }: { changes: CostChange[] }) {
    return (
        <>
            <p className="mb-2">
                This changes the cost of {changes.length}{" "}
                {changes.length === 1 ? "recipe" : "recipes"}:
            </p>
            <ul className="divide-y divide-border/40">
                {changes.map(({ recipe, before, after }) => (
                    <li key={recipe.id} className="flex justify-between gap-3 py-1.5">
                        <span className="truncate">{recipe.name}</span>
                        <span className="shrink-0 tabular-nums">
                            {formatGBP(before)} →{" "}
                            <span
                                className={`font-semibold ${after > before ? "text-danger" : "text-success"}`}
                            >
                                {formatGBP(after)}
                            </span>
                        </span>
                    </li>
                ))}
            </ul>
        </>
    );
}

export default CostChangeList;
