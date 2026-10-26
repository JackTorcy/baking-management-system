import type { ChangeEvent } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { unitKind, unitLabel, unitsOfKind, type IngredientUnit } from "../types/Ingredient";
import {
    decimalPattern,
    formatQuantity,
    lengthUnitLabel,
    tinShapes,
    yieldUnitLabel,
    type RecipeYield,
    type TinShape,
} from "../types/Recipe";

interface RecipeScaleControlProps {
    recipe: RecipeYield;
    scaleTo: RecipeYield | null;
    scale: number;
    onChange: (scaleTo: RecipeYield | null) => void;
}

const smallInput = "border border-border bg-surface rounded-2xl py-2 px-3";

function RecipeScaleControl({ recipe, scaleTo, scale, onChange }: RecipeScaleControlProps) {
    const target = scaleTo ?? recipe;
    const unitOptions = unitsOfKind(unitKind[recipe.yieldUnit]);

    const update = (change: Partial<RecipeYield>) => onChange({ ...target, ...change });
    const onDecimal = (field: keyof RecipeYield) => (e: ChangeEvent<HTMLInputElement>) => {
        if (decimalPattern.test(e.target.value)) update({ [field]: e.target.value });
    };

    return (
        <Card className="mb-4 flex flex-wrap items-center gap-2">
            <span className="font-semibold text-header">Scale to</span>
            <input
                aria-label="Scale to amount"
                inputMode="decimal"
                className={`${smallInput} w-20 text-right`}
                value={target.yieldQuantity}
                onChange={onDecimal("yieldQuantity")}
            />
            {unitOptions.length > 1 ? (
                <select
                    aria-label="Scale to unit"
                    className={smallInput}
                    value={target.yieldUnit}
                    onChange={(e) => update({ yieldUnit: e.target.value as IngredientUnit })}
                >
                    {unitOptions.map((unit) => (
                        <option key={unit} value={unit}>
                            {unitLabel[unit]}
                        </option>
                    ))}
                </select>
            ) : (
                <span>{yieldUnitLabel(recipe)}</span>
            )}
            {recipe.tinShape && (
                <>
                    <span>in a</span>
                    <input
                        aria-label="Scale to tin size"
                        inputMode="decimal"
                        className={`${smallInput} w-16 text-right`}
                        value={target.tinSize}
                        onChange={onDecimal("tinSize")}
                    />
                    {target.tinShape === "rectangle" && (
                        <>
                            <span>×</span>
                            <input
                                aria-label="Scale to tin width"
                                inputMode="decimal"
                                className={`${smallInput} w-16 text-right`}
                                value={target.tinWidth}
                                onChange={onDecimal("tinWidth")}
                            />
                        </>
                    )}
                    <span>{lengthUnitLabel[recipe.tinUnit]}</span>
                    <select
                        aria-label="Scale to tin shape"
                        className={smallInput}
                        value={target.tinShape ?? ""}
                        onChange={(e) => update({ tinShape: e.target.value as TinShape })}
                    >
                        {tinShapes.map((shape) => (
                            <option key={shape} value={shape}>
                                {shape}
                            </option>
                        ))}
                    </select>
                    <span>tin</span>
                </>
            )}
            {scaleTo && (
                <>
                    <span className="ml-auto text-sm tabular-nums">×{formatQuantity(scale)}</span>
                    <Button
                        variant="secondary"
                        className="min-w-0 py-1"
                        onClick={() => onChange(null)}
                    >
                        Reset
                    </Button>
                </>
            )}
        </Card>
    );
}

export default RecipeScaleControl;
