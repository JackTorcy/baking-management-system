import type { ChangeEvent } from "react";
import {
    ingredientUnits,
    unitLabel,
    unitsOfKind,
    type IngredientUnit,
    type UnitKind,
} from "../types/Ingredient";
import {
    decimalPattern,
    lengthUnitLabel,
    tinShapes,
    type LengthUnit,
    type RecipeYield,
    type TinShape,
} from "../types/Recipe";

interface RecipeYieldFieldsProps {
    recipe: RecipeYield;
    lockedKind: UnitKind | null;
    error?: string;
    onChange: (change: Partial<RecipeYield>) => void;
}

const smallInput = "border border-border bg-surface rounded-2xl py-2 px-3";

function RecipeYieldFields({ recipe, lockedKind, error, onChange }: RecipeYieldFieldsProps) {
    const countsYield = recipe.yieldUnit === "item";
    const measuredUnits = lockedKind
        ? unitsOfKind(lockedKind)
        : ingredientUnits.filter((unit) => unit !== "item");

    const onDecimal = (field: keyof RecipeYield) => (e: ChangeEvent<HTMLInputElement>) => {
        if (decimalPattern.test(e.target.value)) onChange({ [field]: e.target.value });
    };

    return (
        <div>
            <label htmlFor="yieldQuantity" className="block mb-2">
                Makes
            </label>
            <div className="flex flex-wrap items-center gap-2">
                <input
                    id="yieldQuantity"
                    inputMode="decimal"
                    className={`${smallInput} w-20 text-right`}
                    value={recipe.yieldQuantity}
                    onChange={onDecimal("yieldQuantity")}
                />
                {!countsYield && (
                    <select
                        aria-label="Measured in"
                        className={smallInput}
                        value={recipe.yieldUnit}
                        onChange={(e) => onChange({ yieldUnit: e.target.value as IngredientUnit })}
                    >
                        {measuredUnits.map((unit) => (
                            <option key={unit} value={unit}>
                                {unitLabel[unit]}
                            </option>
                        ))}
                    </select>
                )}
                {countsYield && (
                    <>
                        <input
                            aria-label="What it makes"
                            placeholder="items, layers, loaves…"
                            maxLength={30}
                            className={`${smallInput} w-32`}
                            value={recipe.yieldLabel}
                            onChange={(e) => onChange({ yieldLabel: e.target.value })}
                        />
                        {recipe.tinShape && (
                            <>
                                <span>in a</span>
                                <input
                                    aria-label="Tin size"
                                    inputMode="decimal"
                                    className={`${smallInput} w-16 text-right`}
                                    value={recipe.tinSize}
                                    onChange={onDecimal("tinSize")}
                                />
                                {recipe.tinShape === "rectangle" && (
                                    <>
                                        <span>×</span>
                                        <input
                                            aria-label="Tin width"
                                            inputMode="decimal"
                                            className={`${smallInput} w-16 text-right`}
                                            value={recipe.tinWidth}
                                            onChange={onDecimal("tinWidth")}
                                        />
                                    </>
                                )}
                                <select
                                    aria-label="Tin size unit"
                                    className={smallInput}
                                    value={recipe.tinUnit}
                                    onChange={(e) =>
                                        onChange({ tinUnit: e.target.value as LengthUnit })
                                    }
                                >
                                    {Object.entries(lengthUnitLabel).map(([unit, label]) => (
                                        <option key={unit} value={unit}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </>
                        )}
                        <select
                            aria-label="Tin shape"
                            className={smallInput}
                            value={recipe.tinShape ?? ""}
                            onChange={(e) =>
                                onChange({ tinShape: (e.target.value || null) as TinShape | null })
                            }
                        >
                            <option value="">no tin</option>
                            {tinShapes.map((shape) => (
                                <option key={shape} value={shape}>
                                    {shape}
                                </option>
                            ))}
                        </select>
                        {recipe.tinShape && <span>tin</span>}
                    </>
                )}
            </div>
            {error && <span className="text-danger text-sm">{error}</span>}
            {lockedKind ? (
                <div className="text-sm">
                    Used in other recipes, so it stays measured by{" "}
                    {lockedKind === "count" ? "items" : lockedKind}
                </div>
            ) : (
                <button
                    type="button"
                    className="mt-1 text-sm text-primary-dark underline hover:text-primary"
                    onClick={() =>
                        onChange({ yieldUnit: countsYield ? "gram" : "item", tinShape: null })
                    }
                >
                    {countsYield
                        ? "Measure by weight or volume instead"
                        : "Measure by count instead"}
                </button>
            )}
        </div>
    );
}

export default RecipeYieldFields;
