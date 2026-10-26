import { unitKind, unitLabel, unitsOfKind, type IngredientUnit } from "../types/Ingredient";
import { decimalPattern } from "../types/Recipe";

interface AmountInputProps {
    name: string;
    quantity: string;
    unit: IngredientUnit;
    unitName?: (unit: IngredientUnit) => string;
    className?: string;
    onQuantityChange: (quantity: string) => void;
    onUnitChange: (unit: IngredientUnit) => void;
}

function AmountInput({
    name,
    quantity,
    unit,
    unitName = (u) => unitLabel[u],
    className = "w-28",
    onQuantityChange,
    onUnitChange,
}: AmountInputProps) {
    const unitOptions = unitsOfKind(unitKind[unit]);

    return (
        <label
            className={`flex shrink-0 items-center rounded-lg border border-border/70 bg-background px-2 py-0.5 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 ${className}`}
        >
            <input
                inputMode="decimal"
                aria-label={`Quantity of ${name}`}
                className="w-full min-w-0 bg-transparent text-right tabular-nums text-header outline-none"
                value={quantity}
                onChange={(e) => {
                    if (decimalPattern.test(e.target.value)) onQuantityChange(e.target.value);
                }}
            />
            {unitOptions.length > 1 ? (
                <select
                    aria-label={`Unit for ${name}`}
                    className="ml-1 bg-transparent text-sm text-body/70 outline-none"
                    value={unit}
                    onChange={(e) => onUnitChange(e.target.value as IngredientUnit)}
                >
                    {unitOptions.map((u) => (
                        <option key={u} value={u}>
                            {unitName(u)}
                        </option>
                    ))}
                </select>
            ) : (
                <span className="ml-1 truncate text-sm text-body/70">{unitName(unit)}</span>
            )}
        </label>
    );
}

export default AmountInput;
